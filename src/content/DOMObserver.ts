import { SiteConfig, type SiteSelectors } from "../shared/sites";
import { MUTATION_DEBOUNCE_MS } from "../shared/constants";
import type { MutationBatchClass } from "../shared/types";
import { logger } from "../shared/logger";
import { filterMessageTurns } from "../shared/messageTurnFilter";
import { AutoLoadScrollGate } from "./scroll/AutoLoadScrollGate";


export interface DOMObserverCallbacks {
    onMessagesAdded(elements: HTMLElement[]): void;
    onMessagesRemoved(elements: HTMLElement[]): void;
    onConversationChanged(): void;
    onMessagesReset(): void;
    getLastTrackedMessageId(): string | null;
    hasTrackedMessageId(id: string): boolean;
    onScrollToTop(): void;
    onObserverError(error: unknown, phase: string): void;
    onPageStateChanged?(elements: HTMLElement[]): void;
    shouldDeferBackgroundWork?(): boolean;
    onBackgroundWorkDeferred?(): void;
}

export interface DOMObserverDiagnostics {
    readonly lastBatchClass: MutationBatchClass | null;
    readonly lastBatchSize: number;
    readonly lastScannedNodeCount: number;
    readonly lastSkippedNodeCount: number;
    readonly lastDurationMs: number;
    readonly overBudgetCount: number;
}

const HEAVY_MUTATION_BATCH_SIZE = 50;
const EXTREME_MUTATION_BATCH_SIZE = 250;
const MUTATION_PROCESS_BUDGET_MS = 8;
const URL_CHANGE_DEBOUNCE_MS = 150;
const EXTENSION_OWNED_SELECTOR = ".acsb-load-more-btn,.acsb-status-indicator";
const COMPOSER_SELECTOR = "#prompt-textarea,textarea,[contenteditable]";
const TOOL_CALL_MUTATION_SELECTOR = [
    '[data-message-author-role="tool"]',
    '[data-testid*="tool" i]',
    '[class*="tool" i]',
].join(",");

export class DOMObserver {
    private observer: MutationObserver | null = null;
    private debounceTimer: ReturnType<typeof setTimeout> | null = null;
    private pendingMutations: MutationRecord[] = [];
    private readonly currentSite: SiteConfig;
    private readonly selectors: SiteSelectors;
    private readonly callbacks: DOMObserverCallbacks;
    private lastUrl = "";
    private pendingUrlChange: string | null = null;
    private urlChangeTimer: ReturnType<typeof setTimeout> | null = null;
    private urlPollTimer: ReturnType<typeof setInterval> | null = null;
    private totalMessages = 0;
    private visibleMessages = 0;
    private scrollEl: HTMLElement | null = null;
    private scrollRaf: number | null = null;
    private autoLoadEnabled = false;
    private scrollRetryTimer: ReturnType<typeof setInterval> | null = null;
    private readonly scrollGate = new AutoLoadScrollGate();

    private diagnostics: DOMObserverDiagnostics = {
        lastBatchClass: null,
        lastBatchSize: 0,
        lastScannedNodeCount: 0,
        lastSkippedNodeCount: 0,
        lastDurationMs: 0,
        overBudgetCount: 0,
    };

    constructor(currentSite: SiteConfig, callbacks: DOMObserverCallbacks) {
        this.currentSite = currentSite;
        this.selectors = currentSite.selectors;
        this.callbacks = callbacks;
        this.scrollEl = this.findScrollContainer();
    }

    start(): void {
        if (this.observer) {
            logger.warn("DOMObserver already running");
            return;
        }
        this.lastUrl = location.href;
        this.observer = new MutationObserver(this.handleMutations);
        this.observer.observe(document.body, { childList: true, subtree: true });

        // Detect SPA navigations (pushState / replaceState / popstate)
        window.addEventListener("popstate", this.handleNavigation);
        this.patchHistoryMethod("pushState");
        this.patchHistoryMethod("replaceState");

        // Fallback: poll for URL changes every 500ms in case patches miss something
        this.urlPollTimer = setInterval(() => this.checkUrlChange(), 500);

        logger.debug("DOMObserver started");
    }

    stop(): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
        this.pendingMutations = [];
        if (this.urlPollTimer) {
            clearInterval(this.urlPollTimer);
            this.urlPollTimer = null;
        }
        if (this.urlChangeTimer) {
            clearTimeout(this.urlChangeTimer);
            this.urlChangeTimer = null;
        }
        this.pendingUrlChange = null;
        window.removeEventListener("popstate", this.handleNavigation);
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        logger.debug("DOMObserver stopped");
    }

    queryAllMessages(): HTMLElement[] {
        return filterMessageTurns(
            Array.from(document.querySelectorAll<HTMLElement>(this.selectors.messageTurn)),
            this.selectors,
        );
    }

    getDiagnostics(): DOMObserverDiagnostics {
        return { ...this.diagnostics };
    }

    // Updates internal message counts based on the provided numbers.
    // Required for gating the scroll listener callback.
    updateMessageStats(total: number, visible: number): void {
        this.totalMessages = total;
        this.visibleMessages = visible;
    }

    SetAutoLoad(enable: boolean): void {
        if (this.autoLoadEnabled === enable) return;
        this.autoLoadEnabled = enable;

        if (this.autoLoadEnabled) {
            logger.debug("Auto-load enabled: will load one more message when user scrolls to top");
            this.attachScrollListener();
        } else {
            logger.debug("Auto-load disabled: will not load more messages on scroll");
            if (this.scrollRetryTimer) {
                clearInterval(this.scrollRetryTimer);
                this.scrollRetryTimer = null;
            }
            if (this.scrollEl) this.scrollEl.removeEventListener("scroll", this.handleScroll);
            if (this.scrollRaf) cancelAnimationFrame(this.scrollRaf);
            this.scrollRaf = null;
            this.scrollGate.reset();
        }
    }

    private attachScrollListener(): void {
        if (!this.scrollEl) this.scrollEl = this.findScrollContainer();
        if (this.scrollEl) {
            this.handleScroll();
            this.scrollEl.addEventListener("scroll", this.handleScroll, { passive: true });
            return;
        }
        // Scroll container not yet in the DOM (some sites load it asynchronously) — poll until found
        this.scrollRetryTimer = setInterval(() => {
            this.scrollEl = this.findScrollContainer();
            if (this.scrollEl) {
                clearInterval(this.scrollRetryTimer!);
                this.scrollRetryTimer = null;
                if (this.autoLoadEnabled) {
                    this.handleScroll();
                    this.scrollEl.addEventListener("scroll", this.handleScroll, { passive: true });
                }
            }
        }, 500);
    }

    resetAutoLoad(): void {
        if(this.autoLoadEnabled){
            logger.debug("Resetting auto-load state: temporarily disabling and re-enabling to reset internal state");
            this.scrollGate.reset();
            this.SetAutoLoad(false);
            this.SetAutoLoad(true);
        }
    }

    findScrollContainer(): HTMLElement | null {
        const primary = document.querySelector<HTMLElement>(this.selectors.scrollContainer);
        if (primary) return primary;
        if (this.selectors.scrollContainerAlt) {
            return document.querySelector<HTMLElement>(this.selectors.scrollContainerAlt);
        }
        return null;
    }

    private patchHistoryMethod(method: "pushState" | "replaceState"): void {
        const original = history[method].bind(history);
        history[method] = (...args: Parameters<typeof history.pushState>) => {
            original(...args);
            this.checkUrlChange();
        };
    }

    private checkUrlChange(): void {
        const current = location.href;
        if (current !== this.lastUrl) {
            this.pendingUrlChange = current;
            if (this.urlChangeTimer) clearTimeout(this.urlChangeTimer);
            this.urlChangeTimer = setTimeout(() => this.flushUrlChange(), URL_CHANGE_DEBOUNCE_MS);
        }
    }

    private flushUrlChange(): void {
        this.urlChangeTimer = null;
        const current = this.pendingUrlChange ?? location.href;
        this.pendingUrlChange = null;
        if (current === this.lastUrl) return;

        logger.debug(`URL changed: ${this.lastUrl} -> ${current}`);
        this.lastUrl = current;
        this.runCallback("conversation-changed", () => this.callbacks.onConversationChanged());
    }

    private readonly handleNavigation = (): void => {
        this.checkUrlChange();
    };

    private readonly handleMutations = (mutations: MutationRecord[]): void => {
        this.pendingMutations.push(...mutations);
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.flushPendingMutations(), MUTATION_DEBOUNCE_MS);
    };

    private flushPendingMutations(): void {
        if (this.callbacks.shouldDeferBackgroundWork?.()) {
            this.callbacks.onBackgroundWorkDeferred?.();
            this.debounceTimer = setTimeout(() => this.flushPendingMutations(), MUTATION_DEBOUNCE_MS);
            return;
        }

        const batch = this.pendingMutations;
        this.pendingMutations = [];
        this.processMutations(batch);
    }

    private processMutations(mutations: MutationRecord[]): void {
        const startedAt = performance.now();
        const batchClass = this.classifyMutationBatch(mutations);
        const scannedNodes = new WeakSet<HTMLElement>();
        const addedMessages: HTMLElement[] = [];
        const removedMessages: HTMLElement[] = [];
        const pageStateElements: HTMLElement[] = [];
        let scannedNodeCount = 0;
        let skippedNodeCount = 0;

        for (const mutation of mutations) {
            if (this.isToolCallOnlyMutation(mutation)) {
                skippedNodeCount += mutation.addedNodes.length + mutation.removedNodes.length;
                continue;
            }

            for (const node of mutation.addedNodes) {
                if (!(node instanceof HTMLElement)) continue;
                if (this.isComposerOwned(node)) {
                    skippedNodeCount += 1;
                    continue;
                }
                pageStateElements.push(node);
                const collected = this.collectMessageTurns(node, scannedNodes);
                addedMessages.push(...collected.elements);
                scannedNodeCount += collected.scanned;
                skippedNodeCount += collected.skipped;
            }

            for (const node of mutation.removedNodes) {
                if (!(node instanceof HTMLElement)) continue;
                if (this.isComposerOwned(node)) {
                    skippedNodeCount += 1;
                    continue;
                }
                const collected = this.collectMessageTurns(node, scannedNodes);
                removedMessages.push(...collected.elements);
                scannedNodeCount += collected.scanned;
                skippedNodeCount += collected.skipped;
            }
        }

        this.recordMutationDiagnostics(
            batchClass,
            mutations.length,
            scannedNodeCount,
            skippedNodeCount,
            performance.now() - startedAt,
        );

        // Stable queries the live DOM on every pass, so mutation batches do not
        // need a message-query cache invalidation step.

        if (pageStateElements.length > 0) {
            this.runCallback("page-state-changed", () => this.callbacks.onPageStateChanged?.(pageStateElements));
        }

        // Conversation changes are detected via URL monitoring (pushState,
        // replaceState, popstate, polling).  The previous DOM-based
        // "isConversationContainer" heuristic (checking if any added/removed
        // node contained 2+ message turns) caused duplicate change events
        // and race conditions during SPA navigations.

        if (addedMessages.length > 2 && this.currentSite.isDynamic && this.autoLoadEnabled) { 
        // If a large batch of messages is added at once, it's likely a dynamic
        // loading scenario (e.g. Gemini) where the existing message tracking can get out of sync, so we trigger a full reset to be safe

        // Only apply this heuristic for sites known to have dynamic loading (e.g. Gemini),
        // to avoid unnecessary resets on more static sites where the existing mutation handling is sufficient
            logger.debug(`Detected ${addedMessages.length} new messages, triggering full reset`);
            this.runCallback("messages-reset-added", () => this.callbacks.onMessagesReset());
        } else if (addedMessages.length > 0) {
            logger.debug(`${addedMessages.length} message turn(s) added`);
            this.runCallback("messages-added", () => this.callbacks.onMessagesAdded(addedMessages));
        }

        if (removedMessages.length > 0) {
            logger.debug(`${removedMessages.length} message turn(s) removed out of ${this.totalMessages} total tracked messages`);
            this.runCallback("messages-removed", () => this.callbacks.onMessagesRemoved(removedMessages));
            // If essentially every tracked turn is removed in one batch it's a
            // re-render of the whole thread (e.g. the ChatGPT + Excel-table
            // collapse bug), so trigger a full reset to keep tracking aligned.
            // Guard on totalMessages > 0 so this never fires before the first
            // refreshUI has populated the count (totalMessages starts at 0,
            // which would otherwise make ANY removal look like a full wipe).
            if (this.totalMessages > 0 && removedMessages.length >= this.totalMessages) {
                logger.debug(`Detected ${removedMessages.length} removed messages, triggering full reset`);
                this.runCallback("messages-reset-removed", () => this.callbacks.onMessagesReset());
            }
        }
    }

    private runCallback(phase: string, callback: () => void): void {
        try {
            callback();
        } catch (error) {
            logger.error(`DOMObserver callback failed during ${phase}`, error);
            this.callbacks.onObserverError(error, phase);
        }
    }

    private isToolCallOnlyMutation(mutation: MutationRecord): boolean {
        const target = mutation.target instanceof HTMLElement ? mutation.target : null;
        if (!target?.closest(TOOL_CALL_MUTATION_SELECTOR)) return false;
        const nodes = [...mutation.addedNodes, ...mutation.removedNodes];
        return nodes.every((node) => node instanceof HTMLElement && node.closest(TOOL_CALL_MUTATION_SELECTOR) !== null);
    }

    private collectMessageTurns(
        root: HTMLElement,
        scannedNodes: WeakSet<HTMLElement>,
    ): { elements: HTMLElement[]; scanned: number; skipped: number } {
        if (this.isExtensionOwned(root) || this.isComposerOwned(root) || scannedNodes.has(root)) {
            return { elements: [], scanned: 0, skipped: 1 };
        }

        scannedNodes.add(root);
        if (this.isMessageTurn(root)) {
            if (filterMessageTurns([root], this.selectors).length === 0) {
                return { elements: [], scanned: 1, skipped: 1 };
            }
            return { elements: [root], scanned: 1, skipped: 0 };
        }

        const elements: HTMLElement[] = [];
        let scanned = 1;
        let skipped = 0;
        const candidates = filterMessageTurns(
            Array.from(root.querySelectorAll<HTMLElement>(this.selectors.messageTurn)),
            this.selectors,
        );
        for (const element of this.dedupeNestedMessageTurns(candidates)) {
            if (this.isExtensionOwned(element) || scannedNodes.has(element)) {
                skipped += 1;
                continue;
            }
            scannedNodes.add(element);
            scanned += 1;
            elements.push(element);
        }
        return { elements, scanned, skipped };
    }

    private dedupeNestedMessageTurns(elements: HTMLElement[]): HTMLElement[] {
        return elements.filter((element) => !elements.some((candidate) => candidate !== element && candidate.contains(element)));
    }

    private classifyMutationBatch(mutations: MutationRecord[]): MutationBatchClass {
        if (mutations.length >= EXTREME_MUTATION_BATCH_SIZE) return "extreme";
        if (mutations.length >= HEAVY_MUTATION_BATCH_SIZE) return "heavy";
        return "small";
    }

    private recordMutationDiagnostics(
        batchClass: MutationBatchClass,
        batchSize: number,
        scannedNodeCount: number,
        skippedNodeCount: number,
        durationMs: number,
    ): void {
        const overBudget = durationMs > MUTATION_PROCESS_BUDGET_MS;
        this.diagnostics = {
            lastBatchClass: batchClass,
            lastBatchSize: batchSize,
            lastScannedNodeCount: scannedNodeCount,
            lastSkippedNodeCount: skippedNodeCount,
            lastDurationMs: durationMs,
            overBudgetCount: this.diagnostics.overBudgetCount + (overBudget ? 1 : 0),
        };
        if (overBudget || batchClass !== "small") {
            logger.debug(
                `Mutation batch ${batchClass}: ${batchSize} record(s), ` +
                `${scannedNodeCount} scanned, ${skippedNodeCount} skipped, ${durationMs.toFixed(1)}ms`,
            );
        }
    }

    private isExtensionOwned(el: HTMLElement): boolean {
        return el.closest(EXTENSION_OWNED_SELECTOR) !== null;
    }

    private isComposerOwned(el: HTMLElement): boolean {
        return el.closest(COMPOSER_SELECTOR) !== null;
    }

    private isMessageTurn(el: HTMLElement): boolean {
        return el.matches?.(this.selectors.messageTurn) ?? false;
    }

    private readonly handleScroll = (): void => {
        if (this.scrollRaf) cancelAnimationFrame(this.scrollRaf);
        if (this.visibleMessages >= this.totalMessages) return;

        this.scrollRaf = requestAnimationFrame(() => {
            const el = this.scrollEl ?? this.findScrollContainer();
            if (!el) return;

            const shouldReveal = this.scrollGate.shouldRevealOlderTurn({
                scrollTop: el.scrollTop,
                scrollHeight: el.scrollHeight,
                clientHeight: el.clientHeight,
                totalMessages: this.totalMessages,
                visibleMessages: this.visibleMessages,
            });
            if (shouldReveal) this.callbacks.onScrollToTop();
        });
    };
}
