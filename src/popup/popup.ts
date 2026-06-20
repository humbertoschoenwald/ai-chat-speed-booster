/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: wire popup DOM controls to extension settings and page status.
 * Boundary: DOM/event orchestration only; status text decisions live in popupViewModel.ts.
 * ADR: docs/adr/experience/popup/native-mode-controls.md.
 */
import { sendMessage } from "../shared/browser-api";
import { CONFIG_LIMITS, DEFAULT_CONFIG } from "../shared/constants";
import {
    MessageType,
    type ExtensionConfig,
    type ExtensionStatus,
    type PerformanceMode,
    type StatusPosition,
    type Theme,
    type WeeklyRequestCount,
} from "../shared/types";
import { SITES } from "../shared/sites";
import { isNativeModeAllowedForSite } from "../shared/native-runtime-policy";
import { detectActivePopupSiteId, shouldUsePopupCachedStatus } from "./popupActiveSite";
import { shouldShowNativeModeControl } from "./popupCapabilities";
import { renderPerformanceModeHint, renderPopupStatusText } from "./popupViewModel";

const toggleEnabled = document.getElementById("toggle-enabled") as HTMLInputElement;
const toggleStatus = document.getElementById("toggle-status") as HTMLInputElement;
// Auto Load remains storage-only; the popup intentionally does not render a control.
const toggleHideOld = document.getElementById("toggle-hide-old") as HTMLInputElement;
const visibleLimitInput = document.getElementById("visible-limit") as HTMLInputElement;
const batchSizeInput = document.getElementById("batch-size") as HTMLInputElement;
const statusText = document.getElementById("status-text") as HTMLElement;
const versionText = document.getElementById("version-text") as HTMLElement;
const settingsSection = document.querySelector(".popup-settings") as HTMLElement;
const positionPicker = document.getElementById("position-picker") as HTMLElement;
const positionButtons = positionPicker.querySelectorAll<HTMLButtonElement>(".position-picker__btn");
const lightIcon = document.querySelector(".theme-toggle__icon.lucide-sun") as HTMLElement;
const darkIcon = document.querySelector(".theme-toggle__icon.lucide-moon") as HTMLElement;
const themeToggle = document.getElementById("theme-toggle") as HTMLButtonElement;
const requestCounter = document.getElementById("request-counter") as HTMLElement;
const requestCountValue = document.getElementById("request-count-value") as HTMLElement;
const requestLimitSep = document.getElementById("request-limit-sep") as HTMLElement;
const requestLimitInput = document.getElementById("request-limit-input") as HTMLInputElement;
const requestCountHint = document.getElementById("request-counter-hint") as HTMLElement;
const requestCountReset = document.getElementById("request-count-reset") as HTMLButtonElement;
const toggleDeliveryTimeoutRefresh = document.getElementById("toggle-delivery-timeout-refresh") as HTMLInputElement;
const modeStableButton = document.getElementById("mode-stable") as HTMLButtonElement;
const modeNativeButton = document.getElementById("mode-native") as HTMLButtonElement;
const modeButtons = [modeStableButton, modeNativeButton] as const;
const nativeModeSetting = document.querySelector(".setting--mode") as HTMLElement;
const performanceModeHint = document.getElementById("performance-mode-hint") as HTMLElement;
const nativeDiagnosticsBody = document.getElementById("native-diagnostics-body") as HTMLElement;
const nativePanels = document.querySelectorAll<HTMLElement>(".native-panel");
const legacyControls = document.querySelectorAll<HTMLElement>("[data-legacy-control]");
const legacyControlInputs = document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>("[data-legacy-control] input, [data-legacy-control] select, [data-legacy-control] button");

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let limitSaveTimer: ReturnType<typeof setTimeout> | null = null;
let currentSiteId: string | undefined;
let currentConfig: ExtensionConfig = DEFAULT_CONFIG;
let lastCount = 0;
let lastWeekStart = 0;

const POPUP_CACHE_KEY = "acsb-popup-cache-v1";

interface PopupRenderCache {
    readonly config?: ExtensionConfig;
    readonly status?: ExtensionStatus;
}

function readPopupCache(): PopupRenderCache | null {
    try {
        const raw = localStorage.getItem(POPUP_CACHE_KEY);
        return raw ? JSON.parse(raw) as PopupRenderCache : null;
    } catch {
        return null;
    }
}

function writePopupCache(cache: PopupRenderCache): void {
    try {
        localStorage.setItem(POPUP_CACHE_KEY, JSON.stringify(cache));
    } catch {
        // Best-effort only: popup cache must never block the UI.
    }
}

function applyTheme(theme: Theme): void {
    document.documentElement.setAttribute("data-theme", theme);
    themeToggle.setAttribute("aria-pressed", String(theme === "light"));
    if (theme === "light") {
        lightIcon.classList.add("hidden");
        darkIcon.classList.remove("hidden");
    } else {
        lightIcon.classList.remove("hidden");
        darkIcon.classList.add("hidden");
    }
}

async function safeSendMessage<T>(message: unknown): Promise<T | null> {
    try {
        return (await sendMessage<T>(message)) ?? null;
    } catch {
        return null;
    }
}

async function init(): Promise<void> {
    const manifest = chrome.runtime.getManifest();
    versionText.textContent = `(v${manifest.version})`; // New: set the version text from manifest
    currentSiteId = await detectActivePopupSiteId();

    const cached = readPopupCache();
    if (cached?.config) {
        applyTheme(cached.config.theme);
        renderConfig(cached.config);
    }
    if (shouldUsePopupCachedStatus(cached?.status, currentSiteId) && typeof cached?.status?.totalMessages === "number") {
        statusText.textContent = renderPopupStatusText(cached.config ?? currentConfig, cached.status);
        settingsSection.style.display = "flex";
        renderPerformanceMode(cached.config?.performanceMode ?? currentConfig.performanceMode, cached.status);
        renderNativeDiagnostics(cached.status);
    }

    const config = await safeSendMessage<ExtensionConfig>({ type: MessageType.GET_CONFIG });
    const finalConfig = config ?? DEFAULT_CONFIG;
    applyTheme(finalConfig.theme);
    renderConfig(finalConfig);
    await refreshStatus();
}

function renderPerformanceMode(mode: PerformanceMode, status?: ExtensionStatus): void {
    const nativeSupported = shouldShowNativeModeControl(currentSiteId);
    const effectiveMode: PerformanceMode = nativeSupported ? (status?.performanceMode ?? mode) : "legacy";

    nativeModeSetting.hidden = false;
    modeButtons.forEach((button) => {
        const buttonMode = button.dataset.mode as PerformanceMode;
        const selected = buttonMode === effectiveMode;
        button.classList.toggle("active", selected);
        button.setAttribute("aria-checked", String(selected));
        button.disabled = buttonMode === "native" && !nativeSupported;
    });
    performanceModeHint.textContent = renderPerformanceModeHint(mode, status);

    nativePanels.forEach((panel) => {
        panel.hidden = effectiveMode !== "native";
    });
    legacyControls.forEach((control) => {
        control.hidden = effectiveMode === "native";
    });
    legacyControlInputs.forEach((input) => {
        input.disabled = effectiveMode === "native";
    });
    toggleHideOld.checked = true;
    toggleHideOld.disabled = true;
}

function renderNativeDiagnostics(status: ExtensionStatus | undefined): void {
    if (!status || status.performanceMode !== "native") {
        nativeDiagnosticsBody.textContent = "Enable Native Mode to inspect guarded diagnostics.";
        return;
    }

    const adapter = status.nativeModeAdapterName
        ? `${status.nativeModeAdapterName}/${status.nativeModeAdapterSupport ?? "planned"}`
        : "unknown";
    const selectorHealth = status.nativeModeSelectorHealthy ? "healthy" : "blocked";
    const inputState = status.nativeModeInputActive ? "protected" : "idle";
    const lifecycle = status.contentLifecycleState ?? "unknown";
    const observer = status.observerLastBatchClass
        ? `${status.observerLastBatchClass}/${status.observerLastBatchSize ?? 0} in ${(status.observerLastDurationMs ?? 0).toFixed(1)}ms`
        : "idle";
    const blocked = status.nativeModeBlockedReason ? ` · blocked: ${status.nativeModeBlockedReason}` : "";
    const plan = status.nativeModePlanReason ? ` · plan: ${status.nativeModePlanReason}` : "";
    const featureCount = status.nativeModePlanActiveFeatures?.length ?? 0;
    const budget = typeof status.nativeModeMutationBudgetMs === "number"
        ? ` · budget: ${status.nativeModeMutationBudgetMs}ms/${status.nativeModeScrollOverscanPx ?? 0}px`
        : "";
    const snapshots = typeof status.nativeModeSnapshotHosts === "number"
        ? ` · snapshots: ${status.nativeModeSnapshotHosts} (${Math.round((status.nativeModeSnapshotCacheBytes ?? 0) / 1024)} KiB)`
        : "";
    const tokens = typeof status.nativeModeApproxInputTokens === "number"
        ? ` · prompt: ~${status.nativeModeApproxInputTokens}/${status.nativeModeTokenLimit ?? "?"} tokens${status.nativeModeTokenWarningLevel && status.nativeModeTokenWarningLevel !== "ok" ? ` ${status.nativeModeTokenWarningLevel}` : ""}`
        : "";
    const renderUnits = typeof status.nativeModeRenderUnitCost === "number"
        ? ` · render: cost ${status.nativeModeRenderUnitCost} turn ${status.nativeModeTurnNodeCost ?? 0} tool ${status.nativeModeToolNodeCost ?? 0} groups ${status.nativeModeToolGroupCount ?? 0} live ${status.nativeModeLiveWindowSize ?? "?"}`
        : "";
    const virtualization = status.nativeModeVirtualizationDisabled
        ? ` · virtualization: disabled (${status.nativeModeVirtualizationConflictReason ?? "conflict"})`
        : typeof status.nativeModeRevealLoopCount === "number" || typeof status.nativeModeScrollOscillationCount === "number"
            ? ` · virtualization: reveal ${status.nativeModeRevealLoopCount ?? 0}/scroll ${status.nativeModeScrollOscillationCount ?? 0}`
            : "";
    nativeDiagnosticsBody.textContent = `Adapter: ${adapter} · lifecycle: ${lifecycle} · selector: ${selectorHealth} · input: ${inputState} · features: ${featureCount} · observer: ${observer}${snapshots}${tokens}${renderUnits}${virtualization}${plan}${budget}${blocked}`;
}

function renderConfig(config: ExtensionConfig): void {
    currentConfig = config;
    writePopupCache({ ...readPopupCache(), config });
    toggleEnabled.checked = config.enabled;
    toggleStatus.checked = config.showStatus;
    toggleHideOld.checked = config.hideOldMessages;
    toggleDeliveryTimeoutRefresh.checked = config.autoRefreshDeliveryTimeout;
    visibleLimitInput.value = String(config.visibleMessageLimit);
    batchSizeInput.value = String(config.loadMoreBatchSize);
    requestLimitInput.value = String(config.weeklyRequestLimit);
    renderPerformanceMode(config.performanceMode);
    settingsSection.setAttribute("aria-disabled", String(!config.enabled));

    positionButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.pos === config.statusPosition);
    });
}

async function refreshStatus(): Promise<void> {
    try {
        const status = await safeSendMessage<ExtensionStatus | undefined>({ type: MessageType.GET_STATUS });
        if (status && typeof status.totalMessages === "number") {
            statusText.textContent = renderPopupStatusText(currentConfig, status);
            settingsSection.style.display = "flex"; // Set to flex only when the site is actually supported
            currentSiteId = status.siteId;
            writePopupCache({ ...readPopupCache(), config: currentConfig, status });
            renderPerformanceMode(currentConfig.performanceMode, status);
            renderNativeDiagnostics(status);
            await refreshRequestCounter();
        } else {
            settingsSection.style.display = "none";
            statusText.textContent = "Open a supported AI chat, or refresh a chat tab opened before install.";
            currentSiteId = undefined;
            renderPerformanceMode(currentConfig.performanceMode);
            renderNativeDiagnostics(undefined);
            requestCounter.hidden = true;
        }
    } catch {
        statusText.textContent = "Content script unavailable";
        renderNativeDiagnostics(undefined);
        requestCounter.hidden = true;
    }
}

async function refreshRequestCounter(): Promise<void> {
    if (!currentSiteId) { requestCounter.hidden = true; return; }
    const site = SITES.find((s) => s.id === currentSiteId);
    if (!site?.selectors.userMessageSelector) { requestCounter.hidden = true; return; }

    const data = await safeSendMessage<WeeklyRequestCount>({
        type: MessageType.GET_REQUEST_COUNT,
        payload: { siteId: currentSiteId },
    });
    if (!data) { requestCounter.hidden = true; return; }

    lastCount = data.count;
    lastWeekStart = data.weekStart;
    renderRequestCount(data.count, data.weekStart);
    requestCounter.hidden = false;
}

function renderRequestCount(count: number, weekStart: number): void {
    const limit = parseInt(requestLimitInput.value, 10);
    const hasLimit = !isNaN(limit) && limit > 0;

    requestCountValue.textContent = count.toLocaleString();
    requestLimitSep.hidden = !hasLimit;
    requestCountValue.classList.toggle("request-count-value--warn", hasLimit && count / limit >= 0.8);

    const resetDate = new Date(weekStart + 7 * 24 * 60 * 60 * 1000);
    const formatted = resetDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    requestCountHint.textContent = `Resets ${formatted}`;
}

function clampInput(input: HTMLInputElement, min: number, max: number): number {
    let value = parseInt(input.value, 10);
    if (isNaN(value)) value = min;
    value = Math.max(min, Math.min(max, value));
    input.value = String(value);
    return value;
}

function scheduleAutoSave(): void {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
        saveTimer = null;
        const visibleLimit = clampInput(visibleLimitInput, CONFIG_LIMITS.visibleMessageLimit.min, CONFIG_LIMITS.visibleMessageLimit.max);
        const batchSize = clampInput(batchSizeInput, CONFIG_LIMITS.loadMoreBatchSize.min, CONFIG_LIMITS.loadMoreBatchSize.max);
        const config = await safeSendMessage<ExtensionConfig>({
            type: MessageType.SET_CONFIG,
            payload: { visibleMessageLimit: visibleLimit, loadMoreBatchSize: batchSize },
        });
        if (config) renderConfig(config);
        await refreshStatus();
    }, 600);
}

function scheduleLimitSave(): void {
    if (limitSaveTimer) clearTimeout(limitSaveTimer);
    limitSaveTimer = setTimeout(async () => {
        limitSaveTimer = null;
        const limit = clampInput(requestLimitInput, CONFIG_LIMITS.weeklyRequestLimit.min, CONFIG_LIMITS.weeklyRequestLimit.max);
        const config = await safeSendMessage<ExtensionConfig>({
            type: MessageType.SET_CONFIG,
            payload: { weeklyRequestLimit: limit },
        });
        if (config) renderConfig(config);
        renderRequestCount(lastCount, lastWeekStart);
    }, 600);
}

toggleEnabled.addEventListener("change", async () => {
    const config = await safeSendMessage<ExtensionConfig>({ type: MessageType.TOGGLE_ENABLED });
    if (config) renderConfig(config);
    await refreshStatus();
});

toggleStatus.addEventListener("change", async () => {
    const config = await safeSendMessage<ExtensionConfig>({ type: MessageType.TOGGLE_STATUS });
    if (config) renderConfig(config);
    await refreshStatus();
});

// Auto Load has no popup listener because the control is intentionally hidden.

toggleHideOld.addEventListener("change", async () => {
    const config = await safeSendMessage<ExtensionConfig>({ type: MessageType.TOGGLE_HIDE_OLD_MESSAGES });
    if (config) renderConfig(config);
    await refreshStatus();
});

toggleDeliveryTimeoutRefresh.addEventListener("change", async () => {
    const config = await safeSendMessage<ExtensionConfig>({
        type: MessageType.SET_CONFIG,
        payload: { autoRefreshDeliveryTimeout: toggleDeliveryTimeoutRefresh.checked },
    });
    if (config) renderConfig(config);
    await refreshStatus();
});

modeButtons.forEach((button) => {
    button.addEventListener("click", async () => {
        const requestedMode = button.dataset.mode as PerformanceMode;
        const mode: PerformanceMode = requestedMode === "native" && !isNativeModeAllowedForSite(currentSiteId)
            ? "legacy"
            : requestedMode;
        if (mode === currentConfig.performanceMode) return;
        const config = await safeSendMessage<ExtensionConfig>({
            type: MessageType.SET_CONFIG,
            payload: { performanceMode: mode },
        });
        if (config) renderConfig(config);
        await refreshStatus();
    });
});

visibleLimitInput.addEventListener("input", scheduleAutoSave);
batchSizeInput.addEventListener("input", scheduleAutoSave);
requestLimitInput.addEventListener("input", scheduleLimitSave);

positionPicker.addEventListener("click", async (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".position-picker__btn");
    if (!btn || !btn.dataset.pos) return;
    const config = await safeSendMessage<ExtensionConfig>({
        type: MessageType.SET_CONFIG,
        payload: { statusPosition: btn.dataset.pos as StatusPosition },
    });
    if (config) renderConfig(config);
    await refreshStatus();
});

themeToggle.addEventListener("click", async () => {
    const currentTheme = (document.documentElement.getAttribute("data-theme") || "dark") as Theme;
    const newTheme: Theme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(newTheme);
    const optimisticConfig: ExtensionConfig = { ...currentConfig, theme: newTheme };
    renderConfig(optimisticConfig);

    const config = await safeSendMessage<ExtensionConfig>({
        type: MessageType.SET_CONFIG,
        payload: { theme: newTheme },
    });
    if (config) {
        applyTheme(config.theme);
        renderConfig(config);
    }
});

// Tooltip: fixed-position bubble that can't be clipped by popup overflow
const tooltip = document.getElementById("tooltip") as HTMLElement;
const TOOLTIP_W = 260; // must match CSS width
const POPUP_W = 320;   // body width

document.querySelectorAll<HTMLElement>("[data-tooltip]").forEach((el) => {
    el.addEventListener("mouseenter", () => {
        const text = el.dataset.tooltip;
        if (!text) return;
        tooltip.textContent = text;
        tooltip.classList.add("visible");

        // Measure after showing so offsetHeight is accurate
        const rect = el.getBoundingClientRect();
        const h = tooltip.offsetHeight;
        const gap = 6;
        const top = rect.top - h - gap >= 0
            ? rect.top - h - gap          // above
            : rect.bottom + gap;           // below (near top of popup)

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${(POPUP_W - TOOLTIP_W) / 2}px`; // always centered
    });
    el.addEventListener("mouseleave", () => tooltip.classList.remove("visible"));
});

requestCountReset.addEventListener("click", async () => {
    if (!currentSiteId) return;
    const data = await safeSendMessage<WeeklyRequestCount>({
        type: MessageType.RESET_REQUEST_COUNT,
        payload: { siteId: currentSiteId },
    });
    if (data) {
        lastCount = data.count;
        lastWeekStart = data.weekStart;
        renderRequestCount(data.count, data.weekStart);
    }
});

init();
