import type { ToolCallGroupRecord } from "../ToolCallGroupController";
import type { NativeTurnRecord, NativeTurnRole } from "../TurnRegistry";

export type ChatGptTurnCostBucket = "low" | "medium" | "high" | "tool-rich" | "large-code";
export type ChatGptTurnCostBehavior = "noop" | "snapshot" | "contain-code" | "tool-card";

export interface ChatGptTurnCostProfileItem {
    readonly key: string;
    readonly role: NativeTurnRole;
    readonly costBucket: ChatGptTurnCostBucket;
    readonly selectedBehavior: ChatGptTurnCostBehavior;
    readonly visible: boolean;
    readonly toolGroupCount: number;
    readonly codeBlockCount: number;
    readonly buttonCount: number;
    readonly svgCount: number;
    readonly nodeCost: number;
}

export interface ChatGptTurnCostProfileSummary {
    readonly totalTurns: number;
    readonly userTurns: number;
    readonly assistantTurns: number;
    readonly toolRichAssistantTurns: number;
    readonly largeUserCodeTurns: number;
    readonly buckets: Record<ChatGptTurnCostBucket, number>;
    readonly behaviors: Record<ChatGptTurnCostBehavior, number>;
    readonly sample: readonly ChatGptTurnCostProfileItem[];
}

const COST_BUCKETS: readonly ChatGptTurnCostBucket[] = ["low", "medium", "high", "tool-rich", "large-code"];
const BEHAVIORS: readonly ChatGptTurnCostBehavior[] = ["noop", "snapshot", "contain-code", "tool-card"];
const TOOL_SELECTOR = [
    '[data-testid*="tool" i]',
    '[data-message-author-role="tool"]',
    '[class*="tool" i]',
].join(",");
const CODE_SELECTOR = ["pre", "pre code", ".cm-editor", ".cm-content"].join(",");
const BUTTON_SELECTOR = "button,[role='button']";
const SVG_SELECTOR = "svg";

export function createChatGptTurnCostProfile(
    records: readonly NativeTurnRecord[],
    toolGroups: readonly ToolCallGroupRecord[],
    liveWindowSize: number,
): ChatGptTurnCostProfileSummary {
    const toolCountByTurn = new Map<string, number>();
    for (const group of toolGroups) {
        toolCountByTurn.set(group.ownerTurnKey, (toolCountByTurn.get(group.ownerTurnKey) ?? 0) + 1);
    }

    const buckets = zeroRecord(COST_BUCKETS);
    const behaviors = zeroRecord(BEHAVIORS);
    let userTurns = 0;
    let assistantTurns = 0;
    let toolRichAssistantTurns = 0;
    let largeUserCodeTurns = 0;
    const visibleFrom = Math.max(0, records.length - Math.max(1, Math.floor(liveWindowSize)));
    const sample: ChatGptTurnCostProfileItem[] = [];

    records.forEach((record, index) => {
        const item = profileRecord(record, toolCountByTurn.get(record.key) ?? 0, index >= visibleFrom);
        buckets[item.costBucket] += 1;
        behaviors[item.selectedBehavior] += 1;
        if (item.role === "user") userTurns += 1;
        if (item.role === "assistant") assistantTurns += 1;
        if (item.costBucket === "tool-rich") toolRichAssistantTurns += 1;
        if (item.costBucket === "large-code") largeUserCodeTurns += 1;
        if (sample.length < 8) sample.push(item);
    });

    return {
        totalTurns: records.length,
        userTurns,
        assistantTurns,
        toolRichAssistantTurns,
        largeUserCodeTurns,
        buckets,
        behaviors,
        sample,
    };
}

export function prioritizeChatGptTurnRecordsByCost(
    records: readonly NativeTurnRecord[],
): readonly NativeTurnRecord[] {
    return [...records].sort((left, right) => {
        return costPriority(right) - costPriority(left);
    });
}

function profileRecord(record: NativeTurnRecord, indexedToolGroupCount: number, visible: boolean): ChatGptTurnCostProfileItem {
    const element = record.element;
    const estimatedToolCount = Math.max(indexedToolGroupCount, countAll(element, TOOL_SELECTOR));
    const codeBlockCount = countAll(element, CODE_SELECTOR);
    const buttonCount = countAll(element, BUTTON_SELECTOR);
    const svgCount = countAll(element, SVG_SELECTOR);
    const nodeCost = 1 + countAll(element, "*");
    const costBucket = classifyBucket(record.role, {
        toolGroupCount: estimatedToolCount,
        codeBlockCount,
        buttonCount,
        svgCount,
        nodeCost,
    });
    const selectedBehavior = selectBehavior(record.role, costBucket, visible);

    return {
        key: record.key,
        role: record.role,
        costBucket,
        selectedBehavior,
        visible,
        toolGroupCount: estimatedToolCount,
        codeBlockCount,
        buttonCount,
        svgCount,
        nodeCost,
    };
}

function classifyBucket(
    role: NativeTurnRole,
    costs: {
        readonly toolGroupCount: number;
        readonly codeBlockCount: number;
        readonly buttonCount: number;
        readonly svgCount: number;
        readonly nodeCost: number;
    },
): ChatGptTurnCostBucket {
    if (role === "assistant" && (costs.toolGroupCount > 0 || costs.buttonCount + costs.svgCount >= 16)) return "tool-rich";
    if (role === "user" && costs.codeBlockCount > 0 && costs.nodeCost >= 40) return "large-code";
    if (costs.nodeCost >= 220 || costs.buttonCount + costs.svgCount >= 28) return "high";
    if (costs.nodeCost >= 80 || costs.codeBlockCount > 0) return "medium";
    return "low";
}

function selectBehavior(
    role: NativeTurnRole,
    bucket: ChatGptTurnCostBucket,
    visible: boolean,
): ChatGptTurnCostBehavior {
    if (role === "assistant" && bucket === "tool-rich") return "tool-card";
    if (role === "user" && bucket === "large-code") return visible ? "noop" : "contain-code";
    if (visible || bucket === "low") return "noop";
    return "snapshot";
}

function costPriority(record: NativeTurnRecord): number {
    const item = profileRecord(record, 0, false);
    switch (item.selectedBehavior) {
        case "tool-card":
            return 4;
        case "contain-code":
            return 3;
        case "snapshot":
            return 2;
        case "noop":
            return 1;
    }
}

function countAll(root: HTMLElement, selector: string): number {
    return root.querySelectorAll?.(selector).length ?? 0;
}

function zeroRecord<Key extends string>(keys: readonly Key[]): Record<Key, number> {
    return keys.reduce((acc, key) => {
        acc[key] = 0;
        return acc;
    }, {} as Record<Key, number>);
}
