import type { SiteConfig } from "../../shared/sites";
import type { ExtensionConfig } from "../../shared/types";
import { EditorInputOptimizer, type EditorInputSnapshot } from "./EditorInputOptimizer";
import { NativeDiagnostics } from "./NativeDiagnostics";
import { SelectorRegistry, type SelectorHealth } from "./SelectorRegistry";

export interface NativeModeState {
    readonly active: boolean;
    readonly selectorHealth: SelectorHealth | null;
    readonly editorInput: EditorInputSnapshot;
}

export class NativeModeController {
    private readonly diagnostics = new NativeDiagnostics();
    private readonly editorInput = new EditorInputOptimizer();
    private readonly selectors: SelectorRegistry;
    private state: NativeModeState = this.createState(false, null);

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
            this.state = this.createState(false, selectorHealth);
            return this.state;
        }

        this.editorInput.start();
        this.diagnostics.setNativeEnabled(true);
        this.state = this.createState(true, selectorHealth);
        return this.state;
    }

    stop(reason: string): void {
        if (this.state.active) this.diagnostics.info("native.stop", reason);
        this.editorInput.stop();
        this.diagnostics.setNativeEnabled(false);
        this.state = this.createState(false, this.state.selectorHealth);
    }

    shouldDeferBackgroundWork(): boolean {
        if (!this.state.active) return false;
        return this.editorInput.shouldDeferBackgroundWork();
    }

    deferBackgroundWork(): void {
        if (!this.state.active) return;
        this.editorInput.deferTask();
        this.state = this.createState(this.state.active, this.state.selectorHealth);
    }

    snapshot(): NativeModeState {
        return this.createState(this.state.active, this.state.selectorHealth);
    }

    diagnosticSnapshot(): ReturnType<NativeDiagnostics["snapshot"]> {
        return this.diagnostics.snapshot();
    }

    private createState(active: boolean, selectorHealth: SelectorHealth | null): NativeModeState {
        return {
            active,
            selectorHealth,
            editorInput: this.editorInput.snapshot(),
        };
    }
}
