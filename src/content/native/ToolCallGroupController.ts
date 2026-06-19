import type { NativeTurnRecord } from "./TurnRegistry";

export type ToolCallState = "completed" | "running" | "failed" | "user-expanded";

export interface ToolCallGroupRecord {
    readonly id: string;
    readonly ownerTurnKey: string;
    readonly element: HTMLElement;
    state: ToolCallState;
    estimatedNodeCost: number;
}

export interface ToolCallGroupSnapshot {
    readonly groupCount: number;
    readonly runningCount: number;
    readonly failedCount: number;
    readonly completedCount: number;
    readonly estimatedNodeCost: number;
}

const TOOL_CALL_SELECTOR = [
    '[data-testid*="tool" i]',
    '[data-message-author-role="tool"]',
    '[class*="tool" i]',
].join(",");

const FAILED_SELECTOR = [
    '[role="alert"]',
    '[data-testid*="error" i]',
    '[class*="error" i]',
].join(",");

const RUNNING_SELECTOR = [
    '[data-testid*="spinner" i]',
    '[data-testid*="loading" i]',
    '[aria-busy="true"]',
    '[class*="spinner" i]',
    '[class*="loading" i]',
].join(",");

export class ToolCallGroupController {
    private readonly groups = new Map<string, ToolCallGroupRecord>();

    reset(): void {
        this.groups.clear();
    }

    indexTurn(record: NativeTurnRecord): readonly ToolCallGroupRecord[] {
        const elements = record.element.matches(TOOL_CALL_SELECTOR)
            ? [record.element]
            : [...record.element.querySelectorAll<HTMLElement>(TOOL_CALL_SELECTOR)];
        const groups = elements.map((element, index) => this.trackGroup(record, element, index));
        return groups;
    }

    snapshot(): ToolCallGroupSnapshot {
        let runningCount = 0;
        let failedCount = 0;
        let completedCount = 0;
        let estimatedNodeCost = 0;

        for (const group of this.groups.values()) {
            if (group.state === "running") runningCount += 1;
            if (group.state === "failed") failedCount += 1;
            if (group.state === "completed") completedCount += 1;
            estimatedNodeCost += group.estimatedNodeCost;
        }

        return {
            groupCount: this.groups.size,
            runningCount,
            failedCount,
            completedCount,
            estimatedNodeCost,
        };
    }

    private trackGroup(record: NativeTurnRecord, element: HTMLElement, index: number): ToolCallGroupRecord {
        const id = `${record.key}:tool:${index}`;
        const existing = this.groups.get(id);
        if (existing) {
            existing.state = this.classify(element);
            existing.estimatedNodeCost = this.estimateNodeCost(element);
            return existing;
        }

        const group: ToolCallGroupRecord = {
            id,
            ownerTurnKey: record.key,
            element,
            state: this.classify(element),
            estimatedNodeCost: this.estimateNodeCost(element),
        };
        this.groups.set(id, group);
        return group;
    }

    private classify(element: HTMLElement): ToolCallState {
        if (element.matches(FAILED_SELECTOR) || element.querySelector(FAILED_SELECTOR)) return "failed";
        if (element.matches(RUNNING_SELECTOR) || element.querySelector(RUNNING_SELECTOR)) return "running";
        if (element.getAttribute("aria-expanded") === "true") return "user-expanded";
        const text = (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
        if (text.includes("calling tool") || text.includes("working on it")) return "running";
        if (element.getAttribute("data-state") === "closed" || element.querySelector("[data-state='closed']")) return "completed";
        return "running";
    }

    private estimateNodeCost(element: HTMLElement): number {
        return 1 + element.querySelectorAll("*").length;
    }
}
