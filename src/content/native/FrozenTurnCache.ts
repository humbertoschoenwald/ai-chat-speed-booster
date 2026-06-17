import type { NativeTurnRecord } from "./TurnRegistry";

export interface FrozenTurnEntry {
    readonly key: string;
    readonly element: HTMLElement;
    readonly placeholder: HTMLElement;
    readonly frozenAt: number;
    readonly reason: string;
}

export interface FrozenTurnCacheSnapshot {
    readonly frozenCount: number;
    readonly oldestFrozenAt: number | null;
    readonly newestFrozenAt: number | null;
}

export class FrozenTurnCache {
    private readonly entries = new Map<string, FrozenTurnEntry>();
    private readonly fragment = document.createDocumentFragment();

    freeze(record: NativeTurnRecord, placeholder: HTMLElement, reason: string, now = Date.now()): boolean {
        if (this.entries.has(record.key)) return false;
        placeholder.dataset.acsbNativePlaceholder = record.key;
        this.fragment.appendChild(record.element);
        record.hydrationState = "frozen";
        this.entries.set(record.key, {
            key: record.key,
            element: record.element,
            placeholder,
            frozenAt: now,
            reason,
        });
        return true;
    }

    restore(record: NativeTurnRecord): HTMLElement | null {
        const entry = this.entries.get(record.key);
        if (!entry) return null;
        if (entry.placeholder.isConnected) {
            entry.placeholder.replaceWith(entry.element);
        }
        record.hydrationState = "hydrated";
        this.entries.delete(record.key);
        return entry.element;
    }

    restoreAll(records: Iterable<NativeTurnRecord>): number {
        let restored = 0;
        for (const record of records) {
            if (this.restore(record)) restored += 1;
        }
        return restored;
    }

    has(key: string): boolean {
        return this.entries.has(key);
    }

    snapshot(): FrozenTurnCacheSnapshot {
        const timestamps = [...this.entries.values()].map((entry) => entry.frozenAt);
        return {
            frozenCount: this.entries.size,
            oldestFrozenAt: timestamps.length > 0 ? Math.min(...timestamps) : null,
            newestFrozenAt: timestamps.length > 0 ? Math.max(...timestamps) : null,
        };
    }
}
