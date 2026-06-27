export type TargetBrowser = "chrome" | "firefox" | "edge" | "safari";

export type StatusPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type Theme = "light" | "dark";

export type PerformanceMode = "legacy" | "native" | "extreme";

export type ContentLifecycleState = "initializing" | "active" | "recovering" | "degraded" | "unsupported" | "stopped";
export type MutationBatchClass = "small" | "heavy" | "extreme";

export interface ExtensionConfig {
    // Logical chat messages, where one message is one user prompt plus the following assistant response.
    readonly visibleMessageLimit: number;
    // Logical chat messages revealed per Stable Load More click.
    readonly loadMoreBatchSize: number;
    readonly enabled: boolean;
    // Selects the performance architecture. Legacy is Stable Mode; Native is ChatGPT-only.
    readonly performanceMode: PerformanceMode;
    // Controls whether the floating in-page status indicator is rendered.
    readonly showStatus: boolean;
    // Corner placement for the floating status badge.
    readonly statusPosition: StatusPosition;
    // When true, intercept fetch responses to trim the initial Stable render window before rendering.
    readonly fetchInterceptEnabled: boolean;
    // UI theme preference.
    readonly theme: Theme;
    // Legacy storage for the retired Auto Load experiment. The popup no longer exposes it.
    readonly autoLoad: boolean;
    // Weekly request limit shown in the popup counter. 0 = just count, no limit displayed.
    readonly weeklyRequestLimit: number;
    // When true, hide older turns from the DOM beyond visibleMessageLimit.
    // When false, leave the DOM alone (handy if the site already does its own
    // viewport-based virtualization and our hiding makes scrolling janky).
    // Fast loading remains independent and does not change Stable logical counts.
    readonly hideOldMessages: boolean;
    // When true, refresh ChatGPT after a persistent delivery-timeout UI is detected.
    readonly autoRefreshDeliveryTimeout: boolean;
}

export interface TrackedMessage {
    readonly id: string;
    readonly element: HTMLElement;
    visible: boolean;
}

export enum MessageType {
    GET_CONFIG = "GET_CONFIG",
    SET_CONFIG = "SET_CONFIG",
    CONFIG_UPDATED = "CONFIG_UPDATED",
    GET_STATUS = "GET_STATUS",
    STATUS_RESPONSE = "STATUS_RESPONSE",
    TOGGLE_ENABLED = "TOGGLE_ENABLED",
    TOGGLE_STATUS = "TOGGLE_STATUS",
    TOGGLE_FETCH_INTERCEPT = "TOGGLE_FETCH_INTERCEPT",
    TOGGLE_AUTO_LOAD = "TOGGLE_AUTO_LOAD",
    TOGGLE_HIDE_OLD_MESSAGES = "TOGGLE_HIDE_OLD_MESSAGES",
    GET_REQUEST_COUNT = "GET_REQUEST_COUNT",
    INCREMENT_REQUEST_COUNT = "INCREMENT_REQUEST_COUNT",
    RESET_REQUEST_COUNT = "RESET_REQUEST_COUNT",
}

export interface ExtensionMessage {
    readonly type: MessageType;
    readonly payload?: unknown;
}

export interface GetConfigMessage extends ExtensionMessage {
    readonly type: MessageType.GET_CONFIG;
}

export interface SetConfigMessage extends ExtensionMessage {
    readonly type: MessageType.SET_CONFIG;
    readonly payload: Partial<ExtensionConfig>;
}

export interface ConfigUpdatedMessage extends ExtensionMessage {
    readonly type: MessageType.CONFIG_UPDATED;
    readonly payload: ExtensionConfig;
}

export type ExtensionMessageUnion =
    | GetConfigMessage
    | SetConfigMessage
    | ConfigUpdatedMessage
    | ExtensionMessage;

export interface ExtensionStatus {
    readonly enabled: boolean;
    readonly totalMessages: number;
    readonly visibleMessages: number;
    readonly hiddenMessages: number;
    readonly showStatus: boolean;
    readonly statusPosition: StatusPosition;
    readonly siteId?: string;
    readonly performanceMode?: PerformanceMode;
    readonly nativeModeActive?: boolean;
    readonly nativeModeSelectorHealthy?: boolean;
    readonly nativeModeInputActive?: boolean;
    readonly nativeModeAdapterId?: string;
    readonly nativeModeAdapterName?: string;
    readonly nativeModeAdapterSupport?: "enabled" | "planned";
    readonly nativeModeBlockedReason?: string | null;
    readonly nativeModePlanCanStart?: boolean;
    readonly nativeModePlanReason?: string;
    readonly nativeModePlanActiveFeatures?: readonly string[];
    readonly nativeModePlanBlockedFeatures?: readonly string[];
    readonly nativeModePlanAutoDisabledFeatures?: readonly string[];
    readonly nativeModeMutationBudgetMs?: number | null;
    readonly nativeModeInputQuietWindowMs?: number | null;
    readonly nativeModeScrollOverscanPx?: number | null;
    readonly contentLifecycleState?: ContentLifecycleState;
    readonly contentBootTime?: number;
    readonly contentLastUiRefreshAt?: number | null;
    readonly contentOverlayPresent?: boolean;
    readonly contentLastRecoverableErrorClass?: string | null;
    readonly editorInputActive?: boolean;
    readonly editorInputComposing?: boolean;
    readonly editorInputDeferredTaskCount?: number;
    readonly editorInputEventCount?: number;
    readonly editorInputLastEventType?: string | null;
    readonly editorInputLastEventAt?: number | null;
    readonly editorInputProtectedUntilMs?: number | null;
    readonly editorInputLastPasteLength?: number | null;
    readonly editorInputLastPasteChunkCount?: number | null;
    readonly observerLastBatchClass?: MutationBatchClass | null;
    readonly observerLastBatchSize?: number;
    readonly observerLastDurationMs?: number;
    readonly observerOverBudgetCount?: number;
    readonly nativeModeSnapshotHosts?: number;
    readonly nativeModeSnapshotCacheBytes?: number;
    readonly nativeModeSnapshotHostBudgetLimit?: number;
    readonly nativeModeSnapshotHostBudgetOverrun?: number;
    readonly nativeModeSnapshotHostBudgetAffectedTurnIds?: readonly string[];
    readonly nativeModeInitialModalReady?: boolean;
    readonly nativeModeInitialModalMarkerPresent?: boolean;
    readonly nativeModeInitialModalFallbackElapsed?: boolean;
    readonly nativeModeInitialModalElapsedMs?: number;
    readonly nativeModeApproxInputTokens?: number;
    readonly nativeModeTokenLimit?: number;
    readonly nativeModeTokenWarningLevel?: "ok" | "warn" | "critical";
    readonly chatGptDeliveryTimeoutDetected?: boolean;
    readonly chatGptDeliveryTimeoutConfidence?: "none" | "structural" | "text-fallback";
    readonly chatGptDeliveryTimeoutScope?: string;
    readonly chatGptDeliveryTimeoutRetryButtonCount?: number;
    readonly chatGptDeliveryTimeoutAssistantErrorCount?: number;
    readonly chatGptDeliveryTimeoutFirstMessageId?: string | null;
    readonly chatGptDeliveryTimeoutAffectedMessageIds?: readonly string[];
    readonly chatGptDeliveryTimeoutReason?: string | null;
    readonly chatGptMaxLengthReadonlyDetected?: boolean;
    readonly chatGptMaxLengthReadonlyReason?: string | null;
    readonly chatGptThreadStatusDetected?: boolean;
    readonly chatGptThreadStatusKind?: string;
    readonly chatGptThreadStatusReason?: string | null;
    readonly chatGptThreadStatusControlCount?: number;
    readonly nativeModeRenderUnitCost?: number;
    readonly nativeModeTurnNodeCost?: number;
    readonly nativeModeToolNodeCost?: number;
    readonly nativeModeToolGroupCount?: number;
    readonly nativeModeComposerButtons?: number;
    readonly nativeModeComposerSvgs?: number;
    readonly nativeModeComposerEditableNodes?: number;
    readonly nativeModeRunningToolCount?: number;
    readonly nativeModeFailedToolCount?: number;
    readonly nativeModeToolCardDensityScore?: number;
    readonly nativeModeToolCardDensityBehavior?: string;
    readonly nativeModeTurnCostUserTurns?: number;
    readonly nativeModeTurnCostAssistantTurns?: number;
    readonly nativeModeTurnCostToolRichAssistantTurns?: number;
    readonly nativeModeTurnCostLargeUserCodeTurns?: number;
    readonly nativeModeTurnCostBuckets?: Record<string, number>;
    readonly nativeModeTurnCostBehaviors?: Record<string, number>;
    readonly nativeModeTurnCostSample?: readonly string[];
    readonly nativeModeMessageIdCount?: number;
    readonly nativeModeMissingMessageIdCount?: number;
    readonly nativeModeRepeatedMessageIdCount?: number;
    readonly nativeModeCurrentAssistantMessageId?: string | null;
    readonly nativeModeCurrentAssistantModelLabel?: string | null;
    readonly nativeModeThreadResponseHeightPx?: number | null;
    readonly nativeModeThreadContentMaxWidthPx?: number | null;
    readonly nativeModeThreadScrollToBottomBannerOffsetPx?: number | null;
    readonly nativeModeThreadShowContextPct?: number | null;
    readonly nativeModeCodeBlockCount?: number;
    readonly nativeModeContainedCodeBlockCount?: number;
    readonly nativeModeSkippedEditableCodeBlockCount?: number;
    readonly nativeModeScrollRootPresent?: boolean;
    readonly nativeModeStreamActive?: boolean;
    readonly nativeModeScrollRootFromTop?: number | null;
    readonly nativeModeScrolledFromEnd?: boolean | null;
    readonly nativeModeShouldDeferOldTurnWork?: boolean;
    readonly nativeModeDataStateOpenCount?: number;
    readonly nativeModeDataStateChangedCount?: number;
    readonly nativeModeSelectorDriftConfidence?: string;
    readonly nativeModeSelectorDriftFailedContracts?: readonly string[];
    readonly nativeModeSelectorDriftRiskyOptimizationAllowed?: boolean;
    readonly nativeModeSelectorDriftTurnCount?: number;
    readonly nativeModeSelectorDriftDedupedTurnCount?: number;
    readonly nativeModeSelectorDriftComposerPresent?: boolean;
    readonly nativeModeSelectorDriftScrollRootPresent?: boolean;
    readonly nativeModeSelectorDriftToolCardCount?: number;
    readonly nativeModeSelectorDriftKnownToolLabelCount?: number;
    readonly nativeModePlaceholderTurnCount?: number;
    readonly nativeModeHydratedTurnCount?: number;
    readonly nativeModeActiveTurnCount?: number;
    readonly nativeModeStatusTurnCount?: number;
    readonly nativeModeLiveWindowSize?: number;
    readonly nativeModeRevealLoopCount?: number;
    readonly nativeModeScrollOscillationCount?: number;
    readonly nativeModeVirtualizationDisabled?: boolean;
    readonly nativeModeVirtualizationConflictReason?: string | null;
    readonly legacyRevealLoopCount?: number;
    readonly legacyLastRevealLoopAt?: number | null;
}

export interface WeeklyRequestCount {
    readonly count: number;
    readonly weekStart: number;
}
