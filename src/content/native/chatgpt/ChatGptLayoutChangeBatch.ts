import type { NativeTurnRecord, TurnRegistry } from "../TurnRegistry";

export interface ChatGptLayoutChangeBatchSnapshot {
    readonly pending: boolean;
    readonly changeCount: number;
    readonly measuredTurnCount: number;
    readonly skippedCachedOldTurnCount: number;
    readonly protectedTailSize: number;
    readonly lastReason: string | null;
}

const LAYOUT_STABLE_WINDOW_MS = 48;

export class ChatGptLayoutChangeBatch {
    private dirty = false;
    private changeCount = 0;
    private lastDirtyAt = 0;
    private lastReason: string | null = null;
    private lastSnapshot: ChatGptLayoutChangeBatchSnapshot = {
        pending: false,
        changeCount: 0,
        measuredTurnCount: 0,
        skippedCachedOldTurnCount: 0,
        protectedTailSize: 0,
        lastReason: null,
    };

    markDirty(reason: string, now = Date.now()): void {
        this.dirty = true;
        this.changeCount += 1;
        this.lastDirtyAt = now;
        this.lastReason = reason;
        this.lastSnapshot = {
            ...this.lastSnapshot,
            pending: true,
            changeCount: this.changeCount,
            lastReason: this.lastReason,
        };
    }

    consume(
        records: readonly NativeTurnRecord[],
        protectedTailSize: number,
        registry: TurnRegistry,
        now = Date.now(),
    ): ChatGptLayoutChangeBatchSnapshot {
        if (!this.dirty) return this.lastSnapshot;
        if (now - this.lastDirtyAt < LAYOUT_STABLE_WINDOW_MS) {
            this.lastSnapshot = {
                ...this.lastSnapshot,
                pending: true,
                changeCount: this.changeCount,
                protectedTailSize,
                lastReason: this.lastReason,
            };
            return this.lastSnapshot;
        }

        let measuredTurnCount = 0;
        let skippedCachedOldTurnCount = 0;
        const protectedFrom = Math.max(0, records.length - protectedTailSize);
        records.forEach((record, index) => {
            const nearViewport = index >= protectedFrom || record.pinReasons.size > 0;
            if (!nearViewport) {
                if (record.measuredHeight !== null) skippedCachedOldTurnCount += 1;
                return;
            }
            registry.measure(record, now);
            measuredTurnCount += 1;
        });

        this.dirty = false;
        this.lastSnapshot = {
            pending: false,
            changeCount: this.changeCount,
            measuredTurnCount,
            skippedCachedOldTurnCount,
            protectedTailSize,
            lastReason: this.lastReason,
        };
        return this.lastSnapshot;
    }

    snapshot(): ChatGptLayoutChangeBatchSnapshot {
        return this.lastSnapshot;
    }

    reset(): void {
        this.dirty = false;
        this.changeCount = 0;
        this.lastDirtyAt = 0;
        this.lastReason = null;
        this.lastSnapshot = {
            pending: false,
            changeCount: 0,
            measuredTurnCount: 0,
            skippedCachedOldTurnCount: 0,
            protectedTailSize: 0,
            lastReason: null,
        };
    }
}
