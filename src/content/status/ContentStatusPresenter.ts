/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: assemble the extension status payload returned to the popup.
 * Boundary: pure status shaping; it does not inspect DOM, timers, storage, or host pages.
 * ADR: docs/adr/architecture/lifecycle/content-health-status.md.
 */
import type { ExtensionStatus, PerformanceMode, ContentLifecycleState } from "../../shared/types";
import type { DOMObserverDiagnostics } from "../DOMObserver";
import type { EditorInputSnapshot } from "../native/EditorInputOptimizer";
import type { NativeModeState } from "../native/NativeModeController";
import type { ChatGptContentRuntimeStatus, ChatGptPageInspection } from "../native/chatgpt/ChatGptContentRuntime";
export interface ContentLifecycleStatus {
    readonly state: ContentLifecycleState;
    readonly bootTime: number;
    readonly lastUiRefreshAt: number | null;
    readonly overlayPresent: boolean;
    readonly lastRecoverableErrorClass: string | null;
}
export interface ContentStatusPresenterInput {
    readonly baseStatus: ExtensionStatus;
    readonly siteId: string;
    readonly performanceMode: PerformanceMode;
    readonly lifecycle: ContentLifecycleStatus;
    readonly nativeState: NativeModeState | null | undefined;
    readonly editorInput: EditorInputSnapshot;
    readonly observer: DOMObserverDiagnostics;
    readonly chatGptInspection: ChatGptPageInspection | null | undefined;
    readonly chatGptStatus: ChatGptContentRuntimeStatus | null | undefined;
}
export function createExtensionStatus(input: ContentStatusPresenterInput): ExtensionStatus {
    const native = input.nativeState;
    const editor = input.editorInput;
    const observer = input.observer;
    const inspection = input.chatGptInspection;
    const chatGpt = input.chatGptStatus;
    return {
        ...input.baseStatus,
        siteId: input.siteId,
        performanceMode: input.performanceMode,
        nativeModeActive: native?.active ?? false,
        nativeModeSelectorHealthy: native?.selectorHealth?.healthy ?? false,
        nativeModeInputActive: native?.editorInput.active ?? false,
        nativeModeAdapterId: native?.adapter.siteId,
        nativeModeAdapterName: native?.adapter.displayName,
        nativeModeAdapterSupport: native?.adapter.support,
        nativeModeBlockedReason: native?.blockedReason ?? null,
        nativeModePlanCanStart: native?.executionPlan?.canStart ?? false,
        nativeModePlanReason: native?.executionPlan?.reason,
        nativeModePlanActiveFeatures: native?.executionPlan?.activeFeatures,
        nativeModePlanBlockedFeatures: native?.executionPlan?.blockedFeatures,
        nativeModePlanAutoDisabledFeatures: native?.executionPlan?.autoDisabledFeatures?.map(
            (record) => `${record.feature}:${record.reason}:${record.disabledAt}`,
        ),
        nativeModeMutationBudgetMs: native?.executionPlan?.mutationBudgetMs,
        nativeModeInputQuietWindowMs: native?.executionPlan?.inputQuietWindowMs,
        nativeModeScrollOverscanPx: native?.executionPlan?.scrollOverscanPx,
        contentLifecycleState: input.lifecycle.state,
        contentBootTime: input.lifecycle.bootTime,
        contentLastUiRefreshAt: input.lifecycle.lastUiRefreshAt,
        contentOverlayPresent: input.lifecycle.overlayPresent,
        contentLastRecoverableErrorClass: input.lifecycle.lastRecoverableErrorClass,
        editorInputActive: editor.active,
        editorInputComposing: editor.composing,
        editorInputDeferredTaskCount: editor.deferredTaskCount,
        editorInputEventCount: editor.eventCount,
        editorInputLastEventType: editor.lastEventType,
        editorInputLastEventAt: editor.lastEventAt,
        editorInputProtectedUntilMs: editor.protectedUntilMs,
        editorInputLastPasteLength: editor.lastPasteLength,
        editorInputLastPasteChunkCount: editor.lastPasteChunkCount,
        observerLastBatchClass: observer.lastBatchClass,
        observerLastBatchSize: observer.lastBatchSize,
        observerLastDurationMs: observer.lastDurationMs,
        observerOverBudgetCount: observer.overBudgetCount,
        nativeModeSnapshotHosts: chatGpt?.nativeSnapshotHosts,
        nativeModeSnapshotCacheBytes: chatGpt?.nativeSnapshotCacheBytes,
        nativeModeApproxInputTokens: inspection?.tokenEstimate.approxTokens,
        nativeModeTokenLimit: inspection?.tokenEstimate.limitTokens,
        nativeModeTokenWarningLevel: inspection?.tokenEstimate.warningLevel,
        chatGptDeliveryTimeoutDetected: inspection?.deliveryTimeout.detected,
        chatGptDeliveryTimeoutConfidence: inspection?.deliveryTimeout.confidence,
        chatGptDeliveryTimeoutRetryButtonCount: inspection?.deliveryTimeout.retryButtonCount,
        chatGptDeliveryTimeoutAssistantErrorCount: inspection?.deliveryTimeout.assistantErrorCount,
        chatGptDeliveryTimeoutFirstMessageId: inspection?.deliveryTimeout.firstMessageId,
        chatGptDeliveryTimeoutReason: inspection?.deliveryTimeout.reason,
        chatGptMaxLengthReadonlyDetected: inspection?.maxLengthReadonly.detected,
        chatGptMaxLengthReadonlyReason: inspection?.maxLengthReadonly.reason,
        nativeModeRenderUnitCost: chatGpt?.nativeRenderBudget?.estimatedRenderUnitCost,
        nativeModeTurnNodeCost: chatGpt?.nativeRenderBudget?.estimatedTurnNodeCost,
        nativeModeToolNodeCost: chatGpt?.nativeRenderBudget?.estimatedToolNodeCost,
        nativeModeToolGroupCount: chatGpt?.nativeRenderBudget?.toolGroupCount,
        nativeModeRunningToolCount: chatGpt?.nativeRenderBudget?.runningToolCount,
        nativeModeFailedToolCount: chatGpt?.nativeRenderBudget?.failedToolCount,
        nativeModeToolCardDensityScore: chatGpt?.nativeToolCardDensityProfile?.score,
        nativeModeToolCardDensityBehavior: chatGpt?.nativeToolCardDensityProfile?.behavior,
        nativeModeTurnCostUserTurns: chatGpt?.nativeTurnCostProfile?.userTurns,
        nativeModeTurnCostAssistantTurns: chatGpt?.nativeTurnCostProfile?.assistantTurns,
        nativeModeTurnCostToolRichAssistantTurns: chatGpt?.nativeTurnCostProfile?.toolRichAssistantTurns,
        nativeModeTurnCostLargeUserCodeTurns: chatGpt?.nativeTurnCostProfile?.largeUserCodeTurns,
        nativeModeTurnCostBuckets: chatGpt?.nativeTurnCostProfile?.buckets,
        nativeModeTurnCostBehaviors: chatGpt?.nativeTurnCostProfile?.behaviors,
        nativeModeTurnCostSample: chatGpt?.nativeTurnCostProfile?.sample.map(
            (item) => `${item.role}:${item.costBucket}:${item.selectedBehavior}`,
        ),
        nativeModeThreadResponseHeightPx: chatGpt?.nativeThreadCssMetrics?.responseHeightPx,
        nativeModeThreadContentMaxWidthPx: chatGpt?.nativeThreadCssMetrics?.contentMaxWidthPx,
        nativeModeThreadScrollToBottomBannerOffsetPx: chatGpt?.nativeThreadCssMetrics?.scrollToBottomBannerOffsetPx,
        nativeModeThreadShowContextPct: chatGpt?.nativeThreadCssMetrics?.showContextPct,
        nativeModeCodeBlockCount: chatGpt?.nativeCodeBlockContainment?.codeBlockCount,
        nativeModeContainedCodeBlockCount: chatGpt?.nativeCodeBlockContainment?.containedCodeBlockCount,
        nativeModeSkippedEditableCodeBlockCount: chatGpt?.nativeCodeBlockContainment?.skippedEditableCount,
        nativeModeScrollRootPresent: chatGpt?.nativeScrollRootState?.rootPresent,
        nativeModeStreamActive: chatGpt?.nativeScrollRootState?.streamActive,
        nativeModeScrollRootFromTop: chatGpt?.nativeScrollRootState?.scrollFromTop,
        nativeModeScrolledFromEnd: chatGpt?.nativeScrollRootState?.scrolledFromEnd,
        nativeModeShouldDeferOldTurnWork: chatGpt?.nativeScrollRootState?.shouldDeferOldTurnWork,
        nativeModeLiveWindowSize: chatGpt?.nativeRenderBudget?.liveWindowSize,
        nativeModeRevealLoopCount: chatGpt?.nativeRevealLoopCount,
        nativeModeScrollOscillationCount: chatGpt?.nativeScrollOscillationCount,
        nativeModeVirtualizationDisabled: chatGpt?.nativeVirtualizationDisabled,
        nativeModeVirtualizationConflictReason: chatGpt?.nativeVirtualizationConflictReason,
    };
}
