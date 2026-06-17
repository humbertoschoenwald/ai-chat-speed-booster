import { test, expect } from "@playwright/test";
import { createChatGptNativeSafety } from "../src/content/native/chatgpt/ChatGptNativeSafety";

test.describe("ChatGPT native safety", () => {
    test("keeps risky live features blocked even when the generic gate would allow work", () => {
        const safety = createChatGptNativeSafety();

        expect(safety.decide("turn-freeze", true, true, false)).toEqual({
            feature: "turn-freeze",
            enabled: false,
            reason: "chatgpt-live-feature-blocked",
        });
        expect(safety.decide("tool-grouping", true, true, false)).toEqual({
            feature: "tool-grouping",
            enabled: false,
            reason: "chatgpt-live-feature-blocked",
        });
    });

    test("keeps the safe large input planner available during protected input", () => {
        const safety = createChatGptNativeSafety();

        expect(safety.decide("large-input-plan", true, true, true)).toEqual({
            feature: "large-input-plan",
            enabled: true,
            reason: "allowed",
        });
    });

    test("inherits generic engine blocks before ChatGPT tuning is considered", () => {
        const safety = createChatGptNativeSafety();

        expect(safety.decide("large-input-plan", false, true, false)).toEqual({
            feature: "large-input-plan",
            enabled: false,
            reason: "native-inactive",
        });
    });
});
