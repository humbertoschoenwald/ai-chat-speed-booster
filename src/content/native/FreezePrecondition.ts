import type { NativeTurnRecord } from "./TurnRegistry";

export type FreezeBlockReason =
    | "already-frozen"
    | "placeholder"
    | "pinned"
    | "unmeasured"
    | "visible-window"
    | "unsafe-role";

export interface FreezePreconditionDecision {
    readonly key: string;
    readonly canFreeze: boolean;
    readonly reason: "eligible" | FreezeBlockReason;
}

export interface FreezePreconditionSnapshot {
    readonly inspectedTurns: number;
    readonly eligibleTurns: number;
    readonly blockedTurns: number;
}

export class FreezePrecondition {
    private inspectedTurns = 0;
    private eligibleTurns = 0;
    private blockedTurns = 0;

    evaluate(record: NativeTurnRecord, visibleWindow: boolean): FreezePreconditionDecision {
        this.inspectedTurns += 1;
        const reason = this.blockReason(record, visibleWindow);
        if (reason) {
            this.blockedTurns += 1;
            return { key: record.key, canFreeze: false, reason };
        }
        this.eligibleTurns += 1;
        return { key: record.key, canFreeze: true, reason: "eligible" };
    }

    snapshot(): FreezePreconditionSnapshot {
        return {
            inspectedTurns: this.inspectedTurns,
            eligibleTurns: this.eligibleTurns,
            blockedTurns: this.blockedTurns,
        };
    }

    private blockReason(record: NativeTurnRecord, visibleWindow: boolean): FreezeBlockReason | null {
        if (record.hydrationState === "frozen") return "already-frozen";
        if (record.hydrationState === "placeholder") return "placeholder";
        if (record.pinReasons.size > 0) return "pinned";
        if (record.measuredHeight === null) return "unmeasured";
        if (visibleWindow) return "visible-window";
        if (record.role === "unknown" || record.role === "system") return "unsafe-role";
        return null;
    }
}
