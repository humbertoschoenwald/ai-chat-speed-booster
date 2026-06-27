import type { ToolCallGroupSnapshot } from "./ToolCallGroupController";

export interface RenderUnitBudgetSnapshot {
    readonly turnCount: number;
    readonly estimatedTurnNodeCost: number;
    readonly estimatedToolNodeCost: number;
    readonly estimatedRenderUnitCost: number;
    readonly toolGroupCount: number;
    readonly runningToolCount: number;
    readonly failedToolCount: number;
    readonly completedToolCount: number;
    readonly liveWindowSize: number;
}

const BASE_MIN_LIVE_WINDOW = 3;
const BASE_MAX_LIVE_WINDOW = 5;
const HEAVY_COST_THRESHOLD = 300;
const EXTREME_COST_THRESHOLD = 750;

export function createRenderUnitBudgetSnapshot(
    turns: readonly HTMLElement[],
    toolCalls: ToolCallGroupSnapshot,
    configuredVisibleLimit: number,
): RenderUnitBudgetSnapshot {
    return createRenderUnitBudgetSnapshotFromCost(
        turns.length,
        estimateTurnNodeCost(turns),
        toolCalls,
        configuredVisibleLimit,
    );
}

export function createRenderUnitBudgetSnapshotFromCost(
    turnCount: number,
    estimatedTurnNodeCost: number,
    toolCalls: ToolCallGroupSnapshot,
    configuredVisibleLimit: number,
): RenderUnitBudgetSnapshot {
    const estimatedRenderUnitCost = estimatedTurnNodeCost + toolCalls.estimatedNodeCost;
    return {
        turnCount,
        estimatedTurnNodeCost,
        estimatedToolNodeCost: toolCalls.estimatedNodeCost,
        estimatedRenderUnitCost,
        toolGroupCount: toolCalls.groupCount,
        runningToolCount: toolCalls.runningCount,
        failedToolCount: toolCalls.failedCount,
        completedToolCount: toolCalls.completedCount,
        liveWindowSize: chooseNativeLiveWindowSize(configuredVisibleLimit, estimatedRenderUnitCost),
    };
}

export function chooseNativeLiveWindowSize(configuredVisibleLimit: number, estimatedRenderUnitCost: number): number {
    const base = Math.max(BASE_MIN_LIVE_WINDOW, Math.min(BASE_MAX_LIVE_WINDOW, configuredVisibleLimit));
    if (estimatedRenderUnitCost >= EXTREME_COST_THRESHOLD) return Math.max(2, base - 2);
    if (estimatedRenderUnitCost >= HEAVY_COST_THRESHOLD) return Math.max(3, base - 1);
    return base;
}

function estimateTurnNodeCost(turns: readonly HTMLElement[]): number {
    return turns.reduce((total, turn) => total + 1 + turn.querySelectorAll("*").length, 0);
}
