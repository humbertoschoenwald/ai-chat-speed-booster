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
