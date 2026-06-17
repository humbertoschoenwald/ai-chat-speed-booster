import type { SiteConfig } from "../../shared/sites";
import type { ExtensionConfig } from "../../shared/types";
import { EditorInputOptimizer, type EditorInputSnapshot } from "./EditorInputOptimizer";
import { NativeDiagnostics } from "./NativeDiagnostics";
import { NativeEngine } from "./NativeEngine";
import { getNativeSiteAdapter, type NativeSiteAdapterSnapshot } from "./NativeSiteAdapter";
import { SelectorRegistry, type SelectorHealth } from "./SelectorRegistry";

export interface NativeModeState {
    readonly active: boolean;
    readonly selectorHealth: SelectorHealth | null;
    readonly editorInput: EditorInputSnapshot;
    readonly adapter: NativeSiteAdapterSnapshot;
    readonly blockedReason: string | null;
}

export class NativeModeController {
    private readonly diagnostics = new NativeDiagnostics();
    private readonly editorInput = new EditorInputOptimizer();
    private readonly engine: NativeEngine;
    private readonly selectors: SelectorRegistry;
    private state: NativeModeState;

    constructor(site: SiteConfig) {
        const adapter = getNativeSiteAdapter(site.id);
        this.engine = new NativeEngine(adapter, this.diagnostics);
        this.selectors = new SelectorRegistry(site, this.diagnostics);
        this.state = this.createState(false, null, "not started");
    }

    updateConfig(config: ExtensionConfig): NativeModeState {
        const engineDecision = this.engine.evaluateStart(config);
        if (!engineDecision.canStart) {
            this.stop(engineDecision.reason);
            this.state = this.createState(false, this.state.selectorHealth, engineDecision.reason);
            return this.state;
        }

        const selectorHealth = this.selectors.evaluate();
        if (!selectorHealth.healthy) {
            this.stop("selector health failed");
            this.state = this.createState(false, selectorHealth, "selector health failed");
            return this.state;
        }

        this.editorInput.start();
        this.diagnostics.setNativeEnabled(true);
        this.state = this.createState(true, selectorHealth, null);
        return this.state;
    }

    stop(reason: string): void {
        if (this.state.active) this.diagnostics.info("native.stop", reason);
        this.editorInput.stop();
        this.diagnostics.setNativeEnabled(false);
        this.state = this.createState(false, this.state.selectorHealth, reason);
    }

    shouldDeferBackgroundWork(): boolean {
        if (!this.state.active) return false;
        return this.editorInput.shouldDeferBackgroundWork();
    }

    deferBackgroundWork(): void {
        if (!this.state.active) return;
        this.editorInput.deferTask();
        this.state = this.createState(this.state.active, this.state.selectorHealth, this.state.blockedReason);
    }

    snapshot(): NativeModeState {
        return this.createState(this.state.active, this.state.selectorHealth, this.state.blockedReason);
    }

    diagnosticSnapshot(): ReturnType<NativeDiagnostics["snapshot"]> {
        return this.diagnostics.snapshot();
    }

    private createState(
        active: boolean,
        selectorHealth: SelectorHealth | null,
        blockedReason: string | null,
    ): NativeModeState {
        return {
            active,
            selectorHealth,
            editorInput: this.editorInput.snapshot(),
            adapter: this.engine.snapshot(),
            blockedReason,
        };
    }
}
