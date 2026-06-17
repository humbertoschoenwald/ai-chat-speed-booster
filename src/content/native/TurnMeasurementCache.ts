import { storageGet, storageSet } from "../../shared/browser-api";
import type { NativeTurnRecord } from "./TurnRegistry";

const SCHEMA_VERSION = 1;
const MAX_MEASUREMENTS = 200;
const STORAGE_KEY = "acsb_native_turn_measurements_v1";

export interface TurnMeasurementRecord {
    readonly key: string;
    readonly role: string;
    readonly height: number;
    readonly measuredAt: number;
    readonly schemaVersion: number;
    readonly featureFlags: readonly string[];
}

interface PersistedTurnMeasurements {
    readonly schemaVersion: number;
    readonly entries: readonly TurnMeasurementRecord[];
}

export class TurnMeasurementCache {
    private readonly records = new Map<string, TurnMeasurementRecord>();

    async load(): Promise<void> {
        const persisted = await storageGet<PersistedTurnMeasurements>(STORAGE_KEY);
        if (!persisted || persisted.schemaVersion !== SCHEMA_VERSION) return;
        this.records.clear();
        for (const entry of persisted.entries.slice(-MAX_MEASUREMENTS)) {
            if (this.isStorageSafeKey(entry.key)) {
                this.records.set(entry.key, entry);
            }
        }
    }

    remember(record: NativeTurnRecord, featureFlags: readonly string[] = [], now = Date.now()): boolean {
        if (record.measuredHeight === null) return false;
        if (!this.isStorageSafeKey(record.key)) return false;
        this.records.set(record.key, {
            key: record.key,
            role: record.role,
            height: record.measuredHeight,
            measuredAt: now,
            schemaVersion: SCHEMA_VERSION,
            featureFlags: [...featureFlags],
        });
        this.trim();
        return true;
    }

    get(key: string): TurnMeasurementRecord | undefined {
        return this.records.get(key);
    }

    async save(): Promise<void> {
        await storageSet<PersistedTurnMeasurements>(STORAGE_KEY, {
            schemaVersion: SCHEMA_VERSION,
            entries: [...this.records.values()],
        });
    }

    snapshot(): { readonly measurementCount: number; readonly schemaVersion: number } {
        return {
            measurementCount: this.records.size,
            schemaVersion: SCHEMA_VERSION,
        };
    }

    private trim(): void {
        while (this.records.size > MAX_MEASUREMENTS) {
            const oldest = this.records.keys().next().value;
            if (!oldest) return;
            this.records.delete(oldest);
        }
    }

    private isStorageSafeKey(key: string): boolean {
        return key.startsWith("testid:conversation-turn-");
    }
}
