import type { ToolCallGroupRecord } from "../ToolCallGroupController";

export type ChatGptToolCardDensityBehavior = "baseline" | "static-summary";

export interface ChatGptToolCardDensityProfile {
    readonly score: number;
    readonly behavior: ChatGptToolCardDensityBehavior;
    readonly turnCount: number;
    readonly groupCount: number;
    readonly completedCount: number;
    readonly activeCount: number;
    readonly groupsPerTurn: number;
    readonly completedRatio: number;
}

export function createChatGptToolCardDensityProfile(
    groups: readonly ToolCallGroupRecord[],
    turnCount: number,
): ChatGptToolCardDensityProfile {
    const safeTurnCount = Math.max(1, turnCount);
    const groupCount = groups.length;
    const completedCount = groups.filter((group) => group.state === "completed").length;
    const activeCount = groups.filter((group) => group.state !== "completed").length;
    const groupsPerTurn = groupCount / safeTurnCount;
    const completedRatio = groupCount > 0 ? completedCount / groupCount : 0;
    const score = Math.round((groupsPerTurn * 25) + (completedRatio * 50) + Math.min(25, completedCount));
    const behavior = score >= 90 && completedCount >= 8 && completedRatio >= 0.75
        ? "static-summary"
        : "baseline";

    return {
        score,
        behavior,
        turnCount,
        groupCount,
        completedCount,
        activeCount,
        groupsPerTurn,
        completedRatio,
    };
}
