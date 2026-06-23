export type NativeWorkLane = "input" | "recovery" | "visible-turn" | "status" | "tool-call" | "idle";

export interface NativeWorkItem {
    readonly id: string;
    readonly lane: NativeWorkLane;
    readonly run: () => void;
    readonly queuedAt: number;
}

export interface NativeWorkDrainOptions {
    readonly inputProtected?: boolean;
    readonly now?: number;
}

export interface NativeWorkDrainResult {
    readonly ran: readonly string[];
    readonly deferred: readonly string[];
}

export interface NativeWorkSchedulerSnapshot {
    readonly queued: number;
    readonly lanes: Record<NativeWorkLane, number>;
    readonly lastRunAt: number | null;
    readonly lastDeferredAt: number | null;
}

const LANE_PRIORITY: Record<NativeWorkLane, number> = {
    input: 0,
    recovery: 1,
    "visible-turn": 2,
    status: 3,
    "tool-call": 4,
    idle: 5,
};

const INPUT_PROTECTED_LANES = new Set<NativeWorkLane>(["input", "recovery"]);

export class NativeWorkScheduler {
    private queue: NativeWorkItem[] = [];
    private lastRunAt: number | null = null;
    private lastDeferredAt: number | null = null;

    schedule(lane: NativeWorkLane, id: string, run: () => void, now = Date.now()): void {
        this.cancel(id);
        this.queue.push({ id, lane, run, queuedAt: now });
    }

    cancel(id: string): boolean {
        const index = this.queue.findIndex((item) => item.id === id);
        if (index < 0) return false;
        this.queue.splice(index, 1);
        return true;
    }

    drain(options: NativeWorkDrainOptions = {}): NativeWorkDrainResult {
        const now = options.now ?? Date.now();
        const inputProtected = options.inputProtected ?? false;
        const ordered = [...this.queue].sort((a, b) => {
            const priorityDelta = LANE_PRIORITY[a.lane] - LANE_PRIORITY[b.lane];
            return priorityDelta !== 0 ? priorityDelta : a.queuedAt - b.queuedAt;
        });
        const ran: string[] = [];
        const deferred: string[] = [];
        const ranItems = new Set<NativeWorkItem>();

        for (const item of ordered) {
            if (inputProtected && !INPUT_PROTECTED_LANES.has(item.lane)) {
                deferred.push(item.id);
                continue;
            }
            item.run();
            ran.push(item.id);
            ranItems.add(item);
        }

        if (ranItems.size > 0) {
            this.queue = this.queue.filter((item) => !ranItems.has(item));
        }

        if (ran.length > 0) this.lastRunAt = now;
        if (deferred.length > 0) this.lastDeferredAt = now;
        return { ran, deferred };
    }

    snapshot(): NativeWorkSchedulerSnapshot {
        const lanes = Object.keys(LANE_PRIORITY).reduce((acc, lane) => {
            acc[lane as NativeWorkLane] = 0;
            return acc;
        }, {} as Record<NativeWorkLane, number>);
        for (const item of this.queue) lanes[item.lane] += 1;
        return {
            queued: this.queue.length,
            lanes,
            lastRunAt: this.lastRunAt,
            lastDeferredAt: this.lastDeferredAt,
        };
    }
}
