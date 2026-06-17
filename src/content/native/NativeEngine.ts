import type { ExtensionConfig } from "../../shared/types";
import { createNativeExecutionPlan, type NativeExecutionPlanSnapshot } from "./NativeExecutionPlan";
import type { NativeDiagnostics } from "./NativeDiagnostics";
import {
    type NativeSiteAdapter,
    type NativeSiteAdapterSnapshot,
    toNativeSiteAdapterSnapshot,
} from "./NativeSiteAdapter";

export interface NativeEngineDecision {
    readonly canStart: boolean;
    readonly reason: string;
    readonly adapter: NativeSiteAdapterSnapshot;
    readonly plan: NativeExecutionPlanSnapshot;
}

export class NativeEngine {
    constructor(
        private readonly adapter: NativeSiteAdapter,
        private readonly diagnostics: NativeDiagnostics,
    ) {}

    evaluateStart(config: ExtensionConfig): NativeEngineDecision {
        const adapter = toNativeSiteAdapterSnapshot(this.adapter);
        const plan = createNativeExecutionPlan(this.adapter, config);

        if (!plan.canStart && config.performanceMode === "native" && this.adapter.support !== "enabled") {
            this.diagnostics.warn("native.adapter.planned", this.adapter.supportReason);
        }

        return {
            canStart: plan.canStart,
            reason: plan.reason,
            adapter,
            plan,
        };
    }

    snapshot(): NativeSiteAdapterSnapshot {
        return toNativeSiteAdapterSnapshot(this.adapter);
    }
}
