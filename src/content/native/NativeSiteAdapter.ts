import { CHATGPT_NATIVE_ADAPTER } from "./chatgpt/ChatGptNativeAdapter";
import { CLAUDE_NATIVE_ADAPTER } from "./claude/ClaudeNativeAdapter";
import { DEEPSEEK_NATIVE_ADAPTER } from "./deepseek/DeepSeekNativeAdapter";
import { GEMINI_NATIVE_ADAPTER } from "./gemini/GeminiNativeAdapter";
import { GROK_NATIVE_ADAPTER } from "./grok/GrokNativeAdapter";
import { SEARCH_AI_MODE_NATIVE_ADAPTER } from "./search-ai-mode/SearchAiModeNativeAdapter";
import type { NativeTuningProfile, NativeTuningProfileSnapshot } from "./NativeTuningProfile";
import { toNativeTuningProfileSnapshot } from "./NativeTuningProfile";

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
    readonly tuningProfile?: NativeTuningProfile;
}

export interface NativeSiteAdapterSnapshot {
    readonly siteId: string;
    readonly displayName: string;
    readonly support: NativeAdapterSupport;
    readonly supportReason: string;
    readonly nativeEnabled: boolean;
    readonly tuningProfile: NativeTuningProfileSnapshot | null;
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
    CLAUDE_NATIVE_ADAPTER,
    GEMINI_NATIVE_ADAPTER,
    DEEPSEEK_NATIVE_ADAPTER,
    GROK_NATIVE_ADAPTER,
    SEARCH_AI_MODE_NATIVE_ADAPTER,
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
        tuningProfile: adapter.tuningProfile ? toNativeTuningProfileSnapshot(adapter.tuningProfile) : null,
    };
}
