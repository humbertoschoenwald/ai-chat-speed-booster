import nativeSites from "../../native-sites.config.json";
import type { ExtensionConfig, PerformanceMode } from "./types";

type NativeSiteMode = "enabled" | "planned";
interface NativeSiteConfig {
    readonly siteId: string;
    readonly nativeMode: NativeSiteMode;
}

const NATIVE_SITES = nativeSites as readonly NativeSiteConfig[];

export function isNativeModeAllowedForSite(siteId: string | undefined): boolean {
    return NATIVE_SITES.some((site) => site.siteId === siteId && site.nativeMode === "enabled");
}

export function getNativeModeSiteState(siteId: string | undefined): NativeSiteMode | "unsupported" {
    return NATIVE_SITES.find((site) => site.siteId === siteId)?.nativeMode ?? "unsupported";
}

export function isNativeModeAllowedForHostname(hostname: string): boolean {
    return hostname === "chatgpt.com" || hostname.endsWith(".chatgpt.com");
}

export function getEffectivePerformanceMode(
    configuredMode: PerformanceMode,
    siteId: string | undefined,
): PerformanceMode {
    if (configuredMode === "extreme") return "extreme";
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
            fetchInterceptEnabled: false,
            autoLoad: false,
            hideOldMessages: true,
        };
    }

    if (performanceMode === "extreme") {
        return {
            ...config,
            performanceMode,
            visibleMessageLimit: 1,
            loadMoreBatchSize: 1,
            fetchInterceptEnabled: true,
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
