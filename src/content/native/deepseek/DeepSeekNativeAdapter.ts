import type { NativeSiteAdapter } from "../NativeSiteAdapter";

export const DEEPSEEK_NATIVE_ADAPTER: NativeSiteAdapter = {
    siteId: "deepseek",
    displayName: "DeepSeek",
    support: "planned",
    supportReason: "DeepSeek support is DOM-only for now; Native Mode remains disabled.",
    capabilities: {
        selectorGuard: true,
        editorInputProtection: false,
        scrollStableVirtualization: false,
        toolCallGrouping: false,
        staleGenerationRecovery: false,
    },
};
