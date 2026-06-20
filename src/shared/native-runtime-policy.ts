import type { ExtensionConfig, PerformanceMode } from "./types";

export const NATIVE_CHATGPT_SITE_ID = "chatgpt" as const;
export const NATIVE_CHATGPT_HOSTNAME = "chatgpt.com" as const;

export function isNativeModeAllowedForSite(siteId: string | undefined): boolean {
    return siteId === NATIVE_CHATGPT_SITE_ID;
}

export function isNativeModeAllowedForHostname(hostname: string): boolean {
    return hostname === NATIVE_CHATGPT_HOSTNAME || hostname.endsWith(`.${NATIVE_CHATGPT_HOSTNAME}`);
}

export function getEffectivePerformanceMode(
    configuredMode: PerformanceMode,
    siteId: string | undefined,
): PerformanceMode {
    return configuredMode === "native" && isNativeModeAllowedForSite(siteId)
        ? "native"
        : "legacy";
}

export function deriveRuntimeConfigForSite(config: ExtensionConfig, siteId: string | undefined): ExtensionConfig {
    const performanceMode = getEffectivePerformanceMode(config.performanceMode, siteId);
    if (performanceMode === "legacy") {
        return {
            ...config,
            performanceMode,
            autoLoad: false,
            hideOldMessages: true,
        };
    }

    return {
        ...config,
        performanceMode,
        fetchInterceptEnabled: false,
        autoLoad: false,
        hideOldMessages: false,
        showStatus: false,
    };
}
