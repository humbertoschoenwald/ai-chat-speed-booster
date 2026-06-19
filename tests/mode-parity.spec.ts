import { test, expect } from "@playwright/test";
import { RequestLifecycleTracker } from "../src/content/RequestLifecycleTracker";
import { VirtualizationConflictDetector } from "../src/content/native/VirtualizationConflictDetector";
import { DEFAULT_CONFIG } from "../src/shared/constants";
import { deriveRuntimeConfigForSite } from "../src/shared/native-runtime-policy";
import type { PerformanceMode } from "../src/shared/types";

const modes: readonly PerformanceMode[] = ["legacy", "native"];

const node = (role: "user" | "assistant", failed = false): HTMLElement => ({
    matches: (selector: string) => selector.includes(role),
    querySelector: (selector: string) => (failed && selector.includes("alert") ? {} : null),
}) as unknown as HTMLElement;

const rejectedUi = (): HTMLElement => ({
    matches: () => false,
    querySelector: (selector: string) => (selector.includes("alert") ? {} : null),
}) as unknown as HTMLElement;

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

test("content lifecycle availability remains enabled in Stable and Native modes (#31)", () => {
    for (const mode of modes) {
        const runtime = deriveRuntimeConfigForSite({ ...DEFAULT_CONFIG, performanceMode: mode }, "chatgpt");

        expect(runtime.enabled).toBe(true);
        expect(runtime.performanceMode).toBe(mode);
        expect(runtime.weeklyRequestLimit).toBe(DEFAULT_CONFIG.weeklyRequestLimit);
    }
});

test("accepted request lifecycle is performance-mode neutral (#30)", () => {
    for (const mode of modes) {
        const runtime = deriveRuntimeConfigForSite({ ...DEFAULT_CONFIG, performanceMode: mode }, "chatgpt");
        const reports: string[] = [];
        const tracker = new RequestLifecycleTracker("chatgpt", "user", (siteId, count) => reports.push(`${runtime.performanceMode}:${siteId}:${count}`), 0);

        tracker.observeAddedTurns([node("user")]);
        tracker.observeAddedTurns([node("assistant", true)]);
        tracker.observeAddedTurns([node("user"), node("assistant")]);

        expect(reports).toEqual([`${mode}:chatgpt:1`]);
    }
});

test("global rejected UI cancels pending accepted request in Stable and Native modes (#30)", async () => {
    for (const mode of modes) {
        const runtime = deriveRuntimeConfigForSite({ ...DEFAULT_CONFIG, performanceMode: mode }, "chatgpt");
        const reports: number[] = [];
        const tracker = new RequestLifecycleTracker(runtime.performanceMode, "user", (_siteId, count) => reports.push(count), 20);

        tracker.observeAddedTurns([node("user"), node("assistant")]);
        tracker.observeFailureState(rejectedUi());
        await wait(30);

        expect(reports).toEqual([]);
    }
});

test("Stable hiding and Native virtualization conflict handling remain separate (#24)", () => {
    const stableRuntime = deriveRuntimeConfigForSite({
        ...DEFAULT_CONFIG,
        performanceMode: "legacy",
        autoRefreshDeliveryTimeout: true,
    }, "chatgpt");
    const nativeRuntime = deriveRuntimeConfigForSite({
        ...DEFAULT_CONFIG,
        performanceMode: "native",
        fetchInterceptEnabled: true,
        autoLoad: true,
        hideOldMessages: true,
        showStatus: true,
        autoRefreshDeliveryTimeout: true,
    }, "chatgpt");
    const detector = new VirtualizationConflictDetector();

    expect(stableRuntime).toMatchObject({
        performanceMode: "legacy",
        hideOldMessages: true,
        fetchInterceptEnabled: true,
        showStatus: true,
        autoRefreshDeliveryTimeout: true,
    });
    expect(nativeRuntime).toMatchObject({
        performanceMode: "native",
        hideOldMessages: false,
        fetchInterceptEnabled: false,
        autoLoad: false,
        showStatus: false,
        autoRefreshDeliveryTimeout: true,
    });

    detector.recordHostReveal(true, false);
    detector.recordHostReveal(true, false);
    detector.recordHostReveal(true, false);
    expect(detector.snapshot()).toMatchObject({
        revealLoopCount: 3,
        shouldDisableNativeVirtualization: true,
        lastReason: "host-revealed-hidden-turn",
    });
});

test("Native Mode is unavailable outside ChatGPT", () => {
    const geminiRuntime = deriveRuntimeConfigForSite({
        ...DEFAULT_CONFIG,
        performanceMode: "native",
    }, "gemini");

    expect(geminiRuntime.performanceMode).toBe("legacy");
    expect(geminiRuntime.fetchInterceptEnabled).toBe(DEFAULT_CONFIG.fetchInterceptEnabled);
    expect(geminiRuntime.autoLoad).toBe(DEFAULT_CONFIG.autoLoad);
});
