import { storageGet, storageSet, onStorageChanged } from "./browser-api";
import { STORAGE_KEY, DEFAULT_CONFIG, CONFIG_LIMITS, REQUEST_COUNTS_KEY, AUTO_LOAD_RESET_KEY } from "./constants";
import type { ExtensionConfig, WeeklyRequestCount } from "./types";
import { logger } from "./logger";

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(Math.round(value), min), max);
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
    const merged = sanitiseConfig({ ...current, ...partial });
    await storageSet(STORAGE_KEY, merged);
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

export async function loadRequestCount(siteId: string): Promise<WeeklyRequestCount> {
    const raw = await storageGet<Record<string, WeeklyRequestCount>>(REQUEST_COUNTS_KEY);
    const weekStart = getMondayUTCTimestamp();
    const entry = raw?.[siteId];
    if (!entry || entry.weekStart !== weekStart) return { count: 0, weekStart };
    return entry;
}

export async function incrementRequestCount(siteId: string, amount = 1): Promise<WeeklyRequestCount> {
    const raw = (await storageGet<Record<string, WeeklyRequestCount>>(REQUEST_COUNTS_KEY)) ?? {};
    const weekStart = getMondayUTCTimestamp();
    const existing = raw[siteId];
    const count = (existing?.weekStart === weekStart ? existing.count : 0) + amount;
    await storageSet(REQUEST_COUNTS_KEY, { ...raw, [siteId]: { count, weekStart } });
    return { count, weekStart };
}

export async function resetRequestCount(siteId: string): Promise<WeeklyRequestCount> {
    const raw = (await storageGet<Record<string, WeeklyRequestCount>>(REQUEST_COUNTS_KEY)) ?? {};
    const weekStart = getMondayUTCTimestamp();
    await storageSet(REQUEST_COUNTS_KEY, { ...raw, [siteId]: { count: 0, weekStart } });
    return { count: 0, weekStart };
}
