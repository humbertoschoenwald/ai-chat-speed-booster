import type { NativeSiteAdapter } from "../NativeSiteAdapter";

export const SEARCH_AI_MODE_NATIVE_ADAPTER: NativeSiteAdapter = {
    siteId: "search-ai-mode",
    displayName: "Search AI Mode",
    support: "planned",
    supportReason: "Search AI Mode support is DOM-only for now; Native Mode remains disabled.",
    capabilities: {
        selectorGuard: true,
        editorInputProtection: false,
        scrollStableVirtualization: false,
        toolCallGrouping: false,
        staleGenerationRecovery: false,
    },
};
