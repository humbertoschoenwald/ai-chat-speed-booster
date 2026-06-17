import type { NativeTurnRecord } from "./TurnRegistry";

export type RestoreTrigger =
    | "viewport"
    | "focus"
    | "selection"
    | "copy"
    | "find"
    | "accessibility"
    | "disable-native"
    | "selector-uncertain"
    | "diagnostics-export";

export interface RestoreDecision {
    readonly key: string;
    readonly restore: boolean;
    readonly reason: RestoreTrigger;
}

export interface RestorePolicySnapshot {
    readonly inspectedTurns: number;
    readonly restoreCount: number;
    readonly keepFrozenCount: number;
}

export class RestorePolicy {
    private inspectedTurns = 0;
    private restoreCount = 0;
    private keepFrozenCount = 0;

    plan(records: readonly NativeTurnRecord[], trigger: RestoreTrigger): readonly RestoreDecision[] {
        this.inspectedTurns = records.length;
        this.restoreCount = 0;
        this.keepFrozenCount = 0;

        return records.map((record) => {
            const restore = this.shouldRestore(record, trigger);
            if (restore) this.restoreCount += 1;
            else this.keepFrozenCount += 1;
            return { key: record.key, restore, reason: trigger };
        });
    }

    snapshot(): RestorePolicySnapshot {
        return {
            inspectedTurns: this.inspectedTurns,
            restoreCount: this.restoreCount,
            keepFrozenCount: this.keepFrozenCount,
        };
    }

    private shouldRestore(record: NativeTurnRecord, trigger: RestoreTrigger): boolean {
        if (record.hydrationState === "hydrated") return false;
        if (trigger === "viewport") return true;
        if (trigger === "disable-native") return true;
        if (trigger === "selector-uncertain") return true;
        if (trigger === "diagnostics-export") return true;
        if (record.pinReasons.size > 0) return true;
        return trigger === "focus" ||
            trigger === "selection" ||
            trigger === "copy" ||
            trigger === "find" ||
            trigger === "accessibility";
    }
}
