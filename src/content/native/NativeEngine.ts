import type { ExtensionConfig } from "../../shared/types";
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
}

export class NativeEngine {
    constructor(
        private readonly adapter: NativeSiteAdapter,
        private readonly diagnostics: NativeDiagnostics,
    ) {}

    evaluateStart(config: ExtensionConfig): NativeEngineDecision {
        const adapter = toNativeSiteAdapterSnapshot(this.adapter);

        if (!config.enabled) {
            return { canStart: false, reason: "extension disabled", adapter };
        }

        if (config.performanceMode !== "native") {
            return { canStart: false, reason: "native mode disabled", adapter };
        }

        if (this.adapter.support !== "enabled") {
            this.diagnostics.warn("native.adapter.planned", this.adapter.supportReason);
            return { canStart: false, reason: this.adapter.supportReason, adapter };
        }

        return { canStart: true, reason: "native adapter enabled", adapter };
    }

    snapshot(): NativeSiteAdapterSnapshot {
        return toNativeSiteAdapterSnapshot(this.adapter);
    }
}
