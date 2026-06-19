/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: provide popup display text from config/status state.
 * Boundary: pure view-model helpers only; DOM events and storage messages stay in popup.ts.
 * ADR: docs/adr/experience/popup/lifecycle-status-text.md.
 */
import type { ExtensionConfig, ExtensionStatus, PerformanceMode } from "../shared/types";

export function renderPerformanceModeHint(
    requestedMode: PerformanceMode,
    status?: ExtensionStatus,
): string {
    const effectiveMode = status?.performanceMode ?? requestedMode;
    if (requestedMode === "native" && effectiveMode !== "native") {
        return "Native is unavailable here; Stable is active.";
    }
    if (requestedMode === "native") {
        return "Experimental; switching modes reloads the chat tab.";
    }
    return "Stable runtime with optional speed controls.";
}

export function renderPopupStatusText(config: ExtensionConfig, status: ExtensionStatus): string {
    if (status.chatGptMaxLengthReadonlyDetected) {
        return "ChatGPT maximum conversation length reached · start a new chat to continue";
    }

    const countText = renderModeCountText(config, status);
    switch (status.contentLifecycleState) {
        case "initializing":
            return `Initializing content script · ${countText}`;
        case "recovering":
            return `Recovering content script · ${countText}`;
        case "degraded":
            return `Degraded content script · ${countText}`;
        case "stopped":
            return `Content script stopped · ${countText}`;
        case "unsupported":
            return "Unsupported page";
        case "active":
        default:
            return countText;
    }
}

function renderModeCountText(config: ExtensionConfig, status: ExtensionStatus): string {
    if (config.performanceMode === "native" || status.performanceMode === "native") {
        return status.performanceMode === "native"
            ? "Native Mode active · experimental"
            : "Native Mode requested · reloading chat tab";
    }
    if (config.fetchInterceptEnabled) {
        return "Fast Mode active · experimental window";
    }
    return `${status.visibleMessages}/${status.totalMessages} messages visible` +
        (status.hiddenMessages > 0 ? ` · ${status.hiddenMessages} hidden` : "");
}
