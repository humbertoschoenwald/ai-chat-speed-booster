export interface NativeWorkBudgets {
    readonly mutationBudgetMs: number;
    readonly inputQuietWindowMs: number;
    readonly restoreQuietWindowMs: number;
    readonly scrollOverscanPx: number;
    readonly maxFrozenTurns: number;
}

export interface NativeSelectorTuning {
    readonly turnRoot: string;
    readonly composerRoot: string;
    readonly streamingControls: readonly string[];
    readonly toolCallRoots: readonly string[];
}

export interface NativeTuningProfile {
    readonly id: string;
    readonly siteId: string;
    readonly budgets: NativeWorkBudgets;
    readonly selectors: NativeSelectorTuning;
    readonly enabledFeatures: readonly string[];
    readonly blockedFeatures: readonly string[];
}

export interface NativeTuningProfileSnapshot {
    readonly id: string;
    readonly siteId: string;
    readonly enabledFeatureCount: number;
    readonly blockedFeatureCount: number;
    readonly mutationBudgetMs: number;
    readonly inputQuietWindowMs: number;
    readonly scrollOverscanPx: number;
}

export function toNativeTuningProfileSnapshot(profile: NativeTuningProfile): NativeTuningProfileSnapshot {
    return {
        id: profile.id,
        siteId: profile.siteId,
        enabledFeatureCount: profile.enabledFeatures.length,
        blockedFeatureCount: profile.blockedFeatures.length,
        mutationBudgetMs: profile.budgets.mutationBudgetMs,
        inputQuietWindowMs: profile.budgets.inputQuietWindowMs,
        scrollOverscanPx: profile.budgets.scrollOverscanPx,
    };
}
