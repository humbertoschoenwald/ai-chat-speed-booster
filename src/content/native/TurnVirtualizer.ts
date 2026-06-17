import type { NativeTurnRecord } from "./TurnRegistry";

export interface TurnVirtualizerWindow {
    readonly viewportTop: number;
    readonly viewportBottom: number;
    readonly overscanPx: number;
}

export interface TurnVirtualizerDecision {
    readonly key: string;
    readonly action: "keep-hydrated" | "freeze-candidate" | "restore-candidate";
    readonly reason: string;
}

export interface TurnVirtualizerSnapshot {
    readonly inspectedTurns: number;
    readonly keepHydratedCount: number;
    readonly freezeCandidateCount: number;
    readonly restoreCandidateCount: number;
}

export class TurnVirtualizer {
    private inspectedTurns = 0;
    private keepHydratedCount = 0;
    private freezeCandidateCount = 0;
    private restoreCandidateCount = 0;

    plan(records: readonly NativeTurnRecord[], window: TurnVirtualizerWindow): readonly TurnVirtualizerDecision[] {
        this.inspectedTurns = records.length;
        this.keepHydratedCount = 0;
        this.freezeCandidateCount = 0;
        this.restoreCandidateCount = 0;

        return records.map((record) => this.decide(record, window));
    }

    snapshot(): TurnVirtualizerSnapshot {
        return {
            inspectedTurns: this.inspectedTurns,
            keepHydratedCount: this.keepHydratedCount,
            freezeCandidateCount: this.freezeCandidateCount,
            restoreCandidateCount: this.restoreCandidateCount,
        };
    }

    private decide(record: NativeTurnRecord, window: TurnVirtualizerWindow): TurnVirtualizerDecision {
        if (record.pinReasons.size > 0) return this.keep(record, "pinned");
        if (record.measuredHeight === null) return this.keep(record, "unmeasured");

        const rect = record.element.getBoundingClientRect();
        const top = rect.top;
        const bottom = rect.bottom;
        const inOverscan = bottom >= window.viewportTop - window.overscanPx &&
            top <= window.viewportBottom + window.overscanPx;

        if (inOverscan) {
            if (record.hydrationState !== "hydrated") return this.restore(record, "within-overscan");
            return this.keep(record, "within-overscan");
        }

        if (record.hydrationState === "hydrated") return this.freeze(record, "outside-overscan");
        return this.keep(record, "already-offscreen");
    }

    private keep(record: NativeTurnRecord, reason: string): TurnVirtualizerDecision {
        this.keepHydratedCount += 1;
        return { key: record.key, action: "keep-hydrated", reason };
    }

    private freeze(record: NativeTurnRecord, reason: string): TurnVirtualizerDecision {
        this.freezeCandidateCount += 1;
        return { key: record.key, action: "freeze-candidate", reason };
    }

    private restore(record: NativeTurnRecord, reason: string): TurnVirtualizerDecision {
        this.restoreCandidateCount += 1;
        return { key: record.key, action: "restore-candidate", reason };
    }
}
