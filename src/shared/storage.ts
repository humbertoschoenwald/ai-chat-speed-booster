import { storageGet, storageSet, storageGetSync, storageSetSync, onStorageChanged } from "./browser-api";
import { STORAGE_KEY, DEFAULT_CONFIG, CONFIG_LIMITS, REQUEST_COUNTS_KEY, AUTO_LOAD_RESET_KEY, MODE_PROFILES_KEY } from "./constants";
import type { ExtensionConfig, WeeklyRequestCount } from "./types";
import { logger } from "./logger";

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(Math.round(value), min), max);
}

function sanitisePerformanceMode(value: unknown): "legacy" | "native" {
    return value === "native" ? "native" : "legacy";
}

type ModeProfile = Pick<ExtensionConfig,
    "visibleMessageLimit" |
    "loadMoreBatchSize" |
    "showStatus" |
    "statusPosition" |
    "fetchInterceptEnabled" |
    "autoLoad" |
    "hideOldMessages"
>;

type ModeProfiles = Partial<Record<"legacy" | "native", Partial<ModeProfile>>>;

function extractModeProfile(config: ExtensionConfig): ModeProfile {
    return {
        visibleMessageLimit: config.visibleMessageLimit,
        loadMoreBatchSize: config.loadMoreBatchSize,
        showStatus: config.showStatus,
        statusPosition: config.statusPosition,
        fetchInterceptEnabled: config.fetchInterceptEnabled,
        autoLoad: config.autoLoad,
        hideOldMessages: config.hideOldMessages,
    };
}

async function loadModeProfiles(): Promise<ModeProfiles> {
    try {
        return (await storageGet<ModeProfiles>(MODE_PROFILES_KEY)) ?? {};
    } catch {
        return {};
    }
}

async function saveModeProfiles(profiles: ModeProfiles): Promise<void> {
    try {
        await storageSet(MODE_PROFILES_KEY, profiles);
    } catch (error) {
        logger.debug("failed to save mode profiles", error);
    }
}

function sanitiseConfig(raw: Partial<ExtensionConfig> | undefined): ExtensionConfig {
    const base = { ...DEFAULT_CONFIG, ...raw };
    return {
        visibleMessageLimit: clamp(
            base.visibleMessageLimit,
            CONFIG_LIMITS.visibleMessageLimit.min,
            CONFIG_LIMITS.visibleMessageLimit.max,
        ),
        loadMoreBatchSize: clamp(
            base.loadMoreBatchSize,
            CONFIG_LIMITS.loadMoreBatchSize.min,
            CONFIG_LIMITS.loadMoreBatchSize.max,
        ),
        enabled: typeof base.enabled === "boolean" ? base.enabled : DEFAULT_CONFIG.enabled,
        performanceMode: sanitisePerformanceMode(base.performanceMode),
        showStatus: typeof base.showStatus === "boolean" ? base.showStatus : DEFAULT_CONFIG.showStatus,
        statusPosition: ["top-left", "top-right", "bottom-left", "bottom-right"].includes(base.statusPosition)
            ? base.statusPosition
            : DEFAULT_CONFIG.statusPosition,
        fetchInterceptEnabled: typeof base.fetchInterceptEnabled === "boolean" ? base.fetchInterceptEnabled : DEFAULT_CONFIG.fetchInterceptEnabled,
        autoLoad: typeof base.autoLoad === "boolean" ? base.autoLoad : DEFAULT_CONFIG.autoLoad,
        weeklyRequestLimit: clamp(base.weeklyRequestLimit ?? DEFAULT_CONFIG.weeklyRequestLimit, CONFIG_LIMITS.weeklyRequestLimit.min, CONFIG_LIMITS.weeklyRequestLimit.max),
        theme: base.theme === "light" || base.theme === "dark" ? base.theme : DEFAULT_CONFIG.theme,
        hideOldMessages: typeof base.hideOldMessages === "boolean" ? base.hideOldMessages : DEFAULT_CONFIG.hideOldMessages,
    };
}

export async function loadConfig(): Promise<ExtensionConfig> {
    try {
        const raw = await storageGet<Partial<ExtensionConfig>>(STORAGE_KEY);
        const config = sanitiseConfig(raw);
        return await applyAutoLoadReset(config);
    } catch (error) {
        logger.error("failed to load config, using defaults", error);
        return { ...DEFAULT_CONFIG };
    }
}

/**
 * One-time reset: Auto Load originally shipped enabled by default and caused
 * scroll regressions, so we force it off once per profile and remember we did.
 * Users who want the Beta can re-enable it from the popup.
 */
async function applyAutoLoadReset(config: ExtensionConfig): Promise<ExtensionConfig> {
    try {
        const done = await storageGet<boolean>(AUTO_LOAD_RESET_KEY);
        if (done) return config;
        await storageSet(AUTO_LOAD_RESET_KEY, true);
        if (!config.autoLoad) return config;
        const reset: ExtensionConfig = { ...config, autoLoad: false };
        await storageSet(STORAGE_KEY, reset);
        logger.debug("auto-load reset applied (one-time)");
        return reset;
    } catch {
        return config;
    }
}

export async function saveConfig(partial: Partial<ExtensionConfig>): Promise<ExtensionConfig> {
    const current = await loadConfig();
    const profiles = await loadModeProfiles();
    const currentMode = current.performanceMode;
    const targetMode = sanitisePerformanceMode(partial.performanceMode ?? currentMode);
    const changedMode = targetMode !== currentMode;

    profiles[currentMode] = {
        ...profiles[currentMode],
        ...extractModeProfile(current),
    };

    const restoredProfile = changedMode ? profiles[targetMode] : undefined;
    const merged = sanitiseConfig({ ...current, ...restoredProfile, ...partial, performanceMode: targetMode });

    profiles[merged.performanceMode] = {
        ...profiles[merged.performanceMode],
        ...extractModeProfile(merged),
    };

    await storageSet(STORAGE_KEY, merged);
    await saveModeProfiles(profiles);
    logger.debug("config saved", merged);
    return merged;
}

export function onConfigChanged(callback: (config: ExtensionConfig) => void): void {
    onStorageChanged((changes, area) => {
        if (area !== "local" || !(STORAGE_KEY in changes)) return;
        const newValue = changes[STORAGE_KEY].newValue as Partial<ExtensionConfig> | undefined;
        callback(sanitiseConfig(newValue));
    });
}

// ---------------------------------------------------------------------------
// Weekly request counters
// ---------------------------------------------------------------------------

function getMondayUTCTimestamp(): number {
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon, …
    const daysSinceMonday = (dayOfWeek + 6) % 7;
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceMonday);
}

type RequestCountMap = Record<string, WeeklyRequestCount>;

function activeRequestCount(entry: WeeklyRequestCount | undefined, weekStart: number): number {
    return entry?.weekStart === weekStart ? entry.count : 0;
}

async function loadSyncedRequestCounts(): Promise<RequestCountMap> {
    try {
        return (await storageGetSync<RequestCountMap>(REQUEST_COUNTS_KEY)) ?? {};
    } catch (error) {
        logger.debug("browser account request-count sync unavailable", error);
        return {};
    }
}

async function saveRequestCounts(raw: RequestCountMap): Promise<void> {
    await storageSet(REQUEST_COUNTS_KEY, raw);
    try {
        await storageSetSync(REQUEST_COUNTS_KEY, raw);
    } catch (error) {
        logger.debug("failed to mirror request counts to browser sync storage", error);
    }
}

export async function loadRequestCount(siteId: string): Promise<WeeklyRequestCount> {
    const localRaw = (await storageGet<RequestCountMap>(REQUEST_COUNTS_KEY)) ?? {};
    const syncedRaw = await loadSyncedRequestCounts();
    const weekStart = getMondayUTCTimestamp();
    const count = Math.max(
        activeRequestCount(localRaw[siteId], weekStart),
        activeRequestCount(syncedRaw[siteId], weekStart),
    );
    const merged = { count, weekStart };
    if (activeRequestCount(localRaw[siteId], weekStart) !== count || activeRequestCount(syncedRaw[siteId], weekStart) !== count) {
        await saveRequestCounts({ ...localRaw, ...syncedRaw, [siteId]: merged });
    }
    return merged;
}

export async function incrementRequestCount(siteId: string, amount = 1): Promise<WeeklyRequestCount> {
    const localRaw = (await storageGet<RequestCountMap>(REQUEST_COUNTS_KEY)) ?? {};
    const syncedRaw = await loadSyncedRequestCounts();
    const weekStart = getMondayUTCTimestamp();
    const count = Math.max(
        activeRequestCount(localRaw[siteId], weekStart),
        activeRequestCount(syncedRaw[siteId], weekStart),
    ) + amount;
    const updated = { ...localRaw, ...syncedRaw, [siteId]: { count, weekStart } };
    await saveRequestCounts(updated);
    return { count, weekStart };
}

export async function resetRequestCount(siteId: string): Promise<WeeklyRequestCount> {
    const localRaw = (await storageGet<RequestCountMap>(REQUEST_COUNTS_KEY)) ?? {};
    const syncedRaw = await loadSyncedRequestCounts();
    const weekStart = getMondayUTCTimestamp();
    const updated = { ...localRaw, ...syncedRaw, [siteId]: { count: 0, weekStart } };
    await saveRequestCounts(updated);
    return { count: 0, weekStart };
}
