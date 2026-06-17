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

    upsert(measurement: ChatGptCachedTurnMeasurement): void {
        if (!measurement.key || !Number.isFinite(measurement.heightPx)) return;
        this.measurements.set(measurement.key, {
            key: measurement.key,
            heightPx: Math.max(1, Math.round(measurement.heightPx)),
            pinned: measurement.pinned === true,
            measuredAtMs: Math.max(0, Math.round(measurement.measuredAtMs)),
        });
    }

    remove(key: string): void {
        this.measurements.delete(key);
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
        let totalKnownHeightPx = 0;
        let newestMeasurementMs: number | null = null;
        for (const measurement of this.measurements.values()) {
            totalKnownHeightPx += measurement.heightPx;
            newestMeasurementMs = newestMeasurementMs === null
                ? measurement.measuredAtMs
                : Math.max(newestMeasurementMs, measurement.measuredAtMs);
        }

        return {
            turnCount: this.measurements.size,
            totalKnownHeightPx,
            newestMeasurementMs,
        };
    }
}
