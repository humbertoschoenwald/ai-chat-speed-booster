import {
    createChatGptFullFidelityLayoutPlan,
    type ChatGptFullFidelityLayoutPlan,
    type ChatGptTurnLayoutInput,
    type ChatGptViewportWindow,
} from "./ChatGptFullFidelityLayoutPlan";

export interface ChatGptCachedTurnMeasurement {
    readonly key: string;
    readonly heightPx: number;
    readonly pinned?: boolean;
    readonly measuredAtMs: number;
}

export interface ChatGptLayoutCacheSnapshot {
    readonly turnCount: number;
    readonly totalKnownHeightPx: number;
    readonly newestMeasurementMs: number | null;
}

export class ChatGptLayoutCache {
    private readonly measurements = new Map<string, ChatGptCachedTurnMeasurement>();
    private totalKnownHeightPx = 0;
    private newestMeasurementMs: number | null = null;

    upsert(measurement: ChatGptCachedTurnMeasurement): void {
        if (!measurement.key || !Number.isFinite(measurement.heightPx)) return;
        const previous = this.measurements.get(measurement.key);
        const next = {
            key: measurement.key,
            heightPx: Math.max(1, Math.round(measurement.heightPx)),
            pinned: measurement.pinned === true,
            measuredAtMs: Math.max(0, Math.round(measurement.measuredAtMs)),
        };
        this.totalKnownHeightPx += next.heightPx - (previous?.heightPx ?? 0);
        this.newestMeasurementMs = this.newestMeasurementMs === null
            ? next.measuredAtMs
            : Math.max(this.newestMeasurementMs, next.measuredAtMs);
        this.measurements.set(measurement.key, next);
    }

    remove(key: string): void {
        const previous = this.measurements.get(key);
        if (!previous) return;
        this.measurements.delete(key);
        this.totalKnownHeightPx -= previous.heightPx;
        if (this.newestMeasurementMs === previous.measuredAtMs) {
            this.newestMeasurementMs = this.findNewestMeasurementMs();
        }
    }

    createPlan(order: readonly string[], viewport: ChatGptViewportWindow): ChatGptFullFidelityLayoutPlan {
        const turns: ChatGptTurnLayoutInput[] = [];
        for (const key of order) {
            const measurement = this.measurements.get(key);
            if (!measurement) continue;
            turns.push({
                key: measurement.key,
                heightPx: measurement.heightPx,
                pinned: measurement.pinned,
            });
        }
        return createChatGptFullFidelityLayoutPlan(turns, viewport);
    }

    snapshot(): ChatGptLayoutCacheSnapshot {
        return {
            turnCount: this.measurements.size,
            totalKnownHeightPx: this.totalKnownHeightPx,
            newestMeasurementMs: this.newestMeasurementMs,
        };
    }

    private findNewestMeasurementMs(): number | null {
        let newestMeasurementMs: number | null = null;
        for (const measurement of this.measurements.values()) {
            newestMeasurementMs = newestMeasurementMs === null
                ? measurement.measuredAtMs
                : Math.max(newestMeasurementMs, measurement.measuredAtMs);
        }
        return newestMeasurementMs;
    }
}
