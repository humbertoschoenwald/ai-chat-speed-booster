import { test, expect } from "@playwright/test";
import { CHATGPT_NATIVE_TUNING_PROFILE } from "../src/content/native/chatgpt/ChatGptNativeTuningProfile";
import { getNativeSiteAdapter } from "../src/content/native/NativeSiteAdapter";

test.describe("ChatGPT native tuning profile", () => {
    test("keeps ChatGPT-specific budgets and selectors isolated from other adapters", () => {
        const chatgpt = getNativeSiteAdapter("chatgpt");
        const claude = getNativeSiteAdapter("claude");

        expect(chatgpt.tuningProfile?.id).toBe("chatgpt-native-v1");
        expect(claude.tuningProfile).toBeUndefined();
        expect(CHATGPT_NATIVE_TUNING_PROFILE.selectors.turnRoot).toContain("conversation-turn");
        expect(CHATGPT_NATIVE_TUNING_PROFILE.budgets.mutationBudgetMs).toBeLessThanOrEqual(8);
    });

    test("keeps risky live tuning disabled until it has dedicated coverage", () => {
        expect(CHATGPT_NATIVE_TUNING_PROFILE.enabledFeatures).toEqual([
            "selector-guard",
            "editor-input-protection",
            "sanitized-diagnostics",
            "historical-turn-containment",
            "old-turn-hover-quiet",
            "static-tool-icon-paint",
            "long-task-throttle",
            "work-scheduler-lanes",
        ]);
        expect(CHATGPT_NATIVE_TUNING_PROFILE.blockedFeatures).toContain("live-turn-freeze");
        expect(CHATGPT_NATIVE_TUNING_PROFILE.blockedFeatures).toContain("automatic-stop-recovery");
        expect(CHATGPT_NATIVE_TUNING_PROFILE.blockedFeatures).toContain("resource-pruning");
    });
});
