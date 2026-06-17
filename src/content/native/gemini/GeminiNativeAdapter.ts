import type { NativeSiteAdapter } from "../NativeSiteAdapter";

export const GEMINI_NATIVE_ADAPTER: NativeSiteAdapter = {
    siteId: "gemini",
    displayName: "Gemini",
    support: "planned",
    supportReason: "Gemini has dynamic rendering and needs separate Native Mode validation.",
    capabilities: {
        selectorGuard: true,
        editorInputProtection: false,
        scrollStableVirtualization: false,
        toolCallGrouping: false,
        staleGenerationRecovery: false,
    },
};
