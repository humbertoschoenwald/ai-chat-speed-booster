// Large-file note: native model guard tests cover independent safety models in one fast suite. Split per native guard if this suite grows further.
import { test, expect } from "@playwright/test";
import { EditorInputOptimizer } from "../src/content/native/EditorInputOptimizer";
import { InputChunkPlanner } from "../src/content/native/InputChunkPlanner";
import { MultiTabCoordinator } from "../src/content/native/MultiTabCoordinator";
import { NativeDiagnostics } from "../src/content/native/NativeDiagnostics";
import { NativeDiagnosticsSampler } from "../src/content/native/NativeDiagnosticsSampler";
import { createNativeAutoDisableRecord, resolveNativeFeatureFlags } from "../src/content/native/NativeFeatureFlags";
import { NativeWorkScheduler } from "../src/content/native/NativeWorkScheduler";
import { StaleGenerationRecovery } from "../src/content/native/StaleGenerationRecovery";
import { ChatGptCodeBlockContainmentController } from "../src/content/native/chatgpt/ChatGptCodeBlockContainmentController";
import { resolveChatGptConversationScope } from "../src/content/native/chatgpt/ChatGptConversationScope";
import { createChatGptInteractiveNodeBudgetSnapshot } from "../src/content/native/chatgpt/ChatGptInteractiveNodeBudget";
import { createChatGptToolCardDensityProfile } from "../src/content/native/chatgpt/ChatGptToolCardDensityProfile";
import { readChatGptScrollRootState } from "../src/content/native/chatgpt/ChatGptScrollRootState";
import { parseCssMetric, readChatGptThreadCssMetrics } from "../src/content/native/chatgpt/ChatGptThreadCssMetrics";
import { VirtualizationConflictDetector } from "../src/content/native/VirtualizationConflictDetector";
import { dedupeChatGptTurnElements, readChatGptLastKnownHeight, readChatGptTurnId } from "../src/content/native/chatgpt/ChatGptSelectors";
import type { ScrollGeometryDelta } from "../src/content/native/ScrollGeometry";

test.describe("native model guards", () => {
    test("reads ChatGPT scroll root attributes conservatively", () => {
        const root = fakeScrollRoot({ streamActive: "true", fromTop: "240", fromEnd: "false" });

        expect(readChatGptScrollRootState(root)).toEqual({
            rootPresent: true,
            streamActive: true,
            scrollFromTop: 240,
            scrolledFromEnd: false,
            shouldDeferOldTurnWork: true,
        });
        expect(readChatGptScrollRootState(null).shouldDeferOldTurnWork).toBe(true);
        expect(root.writeCount).toBe(0);
    });


    test("contains only old static ChatGPT code blocks", () => {
        const controller = new ChatGptCodeBlockContainmentController();
        const oldStatic = fakeCodeTurn([fakeCodeBlock()]);
        const nearStatic = fakeCodeTurn([fakeCodeBlock()]);
        const editable = fakeCodeTurn([fakeCodeBlock({ editable: true })]);
        const snapshot = controller.sync([oldStatic, editable, nearStatic], 1);

        expect(snapshot).toEqual({
            codeBlockCount: 3,
            containedCodeBlockCount: 1,
            skippedEditableCount: 1,
        });
        expect(oldStatic.blocks[0].contained).toBe(true);
        expect(editable.blocks[0].contained).toBe(false);
        expect(nearStatic.blocks[0].contained).toBe(false);
    });


    test("reads ChatGPT thread CSS variables as readonly metrics", () => {
        const styleValues = new Map([
            ["--thread-response-height", "720px"],
            ["--thread-content-max-width", "48rem"],
            ["--thread-scroll-to-bottom-banner-offset", "32px"],
            ["--thread-show-context-pct", "65%"],
        ]);
        const win = {
            getComputedStyle: () => ({
                getPropertyValue: (name: string) => styleValues.get(name) ?? "",
            }),
        } as unknown as Pick<Window, "getComputedStyle">;

        expect(readChatGptThreadCssMetrics({} as Element, win)).toEqual({
            responseHeightPx: 720,
            contentMaxWidthPx: 48,
            scrollToBottomBannerOffsetPx: 32,
            showContextPct: 65,
        });
        expect(parseCssMetric("")).toBeNull();
        expect(parseCssMetric("not-a-number")).toBeNull();
    });


    test("selects static tool summaries only for dense completed tool-card threads", () => {
        const denseGroups = Array.from({ length: 42 }, (_, index) => toolGroup(index < 40 ? "completed" : "running"));
        const sparseGroups = Array.from({ length: 3 }, () => toolGroup("completed"));

        expect(createChatGptToolCardDensityProfile(denseGroups, 8)).toMatchObject({
            behavior: "static-summary",
            groupCount: 42,
            completedCount: 40,
            activeCount: 2,
        });
        expect(createChatGptToolCardDensityProfile(sparseGroups, 8)).toMatchObject({
            behavior: "baseline",
            groupCount: 3,
            completedCount: 3,
            activeCount: 0,
        });
    });


    test("prefers ChatGPT conversation scope over document-wide scans", () => {
        const documentRoot = fakeScope({ buttons: 10, svgs: 10 });
        const conversationRoot = fakeScope({ buttons: 2, svgs: 1 });

        expect(resolveChatGptConversationScope(documentRoot as unknown as Document, conversationRoot)).toBe(conversationRoot);
        expect(createChatGptInteractiveNodeBudgetSnapshot(
            resolveChatGptConversationScope(documentRoot as unknown as Document, conversationRoot),
            [],
        ).totalButtons).toBe(2);
        expect(resolveChatGptConversationScope(documentRoot as unknown as Document, null)).toBe(documentRoot);
    });

    test("reports ChatGPT interactive node budgets by scope", () => {
        const toolGroup = fakeScope({ buttons: 2, svgs: 2 });
        const turnA = fakeScope({ buttons: 3, svgs: 2, toolGroups: [toolGroup] });
        const turnB = fakeScope({ buttons: 1, svgs: 1 });
        const root = fakeScope({ buttons: 7, svgs: 5, composerButtons: 1 });

        expect(createChatGptInteractiveNodeBudgetSnapshot(root, [turnA, turnB])).toEqual({
            totalButtons: 7,
            totalSvgs: 5,
            threadButtons: 4,
            threadSvgs: 3,
            toolGroupButtons: 2,
            toolGroupSvgs: 2,
            composerButtons: 1,
            nonThreadButtons: 3,
        });
    });

    test("deduplicates ChatGPT turn wrappers by canonical turn id", () => {
        const turns = Array.from({ length: 8 }, (_, index) => {
            const id = `turn-${index}`;
            return [
                fakeTurn({ id, containerId: id, section: false }),
                fakeTurn({ id, containerId: id, section: true }),
            ];
        }).flat();
        const deduped = dedupeChatGptTurnElements(turns);

        expect(turns).toHaveLength(16);
        expect(deduped).toHaveLength(8);
        expect(deduped.every((turn) => turn.matches("section[data-testid^='conversation-turn-']"))).toBe(true);
        expect(deduped.map(readChatGptTurnId)).toEqual(Array.from({ length: 8 }, (_, index) => `turn-${index}`));
    });


    test("reads ChatGPT last-known height metadata without measuring layout", () => {
        const turn = fakeTurn({ id: "turn-h", containerId: "turn-h", section: true, heightHintPx: 512 });

        expect(readChatGptLastKnownHeight(turn)).toBe(512);
        expect(readChatGptLastKnownHeight(fakeTurn({ id: "turn-x", containerId: "turn-x", section: true }))).toBeNull();
    });

    test("samples Native Mode diagnostics with TTL and force refresh", () => {
        let reads = 0;
        const sampler = new NativeDiagnosticsSampler(100, () => ({ value: ++reads }));

        expect(sampler.read({ now: 1 })).toEqual({ value: 1 });
        expect(sampler.read({ now: 50 })).toEqual({ value: 1 });
        expect(sampler.read({ now: 101 })).toEqual({ value: 2 });
        expect(sampler.read({ force: true, now: 102 })).toEqual({ value: 3 });
        expect(sampler.snapshot()).toEqual({ value: { value: 3 }, sampledAt: 102 });
        sampler.clear();
        expect(sampler.snapshot()).toEqual({ value: null, sampledAt: null });
    });


    test("resolves Native Mode feature flags and auto-disable diagnostics", () => {
        const autoDisabled = createNativeAutoDisableRecord("long-task-throttle", "cooldown spike", 70_000);
        const resolution = resolveNativeFeatureFlags([
            "selector-guard",
            "long-task-throttle",
            "unknown-feature",
        ], [autoDisabled]);

        expect(resolution.activeFeatures).toEqual(["selector-guard"]);
        expect(resolution.disabledFeatures).toEqual([
            "long-task-throttle: cooldown spike",
            "unknown-feature: unknown native feature",
        ]);
        expect(resolution.autoDisabledFeatures).toEqual([autoDisabled]);
    });


    test("orders Native Mode work lanes and pauses lower-priority work", () => {
        const scheduler = new NativeWorkScheduler();
        const ran: string[] = [];

        scheduler.schedule("idle", "idle-prewarm", () => ran.push("idle-prewarm"), 1);
        scheduler.schedule("visible-turn", "visible-sync", () => ran.push("visible-sync"), 2);
        scheduler.schedule("input", "input-guard", () => ran.push("input-guard"), 3);
        scheduler.schedule("tool-call", "tool-labels", () => ran.push("tool-labels"), 4);
        scheduler.cancel("tool-labels");

        const protectedDrain = scheduler.drain({ inputProtected: true, now: 10 });
        expect(protectedDrain).toEqual({
            ran: ["input-guard"],
            deferred: ["visible-sync", "idle-prewarm"],
        });
        expect(ran).toEqual(["input-guard"]);
        expect(scheduler.snapshot()).toMatchObject({
            queued: 2,
            lastRunAt: 10,
            lastDeferredAt: 10,
        });

        const normalDrain = scheduler.drain({ inputProtected: false, now: 20 });
        expect(normalDrain).toEqual({ ran: ["visible-sync", "idle-prewarm"], deferred: [] });
        expect(ran).toEqual(["input-guard", "visible-sync", "idle-prewarm"]);
        expect(scheduler.snapshot()).toMatchObject({ queued: 0, lastRunAt: 20 });
    });

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


test("editor optimizer protects beforeinput and key events without scanning during active input", () => {
    const optimizer = new EditorInputOptimizer({ quietWindowMs: 50 });

    optimizer.markEvent("beforeinput", 10_000);
    expect(optimizer.shouldDeferBackgroundWork(10_120)).toBe(true);

    optimizer.markEvent("keydown", 10_200);

    expect(optimizer.shouldDeferBackgroundWork(10_260)).toBe(true);
    expect(optimizer.shouldDeferBackgroundWork(10_400)).toBe(false);
    expect(optimizer.snapshot()).toMatchObject({
        eventCount: 2,
        lastEventType: "keydown",
        lastEventAt: 10_200,
        protectedUntilMs: 10_320,
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

test("long tasks defer Native Mode background work for a bounded cooldown", () => {
    const optimizer = new EditorInputOptimizer({ quietWindowMs: 50 });

    optimizer.recordLongTask(20, 40_000);
    expect(optimizer.snapshot().longTaskCount).toBe(0);
    expect(optimizer.shouldDeferBackgroundWork(40_040)).toBe(false);

    optimizer.recordLongTask(120, 50_000);
    expect(optimizer.snapshot()).toMatchObject({
        longTaskCount: 1,
        lastEventType: "long-task",
        lastLongTaskAt: 50_000,
        lastLongTaskDurationMs: 120,
    });
    expect(optimizer.shouldDeferBackgroundWork(50_300)).toBe(true);
    expect(optimizer.shouldDeferBackgroundWork(50_700)).toBe(false);
});


function fakeTurn(options: { readonly id: string; readonly containerId: string; readonly section: boolean; readonly heightHintPx?: number }): HTMLElement {
    return {
        style: {
            getPropertyValue: (name: string) => name === "--last-known-height" && options.heightHintPx
                ? `${options.heightHintPx}px`
                : "",
        },
        getAttribute: (name: string) => {
            if (name === "data-turn-id") return options.section ? options.id : null;
            if (name === "data-turn-id-container") return options.containerId;
            if (name === "data-testid") return options.section ? `conversation-turn-${options.id}` : null;
            if (name === "style" && options.heightHintPx) return `--last-known-height: ${options.heightHintPx}px`;
            return null;
        },
        closest: () => null,
        parentElement: null,
        matches: (selector: string) => options.section && selector.includes("section[data-testid^='conversation-turn-']"),
    } as unknown as HTMLElement;
}


function fakeScope(options: { readonly buttons: number; readonly svgs: number; readonly composerButtons?: number; readonly toolGroups?: readonly HTMLElement[] }): HTMLElement {
    const buttons = Array.from({ length: options.buttons }, () => ({}) as HTMLElement);
    const svgs = Array.from({ length: options.svgs }, () => ({}) as HTMLElement);
    const composerButtons = Array.from({ length: options.composerButtons ?? 0 }, () => ({}) as HTMLElement);
    return {
        querySelectorAll: (selector: string) => {
            if (selector === "button") return buttons;
            if (selector === "svg") return svgs;
            if (selector === "form button") return composerButtons;
            if (selector.includes("tool")) return [...options.toolGroups ?? []];
            return [];
        },
    } as unknown as HTMLElement;
}


function toolGroup(state: "completed" | "running" | "failed" | "user-expanded") {
    return {
        id: `tool-${Math.random()}`,
        ownerTurnKey: "turn-1",
        element: {} as HTMLElement,
        state,
        estimatedNodeCost: 1,
    };
}


function fakeCodeBlock(options: { readonly editable?: boolean } = {}) {
    return {
        contained: false,
        setAttribute(name: string, value: string) {
            if (name === "data-acsb-native-contained-code-block" && value === "true") this.contained = true;
        },
        removeAttribute(name: string) {
            if (name === "data-acsb-native-contained-code-block") this.contained = false;
        },
        matches: (selector: string) => options.editable === true && selector.includes("contenteditable"),
        closest: (selector: string) => options.editable === true && selector.includes("contenteditable") ? {} : null,
        querySelector: () => null,
    };
}

function fakeCodeTurn(blocks: ReturnType<typeof fakeCodeBlock>[]) {
    return {
        key: `code-turn-${Math.random()}`,
        element: {
            querySelectorAll: (selector: string) => selector.includes("pre") ? blocks : [],
        } as unknown as HTMLElement,
        role: "assistant",
        hydrationState: "hydrated",
        measuredHeight: null,
        pinReasons: new Set(),
        lastMeasuredAt: null,
        blocks,
    };
}


function fakeScrollRoot(options: { readonly streamActive?: string; readonly fromTop?: string; readonly fromEnd?: string }) {
    const attrs = new Map<string, string | undefined>([
        ["data-stream-active", options.streamActive],
        ["data-scroll-from-top", options.fromTop],
        ["data-scrolled-from-end", options.fromEnd],
    ]);
    return {
        writeCount: 0,
        getAttribute: (name: string) => attrs.get(name) ?? null,
        setAttribute() {
            this.writeCount += 1;
        },
        removeAttribute() {
            this.writeCount += 1;
        },
    } as unknown as HTMLElement & { writeCount: number };
}
