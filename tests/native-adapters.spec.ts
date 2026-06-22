import { test, expect } from "@playwright/test";
import { NativeDiagnostics } from "../src/content/native/NativeDiagnostics";
import { NativeEngine } from "../src/content/native/NativeEngine";
import { getNativeSiteAdapter, NATIVE_SITE_ADAPTERS } from "../src/content/native/NativeSiteAdapter";
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

test.describe("native adapter engine", () => {
    test("enables Native Mode only for ChatGPT while other site adapters stay planned", () => {
        expect(getNativeSiteAdapter("chatgpt").support).toBe("enabled");
        expect(getNativeSiteAdapter("claude").support).toBe("planned");
        expect(getNativeSiteAdapter("gemini").support).toBe("enabled");
        expect(getNativeSiteAdapter("deepseek").support).toBe("planned");
        expect(getNativeSiteAdapter("grok").support).toBe("planned");
        expect(getNativeSiteAdapter("search-ai-mode").support).toBe("planned");
    });

    test("blocks planned adapters even when the user selects Native Mode", () => {
        const engine = new NativeEngine(getNativeSiteAdapter("grok"), new NativeDiagnostics());
        const decision = engine.evaluateStart(nativeConfig);

        expect(decision.canStart).toBe(false);
        expect(decision.adapter.nativeEnabled).toBe(false);
        expect(decision.reason).toContain("disabled");
    });

    test("keeps a registry entry for each known site adapter", () => {
        expect(NATIVE_SITE_ADAPTERS.map((adapter) => adapter.siteId)).toEqual([
            "chatgpt",
            "claude",
            "gemini",
            "deepseek",
            "grok",
            "search-ai-mode",
        ]);
    });
});
