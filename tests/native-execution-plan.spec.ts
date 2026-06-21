import { test, expect } from "@playwright/test";
import { createNativeExecutionPlan } from "../src/content/native/NativeExecutionPlan";
import { getNativeSiteAdapter } from "../src/content/native/NativeSiteAdapter";
import type { ExtensionConfig } from "../src/shared/types";

const nativeConfig: ExtensionConfig = {
    enabled: true,
    visibleMessageLimit: 3,
    loadMoreBatchSize: 3,
    enableFetchIntercept: false,
    autoLoadOnScroll: false,
    showStatus: true,
    hideOldMessages: true,
    performanceMode: "native",
    theme: "system",
    statusPosition: "top-left",
};

test.describe("native execution plan", () => {
    test("creates a bounded ChatGPT plan from the tuning profile", () => {
        const plan = createNativeExecutionPlan(getNativeSiteAdapter("chatgpt"), nativeConfig);

        expect(plan.canStart).toBe(true);
        expect(plan.activeFeatures).toEqual([
            "selector-guard",
            "editor-input-protection",
            "sanitized-diagnostics",
            "historical-turn-containment",
            "old-turn-hover-quiet",
            "static-tool-icon-paint",
            "long-task-throttle",
            "work-scheduler-lanes",
        ]);
        expect(plan.blockedFeatures).toContain("live-turn-freeze");
        expect(plan.mutationBudgetMs).toBe(8);
        expect(plan.scrollOverscanPx).toBe(900);
    });

    test("blocks planned adapters before any tuning can run", () => {
        const plan = createNativeExecutionPlan(getNativeSiteAdapter("deepseek"), nativeConfig);

        expect(plan.canStart).toBe(false);
        expect(plan.activeFeatures).toEqual([]);
        expect(plan.blockedFeatures).toEqual(["DeepSeek support is DOM-only for now; Native Mode remains disabled."]);
        expect(plan.mutationBudgetMs).toBeNull();
    });
});
