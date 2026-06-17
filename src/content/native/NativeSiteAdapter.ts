import { CHATGPT_NATIVE_ADAPTER } from "./chatgpt/ChatGptNativeAdapter";

export type NativeAdapterSupport = "enabled" | "planned";

export interface NativeAdapterCapabilities {
    readonly selectorGuard: boolean;
    readonly editorInputProtection: boolean;
    readonly scrollStableVirtualization: boolean;
    readonly toolCallGrouping: boolean;
    readonly staleGenerationRecovery: boolean;
}

export interface NativeSiteAdapter {
    readonly siteId: string;
    readonly displayName: string;
    readonly support: NativeAdapterSupport;
    readonly supportReason: string;
    readonly capabilities: NativeAdapterCapabilities;
}

export interface NativeSiteAdapterSnapshot {
    readonly siteId: string;
    readonly displayName: string;
    readonly support: NativeAdapterSupport;
    readonly supportReason: string;
    readonly nativeEnabled: boolean;
}

const PLANNED_CAPABILITIES: NativeAdapterCapabilities = {
    selectorGuard: true,
    editorInputProtection: false,
    scrollStableVirtualization: false,
    toolCallGrouping: false,
    staleGenerationRecovery: false,
};

export const NATIVE_SITE_ADAPTERS: readonly NativeSiteAdapter[] = [
    CHATGPT_NATIVE_ADAPTER,
    {
        siteId: "claude",
        displayName: "Claude",
        support: "planned",
        supportReason: "Claude has a DOM adapter, but Native Mode is not yet enabled for it.",
        capabilities: PLANNED_CAPABILITIES,
    },
    {
        siteId: "gemini",
        displayName: "Gemini",
        support: "planned",
        supportReason: "Gemini has dynamic rendering and needs separate Native Mode validation.",
        capabilities: PLANNED_CAPABILITIES,
    },
    {
        siteId: "deepseek",
        displayName: "DeepSeek",
        support: "planned",
        supportReason: "DeepSeek support is DOM-only for now; Native Mode remains disabled.",
        capabilities: PLANNED_CAPABILITIES,
    },
    {
        siteId: "grok",
        displayName: "Grok",
        support: "planned",
        supportReason: "Grok support is DOM-only for now; Native Mode remains disabled.",
        capabilities: PLANNED_CAPABILITIES,
    },
    {
        siteId: "search-ai-mode",
        displayName: "Search AI Mode",
        support: "planned",
        supportReason: "Search AI Mode support is DOM-only for now; Native Mode remains disabled.",
        capabilities: PLANNED_CAPABILITIES,
    },
];

export function getNativeSiteAdapter(siteId: string): NativeSiteAdapter {
    return NATIVE_SITE_ADAPTERS.find((adapter) => adapter.siteId === siteId) ?? {
        siteId,
        displayName: siteId,
        support: "planned",
        supportReason: "Unknown site adapters are not allowed to start Native Mode.",
        capabilities: PLANNED_CAPABILITIES,
    };
}

export function toNativeSiteAdapterSnapshot(adapter: NativeSiteAdapter): NativeSiteAdapterSnapshot {
    return {
        siteId: adapter.siteId,
        displayName: adapter.displayName,
        support: adapter.support,
        supportReason: adapter.supportReason,
        nativeEnabled: adapter.support === "enabled",
    };
}
