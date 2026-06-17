import type { NativeSiteAdapter } from "../NativeSiteAdapter";

export const GROK_NATIVE_ADAPTER: NativeSiteAdapter = {
    siteId: "grok",
    displayName: "Grok",
    support: "planned",
    supportReason: "Grok support is DOM-only for now; Native Mode remains disabled.",
    capabilities: {
        selectorGuard: true,
        editorInputProtection: false,
        scrollStableVirtualization: false,
        toolCallGrouping: false,
        staleGenerationRecovery: false,
    },
};
