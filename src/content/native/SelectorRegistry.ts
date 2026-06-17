import type { SiteConfig } from "../../shared/sites";
import { NativeDiagnostics } from "./NativeDiagnostics";

export interface SelectorHealth {
    readonly healthy: boolean;
    readonly messageTurnCount: number;
    readonly hasScrollContainer: boolean;
    readonly reasons: readonly string[];
}

export class SelectorRegistry {
    constructor(
        private readonly site: SiteConfig,
        private readonly diagnostics: NativeDiagnostics,
    ) {}

    evaluate(): SelectorHealth {
        const reasons: string[] = [];
        const messageTurnCount = document.querySelectorAll(
            this.site.selectors.messageTurn,
        ).length;
        if (messageTurnCount === 0) reasons.push("no message turns matched");

        const hasScrollContainer = this.hasScrollContainer();
        if (!hasScrollContainer) reasons.push("no scroll container matched");

        const healthy = reasons.length === 0;
        this.diagnostics.setSelectorHealthy(healthy);
        if (healthy) {
            this.diagnostics.info("selector.health.ok", "native selector guard passed");
        } else {
            this.diagnostics.warn("selector.health.failed", reasons.join("; "));
        }

        return { healthy, messageTurnCount, hasScrollContainer, reasons };
    }

    private hasScrollContainer(): boolean {
        if (document.querySelector(this.site.selectors.scrollContainer)) return true;
        const alt = this.site.selectors.scrollContainerAlt;
        return typeof alt === "string" && document.querySelector(alt) !== null;
    }
}
