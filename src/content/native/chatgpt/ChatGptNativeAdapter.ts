import type { NativeSiteAdapter } from "../NativeSiteAdapter";
import { CHATGPT_NATIVE_TUNING_PROFILE } from "./ChatGptNativeTuningProfile";

export const CHATGPT_NATIVE_ADAPTER: NativeSiteAdapter = {
    siteId: "chatgpt",
    displayName: "ChatGPT",
    support: "enabled",
    supportReason: "ChatGPT is the only Native Mode target enabled while site-specific tuning matures.",
    capabilities: {
        selectorGuard: true,
        editorInputProtection: true,
        scrollStableVirtualization: false,
        toolCallGrouping: false,
        staleGenerationRecovery: false,
    },
    tuningProfile: CHATGPT_NATIVE_TUNING_PROFILE,
};
