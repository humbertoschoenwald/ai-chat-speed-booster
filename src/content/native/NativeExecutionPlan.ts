import type { ExtensionConfig } from "../../shared/types";
import type { NativeSiteAdapter } from "./NativeSiteAdapter";

export interface NativeExecutionPlanSnapshot {
    readonly siteId: string;
    readonly canStart: boolean;
    readonly reason: string;
    readonly activeFeatures: readonly string[];
    readonly blockedFeatures: readonly string[];
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

    if (config.performanceMode !== "native") {
        return block(adapter, "native mode disabled");
    }

    if (adapter.support !== "enabled") {
        return block(adapter, adapter.supportReason);
    }

    const profile = adapter.tuningProfile;
    return {
        siteId: adapter.siteId,
        canStart: true,
        reason: "native adapter enabled",
        activeFeatures: profile?.enabledFeatures ?? capabilityFeatures(adapter),
        blockedFeatures: profile?.blockedFeatures ?? [],
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
