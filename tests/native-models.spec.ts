// SCHOENWALD-LARGE-FILE owner=ai-chat-speed-booster reason="Native model guard tests cover independent safety models in one fast suite" split="Split per native guard if this suite grows further" validation="pnpm validate" review="Model-only tests; no browser secrets or clipboard text"
import { test, expect } from "@playwright/test";
import { EditorInputOptimizer } from "../src/content/native/EditorInputOptimizer";
import { InputChunkPlanner } from "../src/content/native/InputChunkPlanner";
import { MultiTabCoordinator } from "../src/content/native/MultiTabCoordinator";
import { NativeDiagnostics } from "../src/content/native/NativeDiagnostics";
import { StaleGenerationRecovery } from "../src/content/native/StaleGenerationRecovery";
import { VirtualizationConflictDetector } from "../src/content/native/VirtualizationConflictDetector";
import type { ScrollGeometryDelta } from "../src/content/native/ScrollGeometry";

test.describe("native model guards", () => {
    test("keeps small input native and blocks chunking during composition", () => {
        const planner = new InputChunkPlanner(100, 25);

        expect(planner.plan(40, false)).toEqual({
            chunked: false,
            chunkCount: 1,
            totalLength: 40,
            chunkSize: 25,
        });
        expect(planner.plan(101, true).chunked).toBe(false);
        expect(planner.plan(101, false)).toEqual({
            chunked: true,
            chunkCount: 5,
            totalLength: 101,
            chunkSize: 25,
        });
    });

    test("detects stale generation only after quiet inactive stream", () => {
        const recovery = new StaleGenerationRecovery();

        expect(recovery.evaluate({
            lastAssistantMutationAt: 1_000,
            lastToolMutationAt: null,
            activeStream: true,
            stopControlPresent: true,
            composerEnabled: true,
            bottomGapPx: 240,
            now: 30_000,
        })).toMatchObject({
            staleStopDetected: false,
            staleBottomGapDetected: false,
        });

        expect(recovery.evaluate({
            lastAssistantMutationAt: 1_000,
            lastToolMutationAt: null,
            activeStream: false,
            stopControlPresent: true,
            composerEnabled: true,
            bottomGapPx: 240,
            now: 30_000,
        })).toMatchObject({
            staleStopDetected: true,
            staleBottomGapDetected: true,
        });
    });

    test("flags repeated virtualization conflict signals", () => {
        const detector = new VirtualizationConflictDetector();
        const oscillatingDelta = { oscillating: true } as ScrollGeometryDelta;

        detector.recordHostReveal(true, false);
        detector.recordScrollDelta(oscillatingDelta);
        expect(detector.snapshot().shouldDisableNativeVirtualization).toBe(false);

        detector.recordScrollDelta(oscillatingDelta);
        expect(detector.snapshot()).toMatchObject({
            scrollOscillationCount: 2,
            shouldDisableNativeVirtualization: true,
        });
    });

    test("keeps inactive-tab work skippable until resume", () => {
        const coordinator = new MultiTabCoordinator();

        coordinator.markVisibility(false, 1_000);
        expect(coordinator.shouldSkipNonessentialWork()).toBe(true);
        expect(coordinator.snapshot()).toMatchObject({
            active: false,
            inactiveSince: 1_000,
            skippedWorkCount: 1,
            resumeCheckCount: 0,
        });

        coordinator.markVisibility(true, 2_000);
        expect(coordinator.shouldSkipNonessentialWork()).toBe(false);
        expect(coordinator.snapshot()).toMatchObject({
            active: true,
            inactiveSince: null,
            skippedWorkCount: 1,
            resumeCheckCount: 1,
        });
    });

    test("bounds native diagnostic event details", () => {
        const diagnostics = new NativeDiagnostics();
        diagnostics.warn("native\ncode", "long detail ".repeat(40));

        const [event] = diagnostics.snapshot().events;
        expect(event.code).toBe("native code");
        expect(event.detail.length).toBeLessThanOrEqual(160);
    });
});


test("native send and stream activity opens a protected background-work window", () => {
    const optimizer = new EditorInputOptimizer({ quietWindowMs: 50 });

    optimizer.markProtectedActivity("messages-added", 1_000, 10_000);

    expect(optimizer.shouldDeferBackgroundWork(10_500)).toBe(true);
    expect(optimizer.shouldDeferBackgroundWork(11_100)).toBe(false);
    expect(optimizer.snapshot()).toMatchObject({
        lastEventType: "messages-added",
        lastEventAt: 10_000,
    });
});


test("virtualization diagnostics disable future native virtualization after repeated host reveal loops (#24)", () => {
    const detector = new VirtualizationConflictDetector();

    detector.recordHostReveal(true, false);
    detector.recordHostReveal(true, false);
    expect(detector.snapshot().shouldDisableNativeVirtualization).toBe(false);

    detector.recordHostReveal(true, false);
    expect(detector.snapshot()).toMatchObject({
        revealLoopCount: 3,
        shouldDisableNativeVirtualization: true,
        lastReason: "host-revealed-hidden-turn",
    });
});


test("editor optimizer records large paste chunk planning without storing text", () => {
    const optimizer = new EditorInputOptimizer({ quietWindowMs: 50 });

    optimizer.recordPasteLength(25_000);

    expect(optimizer.snapshot()).toMatchObject({
        lastEventType: "large-paste",
        lastPasteLength: 25_000,
        lastPasteChunkCount: 7,
    });
    expect(optimizer.shouldDeferBackgroundWork()).toBe(true);
});


test("native virtualization disables after scroll-height oscillation loops (#24)", () => {
    const detector = new VirtualizationConflictDetector();

    detector.recordScrollHeight(10_000, 1_000);
    detector.recordScrollHeight(8_000, 1_100);
    detector.recordScrollHeight(10_200, 1_200);
    detector.recordScrollHeight(8_100, 1_300);
    detector.recordScrollHeight(10_300, 1_400);

    expect(detector.snapshot()).toMatchObject({
        scrollOscillationCount: 3,
        shouldDisableNativeVirtualization: true,
        lastReason: "scroll-height-oscillation",
    });
});

test("native virtualization ignores normal monotonic scroll-height growth (#24)", () => {
    const detector = new VirtualizationConflictDetector();

    detector.recordScrollHeight(10_000, 1_000);
    detector.recordScrollHeight(10_200, 1_100);
    detector.recordScrollHeight(10_500, 1_200);
    detector.recordScrollHeight(10_900, 1_300);

    expect(detector.snapshot()).toMatchObject({
        scrollOscillationCount: 0,
        shouldDisableNativeVirtualization: false,
    });
});


test("editor optimizer protects typing and key events without scanning during active input", () => {
    const optimizer = new EditorInputOptimizer({ quietWindowMs: 50 });

    optimizer.markEvent("keydown", 10_000);

    expect(optimizer.shouldDeferBackgroundWork(10_060)).toBe(true);
    expect(optimizer.shouldDeferBackgroundWork(10_200)).toBe(false);
    expect(optimizer.snapshot()).toMatchObject({
        eventCount: 1,
        lastEventType: "keydown",
        lastEventAt: 10_000,
        protectedUntilMs: 10_120,
    });
});

test("editor optimizer treats copy cut and selection as protected windows without clipboard text", () => {
    const optimizer = new EditorInputOptimizer({ quietWindowMs: 50 });

    optimizer.markEvent("copy", 20_000);
    expect(optimizer.shouldDeferBackgroundWork(20_200)).toBe(true);
    expect(optimizer.shouldDeferBackgroundWork(20_400)).toBe(false);

    optimizer.markEvent("selectionchange", 21_000);
    expect(optimizer.shouldDeferBackgroundWork(21_100)).toBe(true);
    expect(optimizer.snapshot()).toMatchObject({
        eventCount: 2,
        lastEventType: "selectionchange",
        lastPasteLength: null,
    });
});

test("small paste remains native while large paste opens a protected yield window", () => {
    const optimizer = new EditorInputOptimizer({ quietWindowMs: 50 });

    optimizer.recordPasteLength(128);
    expect(optimizer.snapshot()).toMatchObject({
        lastEventType: "paste",
        lastPasteLength: 128,
        lastPasteChunkCount: 1,
    });

    optimizer.recordPasteLength(25_000);
    expect(optimizer.snapshot()).toMatchObject({
        lastEventType: "large-paste",
        lastPasteLength: 25_000,
        lastPasteChunkCount: 7,
    });
    expect(optimizer.shouldDeferBackgroundWork()).toBe(true);
});

test("IME composition prevents large paste chunking until composition ends", () => {
    const optimizer = new EditorInputOptimizer({ quietWindowMs: 50 });

    optimizer.markEvent("compositionstart", 30_000);
    optimizer.recordPasteLength(25_000);

    expect(optimizer.snapshot()).toMatchObject({
        composing: true,
        lastPasteChunkCount: 1,
    });
    expect(optimizer.shouldDeferBackgroundWork(31_000)).toBe(true);

    optimizer.markEvent("compositionend", 32_000);
    expect(optimizer.snapshot().composing).toBe(false);
});
