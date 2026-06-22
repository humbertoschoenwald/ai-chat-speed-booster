import type { ExtensionConfig } from "../../shared/types";
import type { NativeSiteAdapter } from "./NativeSiteAdapter";
import { resolveNativeFeatureFlags, type NativeAutoDisableRecord } from "./NativeFeatureFlags";

export interface NativeExecutionPlanSnapshot {
    readonly siteId: string;
    readonly canStart: boolean;
    readonly reason: string;
    readonly activeFeatures: readonly string[];
    readonly blockedFeatures: readonly string[];
    readonly autoDisabledFeatures: readonly NativeAutoDisableRecord[];
    readonly mutationBudgetMs: number | null;
    readonly inputQuietWindowMs: number | null;
    readonly scrollOverscanPx: number | null;
}

export function createNativeExecutionPlan(
    adapter: NativeSiteAdapter,
    config: ExtensionConfig,
): NativeExecutionPlanSnapshot {
    if (!config.enabled) {
        return block(adapter, "extension disabled");
    }

    const nativeLikeMode = config.performanceMode === "native" || config.performanceMode === "extreme";
    if (!nativeLikeMode) {
        return block(adapter, "native mode disabled");
    }

    if (config.performanceMode === "native" && adapter.support !== "enabled") {
        return block(adapter, adapter.supportReason);
    }

    const profile = adapter.tuningProfile;
    const flagResolution = resolveNativeFeatureFlags(profile?.enabledFeatures ?? capabilityFeatures(adapter));
    return {
        siteId: adapter.siteId,
        canStart: true,
        reason: config.performanceMode === "extreme" ? "extreme controller enabled" : "native adapter enabled",
        activeFeatures: flagResolution.activeFeatures,
        blockedFeatures: [...profile?.blockedFeatures ?? [], ...flagResolution.disabledFeatures],
        autoDisabledFeatures: flagResolution.autoDisabledFeatures,
        mutationBudgetMs: profile?.budgets.mutationBudgetMs ?? null,
        inputQuietWindowMs: profile?.budgets.inputQuietWindowMs ?? null,
        scrollOverscanPx: profile?.budgets.scrollOverscanPx ?? null,
    };
}

function block(adapter: NativeSiteAdapter, reason: string): NativeExecutionPlanSnapshot {
    return {
        siteId: adapter.siteId,
        canStart: false,
        reason,
        activeFeatures: [],
        blockedFeatures: [reason],
        autoDisabledFeatures: [],
        mutationBudgetMs: null,
        inputQuietWindowMs: null,
        scrollOverscanPx: null,
    };
}

function capabilityFeatures(adapter: NativeSiteAdapter): readonly string[] {
    return Object.entries(adapter.capabilities)
        .filter(([, enabled]) => enabled)
        .map(([feature]) => feature);
}
