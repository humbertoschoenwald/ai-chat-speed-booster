/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: bootstrap the content script and connect generic runtime slices.
 * Boundary: provider-specific ChatGPT behavior stays behind ChatGptContentRuntime.
 * ADR: docs/adr/architecture/native-mode/mode-boundary.md.
 */
import { DOMObserver } from "./DOMObserver";
import { MessageManager } from "./MessageManager";
import { RequestLifecycleTracker } from "./RequestLifecycleTracker";
import { LoadMoreButton, StatusIndicator } from "./UIComponents";

import { ContentBootstrapLease } from "./runtime/ContentBootstrapLease";
import { ContentReloadCoordinator } from "./runtime/ContentReloadCoordinator";
import { ContentTimerRegistry } from "./runtime/ContentTimerRegistry";
import { createExtensionStatus, type ContentStatusPresenterInput } from "./status/ContentStatusPresenter";
import { detectCurrentSite, type SiteConfig } from "../shared/sites";
import { deriveRuntimeConfigForSite } from "../shared/native-runtime-policy";
import { loadConfig, onConfigChanged } from "../shared/storage";
import { onMessage } from "../shared/browser-api";
import { filterMessageTurns } from "../shared/messageTurnFilter";
import {
    MessageType,
    type ContentLifecycleState,
    type ExtensionConfig,
    type ExtensionStatus,
} from "../shared/types";
import { logger } from "../shared/logger";

const bootstrapLease = new ContentBootstrapLease({ document });
const reloadCoordinator = new ContentReloadCoordinator({
    reload: () => window.location.reload(),
});
const timers = new ContentTimerRegistry();

let config: ExtensionConfig;
let currentSite: SiteConfig;
const messageManager = new MessageManager();
let editorLatencyGuard: EditorLatencyGuardPort = createStableEditorLatencyGuard();
let requestLifecycleTracker: RequestLifecycleTracker | null = null;
let loadMoreButton: LoadMoreButton;
let statusIndicator: StatusIndicator;
let domObserver: DOMObserver;
let nativeModeController: NativeModeControllerPort | null = null;
let chatGptRuntime: ChatGptRuntimePort | null = null;
const contentBootTime = Date.now();
let contentLifecycleState: ContentLifecycleState = "initializing";
let contentLastUiRefreshAt: number | null = null;
let contentLastRecoverableErrorClass: string | null = null;
const FETCH_TRIMMED_ATTR = "data-acsb-trimmed" as const;

type EditorLatencyGuardPort = {
    start(): void;
    stop(): void;
    shouldDeferBackgroundWork(): boolean;
    deferTask(): void;
    snapshot(): ContentStatusPresenterInput["editorInput"];
};

type NativeModeControllerPort = {
    updateConfig(config: ExtensionConfig): void;
    shouldDeferBackgroundWork(): boolean;
    deferBackgroundWork(): void;
    protectBackgroundWork(reason: string, durationMs: number): void;
    snapshot(): NonNullable<ContentStatusPresenterInput["nativeState"]>;
    stop(reason: string): void;
};

type ChatGptRuntimePort = {
    updateConfig(config: ExtensionConfig): void;
    invalidateTurnVisibility(): void;
    resetNativeTracking(): void;
    inspectPage(): NonNullable<ContentStatusPresenterInput["chatGptInspection"]>;
    getDisplayStatus(status: ExtensionStatus): ExtensionStatus;
    scheduleNativeScrollWork(controller: NativeModeControllerPort | null): void;
    snapshot(): NonNullable<ContentStatusPresenterInput["chatGptStatus"]>;
    dispose(): void;
};

function createStableEditorLatencyGuard(): EditorLatencyGuardPort {
    return {
        start: () => {},
        stop: () => {},
        shouldDeferBackgroundWork: () => false,
        deferTask: () => {},
        snapshot: () => ({
            active: false,
            composing: false,
            deferredTaskCount: 0,
            eventCount: 0,
            lastEventType: null,
            lastEventAt: null,
            protectedUntilMs: null,
            lastPasteLength: null,
            lastPasteChunkCount: null,
        }),
    };
}

async function initialiseNativeControllerIfNeeded(): Promise<void> {
    if (config.performanceMode !== "native") return;
    const [{ EditorInputOptimizer }, { NativeModeController }] = await Promise.all([
        import("./native/EditorInputOptimizer"),
        import("./native/NativeModeController"),
    ]);
    editorLatencyGuard.stop();
    editorLatencyGuard = new EditorInputOptimizer();
    editorLatencyGuard.start();
    nativeModeController = new NativeModeController(currentSite);
    nativeModeController.updateConfig(config);
}

async function initialiseChatGptNativeRuntimeIfNeeded(): Promise<void> {
    if (config.performanceMode !== "native" || currentSite.id !== "chatgpt") return;
    const { ChatGptContentRuntime } = await import("./native/chatgpt/ChatGptContentRuntime");
    chatGptRuntime = new ChatGptContentRuntime({
        document,
        window,
        queryTurns: () => domObserver.queryAllMessages(),
        findScrollContainer: () => domObserver.findScrollContainer(),
        onViewportResize: handleViewportResize,
        onRecoverableError: (errorClass: string | null) => {
            contentLastRecoverableErrorClass = errorClass;
        },
    });
    chatGptRuntime.updateConfig(config);
}

async function bootstrap(): Promise<void> {
    const site = detectCurrentSite();
    if (!site) {
        contentLifecycleState = "unsupported";
        logger.info("no supported site detected, content script inactive");
        return;
    }
    const ownership = bootstrapLease.acquire();
    if (!ownership.acquire) {
        logger.warn("content script bootstrap skipped because another ACSB instance owns this page");
        return;
    }
    if (ownership.reason === "stale-owner") {
        logger.warn("content script taking over stale ACSB bootstrap ownership");
    }
    contentLifecycleState = "initializing";
    currentSite = site;
    logger.info(`bootstrapping content script for ${currentSite.name}`);

    config = deriveRuntimeConfigForSite(await loadConfig(), currentSite.id);
    requestLifecycleTracker = new RequestLifecycleTracker(currentSite.id, currentSite.selectors.userMessageSelector);
    await initialiseNativeControllerIfNeeded();
    messageManager.updateConfig(config);
    if (currentSite.messageIdAttribute) {
        messageManager.setMessageIdAttribute(currentSite.messageIdAttribute);
    }
    messageManager.setMessageUnitSize(currentSite.messageUnit?.elementsPerMessage ?? 1);

    loadMoreButton = new LoadMoreButton(handleLoadMore, currentSite);
    statusIndicator = new StatusIndicator(currentSite);

    if (!config.showStatus) statusIndicator.hide();

    domObserver = new DOMObserver(currentSite, {
        onMessagesAdded: handleMessagesAdded,
        onMessagesRemoved: handleMessagesRemoved,
        onConversationChanged: handleConversationChanged,
        onMessagesReset: handleMessagesReset,
        getLastTrackedMessageId: () => messageManager.getLastTrackedMessageId(),
        hasTrackedMessageId: (id: string) =>
            messageManager.hasTrackedMessageId(id),
        onScrollToTop: loadOneMoreMessage,
        onObserverError: handleObserverError,
        onPageStateChanged: handlePageStateChanged,
        shouldDeferBackgroundWork: () => editorLatencyGuard.shouldDeferBackgroundWork() || (nativeModeController?.shouldDeferBackgroundWork() ?? false),
        onBackgroundWorkDeferred: () => {
            editorLatencyGuard.deferTask();
            nativeModeController?.deferBackgroundWork();
        },
    });
    await initialiseChatGptNativeRuntimeIfNeeded();

    domObserver.start();
    domObserver.SetAutoLoad(config.autoLoad);
    scheduleInitialScan();
    onConfigChanged(handleConfigUpdated);
    onMessage(handleExtensionMessage);
    window.addEventListener("pageshow", handlePageResume);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityResume);
    document.addEventListener("click", cancelDeliveryTimeoutRefresh, true);
    document.addEventListener("keydown", cancelDeliveryTimeoutRefresh, true);

}
/**
 * Waits for the first conversation turns to appear before initialising manager/UI.
 */
function scheduleInitialScan(): void {
    const attempt = (): void => {
        const existing = domObserver.queryAllMessages();
        if (existing.length > 0) {
            messageManager.initialise(existing);
            contentLifecycleState = "active";
            refreshUI();
            logger.info(`initial scan: ${existing.length} messages`);
            // Moved the log here so it runs after actually finding messages.
            setTimeout(() => {
                const msgs = domObserver.queryAllMessages();
                const scrollEl = domObserver.findScrollContainer();
                console.log(
                    `[AI Chat Speed Booster] Site: ${currentSite.name} | ` +
                    `Selector: "${currentSite.selectors.messageTurn}" → ${msgs.length} match(es) | ` +
                    `Scroll container: ${scrollEl ? "found" : "NOT found"} | ` +
                    `Is Dynamic: ${currentSite.isDynamic ? "Yes" : "No"}`,
                );
            }, 100);
            // After hiding old messages, scroll the container to the bottom so
            // the user always sees the most recent turn.  Only needed for sites
            // that don't support CSS scroll anchoring (e.g. Gemini's custom
            // infinite-scroller element).  ChatGPT and Claude manage their own
            // scroll position and will fight a forced scroll, causing layout
            // issues or even triggering a full re-render.
            if (currentSite.id === "chatgpt" || currentSite.isDynamic) {
                [0, 50, 150, 350].forEach((delayMs) => {
                    window.setTimeout(() => {
                        requestAnimationFrame(() => {
                            const scrollEl = domObserver.findScrollContainer();
                            if (scrollEl) {
                                scrollEl.scrollTop = scrollEl.scrollHeight;
                            } else {
                                window.scrollTo(0, document.body.scrollHeight);
                            }
                        });
                    }, delayMs);
                });
            }
            return;
        }
        setTimeout(attempt, 100);
    };
    attempt();
}

/**
 * Incremental path for newly appended turns detected by DOMObserver.
 */
function handleMessagesAdded(elements: HTMLElement[]): void {
    nativeModeController?.protectBackgroundWork("messages-added", 1_000);
    chatGptRuntime?.invalidateTurnVisibility();
    messageManager.addMessages(elements);
    refreshUI();
    countNewUserRequests(elements);
}

function countNewUserRequests(elements: HTMLElement[]): void {
    requestLifecycleTracker?.observeAddedTurns(elements);
}

function handlePageStateChanged(elements: HTMLElement[]): void {
    const tracker = requestLifecycleTracker;
    if (!tracker) return;
    for (const element of elements) tracker.observeFailureState(element);
}

/**
 * Cleans up removed turn references to keep manager state aligned with DOM.
 */
function handleMessagesRemoved(elements: HTMLElement[]): void {
    chatGptRuntime?.invalidateTurnVisibility();
    requestLifecycleTracker?.observeRemovedTurns(elements);
    messageManager.removeMessages(elements);
    refreshUI();
}

/**
 * Handles in-DOM conversation navigation by rebuilding observer + state against
 * the newly rendered thread without requiring a full page refresh.
 */
function handleConversationChanged(): void {
    nativeModeController?.protectBackgroundWork("conversation-changed", 1_000);
    chatGptRuntime?.resetNativeTracking();
    contentLifecycleState = "recovering";
    logger.debug("conversation changed, re-initialising");

    document.documentElement.removeAttribute(FETCH_TRIMMED_ATTR);
    requestLifecycleTracker?.reset();

    timers.clear("conversation-retry");

    // Don't restore DOM visibility — the old nodes are about to be removed
    // by the framework.  Un-hiding them would cause a flash of all messages.
    messageManager.destroy(false);
    loadMoreButton.hide();
    statusIndicator.hide();

    // Initialise immediately if messages are already in the DOM (common with
    // cached fetch responses that return instantly).  Stale messages from the
    // previous conversation that haven't been unmounted yet are harmless:
    // they sit at the start of the array and recalculateVisibility keeps the
    // last N visible.  Once React removes them, handleMessagesRemoved cleans up.
    let retries = 0;
    const maxRetries = 20;
    const attempt = (): void => {
        const messages = domObserver.queryAllMessages();

        if (messages.length > 0 || retries >= maxRetries) {
            messageManager.initialise(messages);
            contentLifecycleState = messages.length > 0 ? "active" : "degraded";
            if (messages.length === 0) {
                contentLastRecoverableErrorClass = "conversation-empty-after-retry";
            }
            refreshUI();
            if (messages.length > 0) {
                logger.debug(`re-initialised with ${messages.length} messages after ${retries} retries`);
            }
            return;
        }
        retries++;
        timers.set("conversation-retry", attempt, 300);
    };
    // Try immediately — with cached responses messages may already be rendered.
    // Fall back to polling if the DOM is empty (server fetch still in-flight).
    attempt();
}

function handleConfigUpdated(newConfig: ExtensionConfig): void {
    const previousMode = config.performanceMode;
    config = deriveRuntimeConfigForSite(newConfig, currentSite.id);
    const modeChanged = previousMode !== config.performanceMode;
    nativeModeController?.updateConfig(config);
    chatGptRuntime?.updateConfig(config);
    messageManager.updateConfig(config);
    refreshUI();
    if (modeChanged) reloadCoordinator.scheduleModeSwitchReload();
    logger.debug("config updated from external source");
}

function handlePageResume(): void {
    queueResumeHealthCheck("pageshow");
}

function handleWindowFocus(): void {
    queueResumeHealthCheck("focus");
}

function handleVisibilityResume(): void {
    if (document.visibilityState === "visible") {
        queueResumeHealthCheck("visibilitychange");
    }
}

function handleViewportResize(): void {
    nativeModeController?.protectBackgroundWork("viewport-resize", 250);
    chatGptRuntime?.invalidateTurnVisibility();
    timers.set("viewport-resize", () => {
        refreshUI();
    }, 250);
}

function queueResumeHealthCheck(reason: string): void {
    if (contentLifecycleState === "stopped") return;
    timers.set("resume-health-check", () => {
        runResumeHealthCheck(reason);
    }, 120);
}

function runResumeHealthCheck(reason: string): void {
    try {
        nativeModeController?.updateConfig(config);
        const status = messageManager.getStatus();
        const overlayMissing = config.showStatus && status.totalMessages > 0 && !statusIndicator.isMounted();
        if (contentLifecycleState === "active" && !overlayMissing) {
            refreshUI();
            return;
        }

        contentLifecycleState = "recovering";
        const messages = domObserver.queryAllMessages();
        if (messages.length > 0) {
            messageManager.initialise(messages);
            contentLifecycleState = "active";
            contentLastRecoverableErrorClass = null;
        } else {
            contentLifecycleState = "degraded";
            contentLastRecoverableErrorClass = `${reason}-empty`;
        }
        refreshUI();
    } catch (error) {
        contentLifecycleState = "degraded";
        contentLastRecoverableErrorClass = error instanceof Error ? error.name : "resume-health-check-error";
        logger.error("resume health check failed", error);
    }
}

/**
 * Resets message manager and UI state when a large batch of messages is added at once, which is a strong signal
 * that the conversation thread was re-rendered from scratch (e.g. due to a significant navigation or dynamic loading event)
 * and incremental mutation handling can't keep up with the changes.
 */
function handleObserverError(error: unknown, phase: string): void {
    contentLifecycleState = "degraded";
    const errorClass = error instanceof Error ? error.name : "observer-callback-error";
    contentLastRecoverableErrorClass = `${phase}:${errorClass}`;
    refreshUI();
}

function handleMessagesReset(): void {
    nativeModeController?.protectBackgroundWork("messages-reset", 1_000);
    chatGptRuntime?.resetNativeTracking();
    contentLifecycleState = "recovering";
    logger.debug("large batch detected, re-initialising message manager");
    messageManager.destroy();
    loadMoreButton.hide();
    const messages = domObserver.queryAllMessages();
    messageManager.initialise(messages);
    contentLifecycleState = "active";
    domObserver.resetAutoLoad(); // Reset auto-load state to prevent it from getting stuck after a reset
    refreshUI();
    // Do NOT scroll here — the user is actively reading a streaming response.
    // Any forced scroll would jump away from the content they are watching.
}

function handleExtensionMessage(message: unknown): ExtensionStatus | undefined {
    const msg = message as { type?: string; payload?: unknown };
    if (msg.type === MessageType.GET_STATUS) {
        return createExtensionStatus({
            baseStatus: getDisplayStatus(messageManager.getStatus()),
            siteId: currentSite.id,
            performanceMode: config.performanceMode,
            lifecycle: {
                state: contentLifecycleState,
                bootTime: contentBootTime,
                lastUiRefreshAt: contentLastUiRefreshAt,
                overlayPresent: statusIndicator.isMounted(),
                lastRecoverableErrorClass: contentLastRecoverableErrorClass,
            },
            nativeState: nativeModeController?.snapshot(),
            editorInput: editorLatencyGuard.snapshot(),
            observer: domObserver.getDiagnostics(),
            chatGptInspection: chatGptRuntime?.inspectPage(),
            chatGptStatus: chatGptRuntime?.snapshot(),
        });
    }
    // Background also broadcasts CONFIG_UPDATED here (in addition to the
    // storage-change listener) so config changes still propagate if storage
    // events are missed.
    if (msg.type === MessageType.CONFIG_UPDATED && msg.payload) {
        handleConfigUpdated(msg.payload as ExtensionConfig);
    }
    return undefined;
}

/**
 * Reveals older hidden turns and refreshes status positioning after layout settles.
 * Exhausted stable batches hide the control; they never trigger a page reload.
 */
function handleLoadMore(): void {
    const previousFirstVisible = findFirstVisibleMessage();
    const previousTop = previousFirstVisible?.getBoundingClientRect().top ?? null;
    const revealed = messageManager.loadMore();
    refreshUI();
    if (revealed > 0 && previousFirstVisible && previousTop !== null) {
        preserveViewportAnchor(previousFirstVisible, previousTop);
    }
}

/**
 * Reveals one additional conversation turn, used for auto-loading when the user scrolls to the top.
 */
function loadOneMoreMessage(): void {
    if (!config.autoLoad) return;
    messageManager.loadMore(1);
    refreshUI();
}

/**
 * Central renderer for load-more and status-indicator visibility states.
 */
let rafPending = false;
function getDisplayStatus(status: ExtensionStatus): ExtensionStatus {
    if (config.performanceMode !== "native") return status;
    return chatGptRuntime?.getDisplayStatus(status) ?? status;
}

function refreshUI(): void {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
        rafPending = false;
        contentLastUiRefreshAt = Date.now();
        const status = messageManager.getStatus();
        const displayStatus = getDisplayStatus(status);
        const chatGptInspection = chatGptRuntime?.inspectPage();
        if (chatGptInspection) {
            const deliveryTimeout = chatGptInspection.deliveryTimeout;
            if (deliveryTimeout.detected) {
                contentLifecycleState = "degraded";
                contentLastRecoverableErrorClass = `chatgpt-delivery-timeout:${deliveryTimeout.confidence}`;
                scheduleDeliveryTimeoutRefresh(deliveryTimeout.reason);
            } else if (contentLastRecoverableErrorClass?.startsWith("chatgpt-delivery-timeout:")) {
                cancelDeliveryTimeoutRefresh();
                contentLastRecoverableErrorClass = null;
                contentLifecycleState = "active";
            }
        }

        if (document.documentElement.hasAttribute(FETCH_TRIMMED_ATTR)) {
            document.documentElement.removeAttribute(FETCH_TRIMMED_ATTR);
        }

        if (status.hiddenMessages > 0 && config.enabled) {
            const firstVisible = findFirstVisibleMessage();
            const container = firstVisible?.parentElement ?? findMessageContainer();
            if (container) {
                loadMoreButton.show(container, firstVisible, status.hiddenMessages, config.loadMoreBatchSize);
            }
        } else {
            loadMoreButton.hide();
        }

        domObserver.updateMessageStats(status.totalMessages, status.visibleMessages);
        domObserver.SetAutoLoad(config.autoLoad); // Update auto-load state in DOM observer based on latest config

        if (!config.enabled || !config.showStatus || displayStatus.totalMessages === 0) {
            statusIndicator.hide();
        } else {
            statusIndicator.update(displayStatus.hiddenMessages, displayStatus.totalMessages, config.statusPosition, false, config.theme === "light");
        }

        if (config.performanceMode === "native") {
            chatGptRuntime?.scheduleNativeScrollWork(nativeModeController);
        }
    });
}

function scheduleDeliveryTimeoutRefresh(reason: string | null): void {
    reloadCoordinator.scheduleDeliveryTimeoutRefresh(
        config.autoRefreshDeliveryTimeout,
        reason,
        () => chatGptRuntime?.inspectPage().deliveryTimeout ?? { detected: false, reason: null },
    );
}

function cancelDeliveryTimeoutRefresh(): void {
    reloadCoordinator.cancelDeliveryTimeoutRefresh();
}

function findFirstVisibleMessage(): HTMLElement | null {
    const all = filterMessageTurns(
        Array.from(document.querySelectorAll<HTMLElement>(currentSite.selectors.messageTurn)),
        currentSite.selectors,
    );
    for (const el of all) {
        if (!el.closest(".acsb-hidden")) return el;
    }
    return null;
}

function preserveViewportAnchor(anchor: HTMLElement, previousTop: number): void {
    requestAnimationFrame(() => {
        const currentTop = anchor.getBoundingClientRect().top;
        const delta = currentTop - previousTop;
        if (Math.abs(delta) < 1) return;
        const scrollEl = domObserver.findScrollContainer();
        if (scrollEl) {
            scrollEl.scrollTop += delta;
        } else {
            window.scrollBy(0, delta);
        }
    });
}

function findMessageContainer(): HTMLElement | null {
    const firstMsg = filterMessageTurns(
        Array.from(document.querySelectorAll<HTMLElement>(currentSite.selectors.messageTurn)),
        currentSite.selectors,
    )[0];
    return firstMsg?.parentElement ?? null;
}

window.addEventListener("beforeunload", () => {
    if (!bootstrapLease.ownsBootstrap()) return;
    contentLifecycleState = "stopped";
    timers.clearAll();
    reloadCoordinator.dispose();
    window.removeEventListener("pageshow", handlePageResume);
    window.removeEventListener("focus", handleWindowFocus);
    document.removeEventListener("visibilitychange", handleVisibilityResume);
    document.removeEventListener("click", cancelDeliveryTimeoutRefresh, true);
    document.removeEventListener("keydown", cancelDeliveryTimeoutRefresh, true);
    chatGptRuntime?.dispose();
    chatGptRuntime = null;
    editorLatencyGuard.stop();
    nativeModeController?.stop("content script unloading");
    nativeModeController = null;
    bootstrapLease.release();
    domObserver.stop();
    messageManager.destroy();
    loadMoreButton.destroy();
    statusIndicator.destroy();
});

bootstrap().catch((err) => {
    contentLifecycleState = "degraded";
    contentLastRecoverableErrorClass = err instanceof Error ? err.name : "bootstrap-error";
    if (bootstrapLease.ownsBootstrap()) {
        bootstrapLease.release();
    }
    logger.error("failed to bootstrap content script", err);
});
