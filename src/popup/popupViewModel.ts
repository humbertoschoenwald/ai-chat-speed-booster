/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: provide popup display text from config/status state.
 * Boundary: pure view-model helpers only; DOM events and storage messages stay in popup.ts.
 * ADR: docs/adr/architecture/message-management/stable-fast-logical-message-contract.md.
 */
import type { ExtensionConfig, ExtensionStatus, PerformanceMode } from "../shared/types";

export function renderPerformanceModeHint(
    requestedMode: PerformanceMode,
    status?: ExtensionStatus,
): string {
    const effectiveMode = status?.performanceMode ?? requestedMode;
    if (requestedMode === "native" && effectiveMode !== "native") {
        return "Native unavailable here · Stable active";
    }
    if (effectiveMode === "native") {
        return "Native active · ChatGPT only";
    }
    return "Stable active · manual older batches";
}

export function renderPopupStatusText(config: ExtensionConfig, status: ExtensionStatus): string {
    if (status.chatGptMaxLengthReadonlyDetected) {
        return "ChatGPT maximum conversation length reached · start a new chat to continue";
    }

    const countText = renderModeCountText(config, status);
    const hasEmptyCounts = status.totalMessages === 0
        && status.visibleMessages === 0
        && status.hiddenMessages === 0;
    switch (status.contentLifecycleState) {
        case "initializing":
            if (hasEmptyCounts) return "Initializing content script";
            return `Initializing content script · ${countText}`;
        case "recovering":
            if (hasEmptyCounts) return "Recovering content script";
            return `Recovering content script · ${countText}`;
        case "degraded":
            return hasEmptyCounts
                ? "No ChatGPT messages detected"
                : `Degraded content script · ${countText}`;
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
    return `${status.visibleMessages}/${status.totalMessages} messages visible` +
        (status.hiddenMessages > 0 ? ` · ${status.hiddenMessages} hidden` : "");
}
