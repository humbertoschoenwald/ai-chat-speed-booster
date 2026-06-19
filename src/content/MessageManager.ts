import type {
    ExtensionConfig,
    TrackedMessage,
    ExtensionStatus,
} from "../shared/types";
import { DEFAULT_CONFIG, DATA_ATTR } from "../shared/constants";
import { logger } from "../shared/logger";

/** Injected once into <head> — all hiding is done via this class. */
const HIDE_CLASS = "acsb-hidden";
let styleInjected = false;
function injectHideStyle(): void {
    if (styleInjected) return;
    styleInjected = true;
    const style = document.createElement("style");
    // Keep visible managed turns in normal provider layout. Only offscreen
    // managed turns receive bounded placeholder sizing.
    style.textContent = `[${DATA_ATTR}].${HIDE_CLASS}{content-visibility:hidden!important;contain-intrinsic-size:1px 240px!important;overflow:hidden!important;pointer-events:none!important}` +
        `[${DATA_ATTR}].${HIDE_CLASS}>*{visibility:hidden!important}`;
    (document.head ?? document.documentElement).appendChild(style);
}

export class MessageManager {
    private messages: TrackedMessage[] = [];
    private config: ExtensionConfig = { ...DEFAULT_CONFIG };
    private messageIdAttribute = "data-testid";
    private cachedVisibleCount: number = 0;
    /** O(1) element → TrackedMessage lookup (avoids .find() scans). */
    private elementMap = new Map<HTMLElement, TrackedMessage>();
    /** O(1) id → TrackedMessage lookup for DOMObserver dedupe checks. */
    private idMap = new Map<string, TrackedMessage>();
    /** First visible index in the contiguous stable-mode window. */
    private firstVisibleIndex = 0;
    private visibleCounter = 0;
    private legacyRevealLoopCount = 0;
    private legacyLastRevealLoopAt: number | null = null;

    private get visibleCount(): number {
        return this.visibleCounter;
    }

    setMessageIdAttribute(attr: string): void {
        this.messageIdAttribute = attr;
    }

    updateConfig(config: ExtensionConfig): void {
        this.config = { ...config };
        this.recalculateVisibility();
    }

    initialise(elements: HTMLElement[]): void {
        injectHideStyle();
        this.messages = [];
        this.elementMap.clear();
        this.idMap.clear();
        this.firstVisibleIndex = 0;
        this.visibleCounter = 0;
        for (const el of elements) this.trackElement(el);
        this.recalculateVisibility();
        logger.debug(`initialised with ${this.messages.length} messages`);
    }

    addMessages(elements: HTMLElement[]): void {
        for (const el of elements) {
            if (this.elementMap.has(el)) continue;
            this.trackElement(el);
        }
        this.recalculateVisibility();
    }

    removeMessages(elements: HTMLElement[]): void {
        const removed = new Set(elements);
        this.messages = this.messages.filter((m) => {
            if (removed.has(m.element)) {
                this.elementMap.delete(m.element);
                this.idMap.delete(m.id);
                if (m.visible) this.visibleCounter--;
                return false;
            }
            return true;
        });
        this.firstVisibleIndex = this.messages.findIndex((m) => m.visible);
        if (this.firstVisibleIndex < 0) this.firstVisibleIndex = this.messages.length;
    }

    loadMore(toLoad?: number): number {
        if (!this.config.enabled || this.firstVisibleIndex <= 0) return 0;
        const requestedTurns = toLoad ?? this.config.loadMoreBatchSize;
        const requestedElements = Math.max(1, requestedTurns) * 2;
        const revealStart = Math.max(0, this.firstVisibleIndex - requestedElements);
        let revealed = 0;

        for (let i = revealStart; i < this.firstVisibleIndex; i++) {
            const msg = this.messages[i];
            if (!msg || msg.visible) continue;
            this.showMessage(msg);
            revealed++;
        }

        this.firstVisibleIndex = revealStart;
        this.cachedVisibleCount = this.visibleCount;
        logger.debug(`revealed ${revealed} additional messages`);
        return revealed;
    }

    hasHiddenMessages(): boolean {
        return this.visibleCounter < this.messages.length;
    }

    getStatus(): ExtensionStatus {
        const total = this.messages.length;
        const visible = this.visibleCount;
        return {
            enabled: this.config.enabled,
            totalMessages: total,
            visibleMessages: visible,
            hiddenMessages: total - visible,
            showStatus: this.config.showStatus,
            statusPosition: this.config.statusPosition,
            legacyRevealLoopCount: this.legacyRevealLoopCount,
            legacyLastRevealLoopAt: this.legacyLastRevealLoopAt,
        };
    }

    /**
     * Tears down internal tracking state.
     * @param restoreDOM - If true (default), un-hides all messages and removes
     *   tracking attributes.  Pass false during SPA navigation where the old
     *   DOM nodes are about to be removed by the framework anyway — this
     *   avoids a visible flash of all messages before the new conversation
     *   renders.
     */
    destroy(restoreDOM = true): void {
        if (restoreDOM) {
            for (const msg of this.messages) {
                this.showMessage(msg);
                msg.element.removeAttribute(DATA_ATTR);
            }
        }
        this.messages = [];
        this.elementMap.clear();
        this.idMap.clear();
        this.firstVisibleIndex = 0;
        this.visibleCounter = 0;
        this.cachedVisibleCount = 0;
        logger.debug("MessageManager destroyed");
    }

    private trackElement(el: HTMLElement): void {
        const id = this.deriveId(el);
        const msg: TrackedMessage = { id, element: el, visible: true };
        this.messages.push(msg);
        this.elementMap.set(el, msg);
        this.idMap.set(id, msg);
        this.visibleCounter++;
        el.setAttribute(DATA_ATTR, id);
    }

    private recalculateVisibility(): void {
        injectHideStyle();
        if (!this.config.enabled || !this.config.hideOldMessages) {
            // Filtering off: leave the DOM intact and let the site handle
            // its own virtualization. Fast Mode still trims the API payload.
            for (const msg of this.messages) this.showMessage(msg);
            this.firstVisibleIndex = 0;
            return;
        }
        const limit = Math.max(this.cachedVisibleCount, this.config.visibleMessageLimit * 2);
        const total = this.messages.length;
        const firstVisible = Math.max(0, total - limit);

        for (let i = 0; i < total; i++) {
            const msg = this.messages[i];
            if (i < firstVisible) {
                this.hideMessage(msg);
            } else {
                this.showMessage(msg);
            }
        }
        this.firstVisibleIndex = firstVisible;
    }

    private hideMessage(msg: TrackedMessage): void {
        if (!msg.visible) {
            if (!msg.element.classList.contains(HIDE_CLASS)) {
                this.recordLegacyRevealLoop();
                msg.element.classList.add(HIDE_CLASS);
                msg.element.setAttribute("aria-hidden", "true");
            }
            return;
        }
        msg.visible = false;
        this.visibleCounter--;
        msg.element.classList.add(HIDE_CLASS);
        msg.element.setAttribute("aria-hidden", "true");
    }

    private showMessage(msg: TrackedMessage): void {
        if (msg.visible) return; // already visible — skip DOM write
        msg.visible = true;
        this.visibleCounter++;
        msg.element.classList.remove(HIDE_CLASS);
        msg.element.removeAttribute("aria-hidden");
    }

    private recordLegacyRevealLoop(): void {
        this.legacyRevealLoopCount += 1;
        this.legacyLastRevealLoopAt = Date.now();
    }

    private deriveId(el: HTMLElement): string {
        const attributes = [
            this.messageIdAttribute,
            "data-turn-id-container",
            "data-turn-id",
            "data-testid",
            "data-message-id",
        ];
        for (const attr of attributes) {
            if (!attr) continue;
            const attrValue = el.getAttribute(attr);
            if (attrValue) return attrValue;
        }
        return `msg-${this.messages.length}-${Date.now()}`;
    }

    /**
     * Anchor id for incremental DOMObserver turn resolution.
     */
    getLastTrackedMessageId(): string | null {
        const last = this.messages[this.messages.length - 1];
        return last?.id ?? null;
    }

    /**
     * Used by DOMObserver to prevent re-adding already tracked turns.
     */
    hasTrackedMessageId(id: string): boolean {
        return this.idMap.has(id);
    }
}
