import { test, expect } from "@playwright/test";
import { DEFAULT_CONFIG } from "../src/shared/constants";
import type { ExtensionConfig, ExtensionStatus } from "../src/shared/types";
import {
    renderPerformanceModeHint,
    renderPopupStatusText,
} from "../src/popup/popupViewModel";
import { shouldShowNativeModeControl } from "../src/popup/popupCapabilities";
import { shouldUsePopupCachedStatus } from "../src/popup/popupActiveSite";

const status = (overrides: Partial<ExtensionStatus> = {}): ExtensionStatus => ({
    enabled: true,
    totalMessages: 12,
    visibleMessages: 3,
    hiddenMessages: 9,
    showStatus: true,
    statusPosition: "top-right",
    contentLifecycleState: "active",
    performanceMode: "legacy",
    ...overrides,
});

const config = (overrides: Partial<ExtensionConfig> = {}): ExtensionConfig => ({
    ...DEFAULT_CONFIG,
    ...overrides,
});

test.describe("popup mode view model", () => {
    test("Native Mode status never reuses Fast Mode count-disabled copy", () => {
        const text = renderPopupStatusText(
            config({ performanceMode: "native", fetchInterceptEnabled: true }),
            status({ performanceMode: "native" }),
        );

        expect(text).toBe("Native Mode active · experimental");
        expect(text).not.toContain("Fast Mode");
        expect(text).not.toContain("message counts disabled");
    });

    test("requested Native Mode never falls through to Stable Fast Mode copy", () => {
        const text = renderPopupStatusText(
            config({ performanceMode: "native", fetchInterceptEnabled: true }),
            status({ performanceMode: "legacy" }),
        );

        expect(text).toBe("Native Mode requested · reloading chat tab");
        expect(text).not.toContain("Fast Mode");
        expect(text).not.toContain("message counts disabled");
    });

    test("Stable Fast loading still reports message counts", () => {
        expect(renderPopupStatusText(
            config({ performanceMode: "legacy", fetchInterceptEnabled: true }),
            status({ performanceMode: "legacy" }),
        )).toBe("3/12 messages visible · 9 hidden");
    });

    test("Stable non-Fast Mode reports message counts", () => {
        expect(renderPopupStatusText(
            config({ performanceMode: "legacy", fetchInterceptEnabled: false }),
            status({ performanceMode: "legacy" }),
        )).toBe("3/12 messages visible · 9 hidden");
    });

    test("empty degraded Stable status renders as loading", () => {
        expect(renderPopupStatusText(
            config({ performanceMode: "legacy", fetchInterceptEnabled: false }),
            status({ performanceMode: "legacy", contentLifecycleState: "degraded", totalMessages: 0, visibleMessages: 0, hiddenMessages: 0 }),
        )).toBe("Loading content script");
    });

    test("lifecycle prefix composes with Native Mode without leaking Stable/Fast state", () => {
        expect(renderPopupStatusText(
            config({ performanceMode: "native", fetchInterceptEnabled: true }),
            status({ performanceMode: "native", contentLifecycleState: "degraded" }),
        )).toBe("Degraded content script · Native Mode active · experimental");
    });

    test("mode hint is the SSOT for the experimental warning", () => {
        expect(renderPerformanceModeHint("native", status({ performanceMode: "native" })))
            .toBe("Experimental; switching modes reloads the chat tab.");
        expect(renderPerformanceModeHint("legacy", status({ performanceMode: "legacy" })))
            .toBe("Stable runtime with manual older batches.");
        expect(renderPerformanceModeHint("native", status({ performanceMode: "legacy" })))
            .toBe("Native is unavailable here; Stable is active.");
    });

    test("Native Mode control is ChatGPT-only", () => {
        expect(shouldShowNativeModeControl("chatgpt")).toBe(true);
        expect(shouldShowNativeModeControl("gemini")).toBe(false);
        expect(shouldShowNativeModeControl("claude")).toBe(false);
        expect(shouldShowNativeModeControl(undefined)).toBe(false);
    });

    test("stale ChatGPT popup cache is ignored on Gemini", () => {
        expect(shouldUsePopupCachedStatus(status({ siteId: "chatgpt" }), "gemini")).toBe(false);
        expect(shouldUsePopupCachedStatus(status({ siteId: "gemini" }), "gemini")).toBe(true);
        expect(shouldUsePopupCachedStatus(status({ siteId: "chatgpt" }), undefined)).toBe(false);
    });
});
