export type NativeTurnRole = "user" | "assistant" | "system" | "unknown";
export type NativeTurnHydrationState = "hydrated" | "frozen" | "placeholder";
export type NativeTurnPinReason =
    | "focused"
    | "selected"
    | "streaming"
    | "running-tool"
    | "failed-tool"
    | "user-expanded"
    | "uncertain-key";

export interface NativeTurnRecord {
    readonly key: string;
    readonly element: HTMLElement;
    readonly role: NativeTurnRole;
    hydrationState: NativeTurnHydrationState;
    measuredHeight: number | null;
    readonly pinReasons: Set<NativeTurnPinReason>;
    lastMeasuredAt: number | null;
}

export interface TurnRegistrySnapshot {
    readonly totalTurns: number;
    readonly hydratedTurns: number;
    readonly frozenTurns: number;
    readonly placeholderTurns: number;
    readonly pinnedTurns: number;
    readonly uncertainKeyTurns: number;
}

export class TurnRegistry {
    private readonly keyToRecord = new Map<string, NativeTurnRecord>();
    private readonly elementToRecord = new WeakMap<HTMLElement, NativeTurnRecord>();
    private readonly placeholderToRecord = new WeakMap<HTMLElement, NativeTurnRecord>();
    private readonly dirtyMeasurements = new Set<string>();

    track(element: HTMLElement, structuralIndex: number): NativeTurnRecord {
        const key = this.deriveKey(element, structuralIndex);
        const existing = this.keyToRecord.get(key);
        if (existing) return existing;

        const record: NativeTurnRecord = {
            key,
            element,
            role: this.deriveRole(element),
            hydrationState: "hydrated",
            measuredHeight: null,
            pinReasons: new Set(),
            lastMeasuredAt: null,
        };

        if (key.startsWith("unstable:")) {
            record.pinReasons.add("uncertain-key");
        }

        this.keyToRecord.set(key, record);
        this.elementToRecord.set(element, record);
        this.markMeasurementDirty(record);
        return record;
    }

    getByKey(key: string): NativeTurnRecord | undefined {
        return this.keyToRecord.get(key);
    }

    getByElement(element: HTMLElement): NativeTurnRecord | undefined {
        return this.elementToRecord.get(element);
    }

    getByPlaceholder(placeholder: HTMLElement): NativeTurnRecord | undefined {
        return this.placeholderToRecord.get(placeholder);
    }

    attachPlaceholder(record: NativeTurnRecord, placeholder: HTMLElement): void {
        this.placeholderToRecord.set(placeholder, record);
        record.hydrationState = "placeholder";
    }

    markHydrated(record: NativeTurnRecord): void {
        record.hydrationState = "hydrated";
        this.markMeasurementDirty(record);
    }

    markFrozen(record: NativeTurnRecord): void {
        record.hydrationState = "frozen";
    }

    pin(record: NativeTurnRecord, reason: NativeTurnPinReason): void {
        record.pinReasons.add(reason);
    }

    unpin(record: NativeTurnRecord, reason: NativeTurnPinReason): void {
        record.pinReasons.delete(reason);
    }

    isPinned(record: NativeTurnRecord): boolean {
        return record.pinReasons.size > 0;
    }

    measure(record: NativeTurnRecord, now = Date.now()): number {
        const rect = record.element.getBoundingClientRect();
        record.measuredHeight = rect.height;
        record.lastMeasuredAt = now;
        this.dirtyMeasurements.delete(record.key);
        return rect.height;
    }

    dirtyMeasurementKeys(): readonly string[] {
        return [...this.dirtyMeasurements];
    }

    snapshot(): TurnRegistrySnapshot {
        let hydratedTurns = 0;
        let frozenTurns = 0;
        let placeholderTurns = 0;
        let pinnedTurns = 0;
        let uncertainKeyTurns = 0;

        for (const record of this.keyToRecord.values()) {
            if (record.hydrationState === "hydrated") hydratedTurns += 1;
            if (record.hydrationState === "frozen") frozenTurns += 1;
            if (record.hydrationState === "placeholder") placeholderTurns += 1;
            if (record.pinReasons.size > 0) pinnedTurns += 1;
            if (record.pinReasons.has("uncertain-key")) uncertainKeyTurns += 1;
        }

        return {
            totalTurns: this.keyToRecord.size,
            hydratedTurns,
            frozenTurns,
            placeholderTurns,
            pinnedTurns,
            uncertainKeyTurns,
        };
    }

    private markMeasurementDirty(record: NativeTurnRecord): void {
        this.dirtyMeasurements.add(record.key);
    }

    private deriveKey(element: HTMLElement, structuralIndex: number): string {
        const testId = element.getAttribute("data-testid");
        if (testId?.startsWith("conversation-turn-")) return `testid:${testId}`;
        const turnId = element.getAttribute("data-message-id") ?? element.id;
        if (turnId) return `attr:${turnId}`;
        return `unstable:${location.pathname}:${structuralIndex}`;
    }

    private deriveRole(element: HTMLElement): NativeTurnRole {
        const text = [
            element.getAttribute("data-message-author-role"),
            element.getAttribute("data-author"),
            element.getAttribute("aria-label"),
        ].join(" ").toLowerCase();

        if (text.includes("user")) return "user";
        if (text.includes("assistant")) return "assistant";
        if (text.includes("system")) return "system";
        return "unknown";
    }
}
