import { test, expect } from "@playwright/test";
import { createRenderUnitBudgetSnapshot } from "../src/content/native/RenderUnitBudget";
import { ToolCallGroupController } from "../src/content/native/ToolCallGroupController";
import { TurnMeasurementCache } from "../src/content/native/TurnMeasurementCache";
import { TurnRegistry, type NativeTurnRecord } from "../src/content/native/TurnRegistry";
import { classifyTurnPriority } from "../src/content/native/chatgpt/ChatGptVisibleTurnPriorityController";

const element = (kind: "tool" | "running" | "failed" | "expanded", childCount = 0): HTMLElement => ({
    matches: (selector: string) => {
        if (selector.includes("tool")) return true;
        if (kind === "failed" && selector.includes("error")) return true;
        if (kind === "running" && selector.includes("loading")) return true;
        return false;
    },
    querySelector: () => null,
    querySelectorAll: () => Array.from({ length: childCount }),
    getAttribute: (name: string) => {
        if (name === "aria-expanded" && kind === "expanded") return "true";
        if (name === "data-testid") return "conversation-turn-tool";
        if (name === "data-state" && kind === "tool") return "closed";
        return null;
    },
}) as unknown as HTMLElement;

const priorityElement = (intersecting: string): HTMLElement => ({
    getAttribute: (name: string) => name === "data-is-intersecting" ? intersecting : null,
    getBoundingClientRect: () => ({ top: 0, bottom: 1 }) as DOMRect,
    ownerDocument: { defaultView: { innerHeight: 800 } },
}) as unknown as HTMLElement;

const record = (key: string, node: HTMLElement, measuredHeight: number | null): NativeTurnRecord => ({
    key,
    element: node,
    role: "assistant",
    hydrationState: "hydrated",
    measuredHeight,
    pinReasons: new Set(),
    lastMeasuredAt: null,
});

test.describe("native cache and tool-call models", () => {
    test("classifies tool-call groups without reading tool output", () => {
        const controller = new ToolCallGroupController();
        controller.indexTurn(record("testid:conversation-turn-1", element("running"), null));
        controller.indexTurn(record("testid:conversation-turn-2", element("failed"), null));
        controller.indexTurn(record("testid:conversation-turn-3", element("tool"), null));

        expect(controller.snapshot()).toMatchObject({
            groupCount: 3,
            runningCount: 1,
            failedCount: 1,
            completedCount: 1,
        });
    });

    test("turn registry consumes dirty records by stable identity", () => {
        const registry = new TurnRegistry();
        const first = registry.track(element("tool"), 1);

        expect(registry.dirtyTurnKeys()).toEqual([first.key]);
        expect(registry.consumeDirtyRecords([first])).toEqual([first]);
        expect(registry.consumeDirtyRecords([first])).toEqual([]);

        const replacement = element("tool");
        const retracked = registry.track(replacement, 1);
        expect(retracked).toBe(first);
        expect(registry.consumeDirtyRecords([retracked])).toEqual([retracked]);
    });

    test("classifies visible priority hints", () => {
        expect(classifyTurnPriority(priorityElement("true"))).toBe("live");
        expect(classifyTurnPriority(priorityElement("false"))).toBe("far");
    });

    test("persists only stable measurement keys", () => {
        const cache = new TurnMeasurementCache();

        expect(cache.remember(record("attr:raw-route-like-id", element("tool"), 55))).toBe(false);
        expect(cache.remember(record("testid:conversation-turn-123", element("tool"), 55))).toBe(true);
        expect(cache.snapshot()).toEqual({
            measurementCount: 1,
            schemaVersion: 1,
        });
    });
});


test("render-unit budget shrinks live window for tool-heavy turns without reading text", () => {
    const controller = new ToolCallGroupController();
    const heavyToolTurn = record("testid:conversation-turn-heavy", element("tool", 800), null);

    controller.indexTurn(heavyToolTurn);
    const budget = createRenderUnitBudgetSnapshot([heavyToolTurn.element], controller.snapshot(), 5);

    expect(budget).toMatchObject({
        turnCount: 1,
        toolGroupCount: 1,
        estimatedToolNodeCost: 801,
        liveWindowSize: 3,
    });
    expect(budget.estimatedRenderUnitCost).toBeGreaterThan(budget.turnCount);
});

test("render-unit budget keeps normal turns in the configured native window", () => {
    const controller = new ToolCallGroupController();
    const normalTurns = [element("tool", 1), element("tool", 1), element("tool", 1)];
    const budget = createRenderUnitBudgetSnapshot(normalTurns, controller.snapshot(), 5);

    expect(budget).toMatchObject({
        turnCount: 3,
        toolGroupCount: 0,
        estimatedToolNodeCost: 0,
        liveWindowSize: 5,
    });
});
