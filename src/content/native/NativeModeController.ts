import type { SiteConfig } from "../../shared/sites";
import type { ExtensionConfig } from "../../shared/types";
import { NativeDiagnostics } from "./NativeDiagnostics";
import { SelectorRegistry, type SelectorHealth } from "./SelectorRegistry";

export interface NativeModeState {
    readonly active: boolean;
    readonly selectorHealth: SelectorHealth | null;
}

export class NativeModeController {
    private readonly diagnostics = new NativeDiagnostics();
    private readonly selectors: SelectorRegistry;
    private state: NativeModeState = { active: false, selectorHealth: null };

    constructor(site: SiteConfig) {
        this.selectors = new SelectorRegistry(site, this.diagnostics);
    }

    updateConfig(config: ExtensionConfig): NativeModeState {
        if (config.performanceMode !== "native" || !config.enabled) {
            this.stop("native mode disabled");
            return this.state;
        }

        const selectorHealth = this.selectors.evaluate();
        if (!selectorHealth.healthy) {
            this.stop("selector health failed");
            this.state = { active: false, selectorHealth };
            return this.state;
        }

        this.diagnostics.setNativeEnabled(true);
        this.state = { active: true, selectorHealth };
        return this.state;
    }

    stop(reason: string): void {
        if (this.state.active) this.diagnostics.info("native.stop", reason);
        this.diagnostics.setNativeEnabled(false);
        this.state = { ...this.state, active: false };
    }

    snapshot(): NativeModeState {
        return this.state;
    }

    diagnosticSnapshot(): ReturnType<NativeDiagnostics["snapshot"]> {
        return this.diagnostics.snapshot();
    }
}
