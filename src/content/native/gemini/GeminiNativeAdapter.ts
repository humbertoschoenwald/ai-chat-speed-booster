import type { NativeSiteAdapter } from "../NativeSiteAdapter";

export const GEMINI_NATIVE_ADAPTER: NativeSiteAdapter = {
    siteId: "gemini",
    displayName: "Gemini",
    support: "enabled",
    supportReason: "Gemini runs through the conservative Native/Extreme controller with no automatic reload fallback.",
    capabilities: {
        selectorGuard: true,
        editorInputProtection: false,
        scrollStableVirtualization: false,
        toolCallGrouping: false,
        staleGenerationRecovery: false,
    },
};
