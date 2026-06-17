export type TargetBrowser = "chrome" | "firefox" | "edge" | "safari";

export type StatusPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type Theme = "light" | "dark";

export type PerformanceMode = "legacy" | "native";

export type ContentLifecycleState = "initializing" | "active" | "recovering" | "degraded" | "unsupported" | "stopped";
export type MutationBatchClass = "small" | "heavy" | "extreme";

export interface ExtensionConfig {
    readonly visibleMessageLimit: number;
    readonly loadMoreBatchSize: number;
    readonly enabled: boolean;
    // Selects the performance architecture. Legacy preserves current behavior.
    readonly performanceMode: PerformanceMode;
    // Controls whether the floating in-page status indicator is rendered.
    readonly showStatus: boolean;
    // Corner placement for the floating status badge.
    readonly statusPosition: StatusPosition;
    // When true, intercept fetch responses to trim messages before rendering.
    readonly fetchInterceptEnabled: boolean;
    // UI theme preference.
    readonly theme: Theme;
    // Auto loads 1 extra conversation turn when the user scrolls to the top of the chat.
    readonly autoLoad: boolean;
    // Weekly request limit shown in the popup counter. 0 = just count, no limit displayed.
    readonly weeklyRequestLimit: number;
    // When true, hide older turns from the DOM beyond visibleMessageLimit.
    // When false, leave the DOM alone (handy if the site already does its own
    // viewport-based virtualization and our hiding makes scrolling janky).
    // Fast Mode (fetchInterceptEnabled) is independent and still useful here.
    readonly hideOldMessages: boolean;
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
    readonly contentLifecycleState?: ContentLifecycleState;
    readonly contentBootTime?: number;
    readonly contentLastUiRefreshAt?: number | null;
    readonly contentOverlayPresent?: boolean;
    readonly contentLastRecoverableErrorClass?: string | null;
    readonly observerLastBatchClass?: MutationBatchClass | null;
    readonly observerLastBatchSize?: number;
    readonly observerLastDurationMs?: number;
    readonly observerOverBudgetCount?: number;
}

export interface WeeklyRequestCount {
    readonly count: number;
    readonly weekStart: number;
}
