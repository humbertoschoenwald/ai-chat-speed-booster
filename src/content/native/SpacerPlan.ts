import type { NativeTurnRecord } from "./TurnRegistry";

export interface SpacerRecord {
    readonly key: string;
    readonly heightPx: number;
}

export interface SpacerPlanSnapshot {
    readonly plannedCount: number;
    readonly lastHeightPx: number | null;
}

export class SpacerPlan {
    private plannedCount = 0;
    private lastHeightPx: number | null = null;

    create(record: NativeTurnRecord): SpacerRecord | null {
        if (record.measuredHeight === null) return null;
        const heightPx = Math.max(1, Math.ceil(record.measuredHeight));
        this.plannedCount += 1;
        this.lastHeightPx = heightPx;
        return { key: record.key, heightPx };
    }

    snapshot(): SpacerPlanSnapshot {
        return { plannedCount: this.plannedCount, lastHeightPx: this.lastHeightPx };
    }
}
