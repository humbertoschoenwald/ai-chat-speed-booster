import { DOMObserver } from "./DOMObserver";
import { MessageManager } from "./MessageManager";
import { RequestLifecycleTracker } from "./RequestLifecycleTracker";
import { LoadMoreButton, StatusIndicator } from "./UIComponents";
import { NativeModeController } from "./native/NativeModeController";
import { detectCurrentSite, type SiteConfig } from "../shared/sites";
import { loadConfig, onConfigChanged } from "../shared/storage";
import { onMessage } from "../shared/browser-api";
import {
    MessageType,
    type ContentLifecycleState,
    type ExtensionConfig,
    type ExtensionStatus,
} from "../shared/types";
import { logger } from "../shared/logger";

const CONTENT_BOOTSTRAP_ATTR = "data-acsb-content-bootstrapped";

let config: ExtensionConfig;
let currentSite: SiteConfig;
const messageManager = new MessageManager();
let requestLifecycleTracker: RequestLifecycleTracker | null = null;
let loadMoreButton: LoadMoreButton;
let statusIndicator: StatusIndicator;
let domObserver: DOMObserver;
let nativeModeController: NativeModeController | null = null;
let conversationRetryTimer: ReturnType<typeof setTimeout> | null = null;
let resumeHealthCheckTimer: ReturnType<typeof setTimeout> | null = null;
let contentScriptOwnsBootstrap = false;
const contentBootTime = Date.now();
let contentLifecycleState: ContentLifecycleState = "initializing";
let contentLastUiRefreshAt: number | null = null;
let contentLastRecoverableErrorClass: string | null = null;
/**
 * Internal flag tracking whether the fetch interceptor trimmed the current
 * conversation's API response.  Set by consuming the DOM attribute
 * (data-acsb-trimmed) written by the MAIN-world interceptor, and reset
 * on conversation change so it doesn't carry over across SPA navigations.
 */
let currentConversationTrimmed = false;

async function bootstrap(): Promise<void> {
    const site = detectCurrentSite();
    if (!site) {
        contentLifecycleState = "unsupported";
        logger.info("no supported site detected, content script inactive");
        return;
    }
    if (document.documentElement.getAttribute(CONTENT_BOOTSTRAP_ATTR) === "true") {
        logger.warn("content script bootstrap skipped because another ACSB instance owns this page");
        return;
    }
    document.documentElement.setAttribute(CONTENT_BOOTSTRAP_ATTR, "true");
    contentScriptOwnsBootstrap = true;
    contentLifecycleState = "initializing";
    currentSite = site;
    logger.info(`bootstrapping content script for ${currentSite.name}`);

    config = await loadConfig();
    requestLifecycleTracker = new RequestLifecycleTracker(currentSite.id, currentSite.selectors.userMessageSelector);
    nativeModeController = new NativeModeController(currentSite);
    nativeModeController.updateConfig(config);
    messageManager.updateConfig(config);
    if (currentSite.messageIdAttribute) {
        messageManager.setMessageIdAttribute(currentSite.messageIdAttribute);
    }

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
    });

    domObserver.start();
    domObserver.SetAutoLoad(config.autoLoad);
    scheduleInitialScan();
    onConfigChanged(handleConfigUpdated);
    onMessage(handleExtensionMessage);
    window.addEventListener("pageshow", handlePageResume);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityResume);

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
            if (currentSite.isDynamic) {
                requestAnimationFrame(() => {
                    const scrollEl = domObserver.findScrollContainer();
                    if (scrollEl) {
                        scrollEl.scrollTop = scrollEl.scrollHeight;
                    } else {
                        window.scrollTo(0, document.body.scrollHeight);
                    }
                });
            }
            return;
        }
        setTimeout(attempt, 500);
    };
    attempt();
}

/**
 * Incremental path for newly appended turns detected by DOMObserver.
 */
function handleMessagesAdded(elements: HTMLElement[]): void {
    messageManager.addMessages(elements);
    refreshUI();
    countNewUserRequests(elements);
}

function countNewUserRequests(elements: HTMLElement[]): void {
    requestLifecycleTracker?.observeAddedTurns(elements);
}

/**
 * Cleans up removed turn references to keep manager state aligned with DOM.
 */
function handleMessagesRemoved(elements: HTMLElement[]): void {
    messageManager.removeMessages(elements);
    refreshUI();
}

/**
 * Handles in-DOM conversation navigation by rebuilding observer + state against
 * the newly rendered thread without requiring a full page refresh.
 */
function handleConversationChanged(): void {
    contentLifecycleState = "recovering";
    logger.debug("conversation changed, re-initialising");

    // Reset the trimmed flag for the new conversation.  The fetch
    // interceptor will set the DOM attribute again if it trims.
    currentConversationTrimmed = false;
    requestLifecycleTracker?.reset();

    // Cancel any in-flight retry loop from a previous navigation
    if (conversationRetryTimer) {
        clearTimeout(conversationRetryTimer);
        conversationRetryTimer = null;
    }

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
            conversationRetryTimer = null;
            if (messages.length > 0) {
                logger.debug(`re-initialised with ${messages.length} messages after ${retries} retries`);
            }
            return;
        }
        retries++;
        conversationRetryTimer = setTimeout(attempt, 300);
    };
    // Try immediately — with cached responses messages may already be rendered.
    // Fall back to polling if the DOM is empty (server fetch still in-flight).
    attempt();
}

function handleConfigUpdated(newConfig: ExtensionConfig): void {
    config = newConfig;
    nativeModeController?.updateConfig(config);
    messageManager.updateConfig(config);
    refreshUI();
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

function queueResumeHealthCheck(reason: string): void {
    if (contentLifecycleState === "stopped") return;
    if (resumeHealthCheckTimer) clearTimeout(resumeHealthCheckTimer);
    resumeHealthCheckTimer = setTimeout(() => {
        resumeHealthCheckTimer = null;
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
        const nativeState = nativeModeController?.snapshot();
        const observerDiagnostics = domObserver.getDiagnostics();
        return {
            ...messageManager.getStatus(),
            siteId: currentSite.id,
            performanceMode: config.performanceMode,
            nativeModeActive: nativeState?.active ?? false,
            nativeModeSelectorHealthy: nativeState?.selectorHealth?.healthy ?? false,
            nativeModeInputActive: nativeState?.editorInput.active ?? false,
            nativeModeAdapterId: nativeState?.adapter.siteId,
            nativeModeAdapterName: nativeState?.adapter.displayName,
            nativeModeAdapterSupport: nativeState?.adapter.support,
            nativeModeBlockedReason: nativeState?.blockedReason ?? null,
            contentLifecycleState,
            contentBootTime,
            contentLastUiRefreshAt,
            contentOverlayPresent: statusIndicator.isMounted(),
            contentLastRecoverableErrorClass,
            observerLastBatchClass: observerDiagnostics.lastBatchClass,
            observerLastBatchSize: observerDiagnostics.lastBatchSize,
            observerLastDurationMs: observerDiagnostics.lastDurationMs,
            observerOverBudgetCount: observerDiagnostics.overBudgetCount,
        };
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
 * When all hidden DOM messages are exhausted but the fetch interceptor trimmed
 * messages, shows a "Load full conversation" button that reloads without trimming.
 */
function handleLoadMore(): void {
    const revealed = messageManager.loadMore();
    if (revealed > 0) {
        refreshUI();
    } else {
        // Nothing left to reveal from DOM — check if fetch interceptor trimmed
        refreshUI();
    }
}

/**
 * Reveals one additional conversation turn, used for auto-loading when the user scrolls to the top.
 */
function loadOneMoreMessage(): void {
    if(!config.autoLoad) return; // Don't auto-load if the user has disabled the feature
    messageManager.loadMore(1);
    refreshUI();
}

/**
 * One-shot full reload: sets a localStorage flag so the fetch interceptor
 * skips trimming on the next page load, then reloads.
 */
function handleFullLoad(): void {
    try {
        localStorage.setItem("acsb_skip_trim_once", "true");
    } catch { /* storage unavailable */ }
    window.location.reload();
}

/**
 * Central renderer for load-more and status-indicator visibility states.
 */
let rafPending = false;
function refreshUI(): void {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
        rafPending = false;
        contentLastUiRefreshAt = Date.now();
        const status = messageManager.getStatus();

        // Consume the DOM attribute written by the MAIN-world fetch
        // interceptor.  Once consumed we store the flag internally so
        // subsequent non-conversation fetch responses can't erase it.
        if (document.documentElement.hasAttribute("data-acsb-trimmed")) {
            currentConversationTrimmed = true;
            document.documentElement.removeAttribute("data-acsb-trimmed");
        }

        if (status.hiddenMessages > 1 && config.enabled) { // changed to 1 since conversations that were aborted will result in 1 turn being added, i.e., the user prompt.
            // Normal Load More mode — there are still hidden DOM elements
            const firstVisible = findFirstVisibleMessage();
            const container = findMessageContainer();
            if (container && firstVisible) {
                loadMoreButton.show(container, firstVisible, status.hiddenMessages, config.loadMoreBatchSize);
            } else if (container) {
                loadMoreButton.show(container, null, status.hiddenMessages, config.loadMoreBatchSize);
            }
        } else if (currentConversationTrimmed && config.enabled && config.fetchInterceptEnabled) {
            // All DOM messages visible, but fetch interceptor trimmed more.
            // Show "Load full conversation" button.
            const firstVisible = findFirstVisibleMessage();
            const container = findMessageContainer();
            if (container) {
                loadMoreButton.showFullLoad(container, firstVisible, handleFullLoad);
            }
        } else {
            loadMoreButton.hide();
        }

        domObserver.updateMessageStats(Math.floor(status.totalMessages / 2), Math.floor(status.visibleMessages / 2)); // Divide by 2 to convert from turns to conversations
        domObserver.SetAutoLoad(config.autoLoad); // Update auto-load state in DOM observer based on latest config

        if (!config.enabled || !config.showStatus || status.totalMessages === 0) {
            statusIndicator.hide();
        } else {
            statusIndicator.update(status.hiddenMessages, status.totalMessages, config.statusPosition, config.fetchInterceptEnabled, config.theme === "light");
        }
    });
}

function findFirstVisibleMessage(): HTMLElement | null {
    const all = document.querySelectorAll<HTMLElement>(currentSite.selectors.messageTurn);
    for (const el of all) {
        if (!el.classList.contains("acsb-hidden")) return el;
    }
    return null;
}

function findMessageContainer(): HTMLElement | null {
    const firstMsg = document.querySelector<HTMLElement>(currentSite.selectors.messageTurn);
    return firstMsg?.parentElement ?? null;
}

window.addEventListener("beforeunload", () => {
    if (!contentScriptOwnsBootstrap) return;
    contentLifecycleState = "stopped";
    if (conversationRetryTimer) {
        clearTimeout(conversationRetryTimer);
        conversationRetryTimer = null;
    }
    if (resumeHealthCheckTimer) {
        clearTimeout(resumeHealthCheckTimer);
        resumeHealthCheckTimer = null;
    }
    window.removeEventListener("pageshow", handlePageResume);
    window.removeEventListener("focus", handleWindowFocus);
    document.removeEventListener("visibilitychange", handleVisibilityResume);
    nativeModeController?.stop("content script unloading");
    nativeModeController = null;
    document.documentElement.removeAttribute(CONTENT_BOOTSTRAP_ATTR);
    contentScriptOwnsBootstrap = false;
    domObserver.stop();
    messageManager.destroy();
    loadMoreButton.destroy();
    statusIndicator.destroy();
});

bootstrap().catch((err) => {
    contentLifecycleState = "degraded";
    contentLastRecoverableErrorClass = err instanceof Error ? err.name : "bootstrap-error";
    if (contentScriptOwnsBootstrap) {
        document.documentElement.removeAttribute(CONTENT_BOOTSTRAP_ATTR);
        contentScriptOwnsBootstrap = false;
    }
    logger.error("failed to bootstrap content script", err);
});
