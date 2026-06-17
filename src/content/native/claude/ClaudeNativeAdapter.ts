import type { NativeSiteAdapter } from "../NativeSiteAdapter";

export const CLAUDE_NATIVE_ADAPTER: NativeSiteAdapter = {
    siteId: "claude",
    displayName: "Claude",
    support: "planned",
    supportReason: "Claude has a DOM adapter, but Native Mode is not yet enabled for it.",
    capabilities: {
        selectorGuard: true,
        editorInputProtection: false,
        scrollStableVirtualization: false,
        toolCallGrouping: false,
        staleGenerationRecovery: false,
    },
};
