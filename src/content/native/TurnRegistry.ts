import { readChatGptMessageIdentityKey, readChatGptMessageMetadata, type ChatGptMessageMetadata } from "./chatgpt/ChatGptMessageMetadata";
import { resolveChatGptMessageRole, type ChatGptMessageRoleConfidence, type ChatGptMessageRoleSource } from "./chatgpt/ChatGptMessageRoleResolver";

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
    element: HTMLElement;
    role: NativeTurnRole;
    roleSource?: ChatGptMessageRoleSource;
    roleConfidence?: ChatGptMessageRoleConfidence;
    metadata?: ChatGptMessageMetadata;
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
    private elementToRecord = new WeakMap<HTMLElement, NativeTurnRecord>();
    private placeholderToRecord = new WeakMap<HTMLElement, NativeTurnRecord>();
    private readonly dirtyMeasurements = new Set<string>();
    private readonly dirtyTurns = new Set<string>();

    reset(): void {
        this.keyToRecord.clear();
        this.elementToRecord = new WeakMap<HTMLElement, NativeTurnRecord>();
        this.placeholderToRecord = new WeakMap<HTMLElement, NativeTurnRecord>();
        this.dirtyMeasurements.clear();
        this.dirtyTurns.clear();
    }

    track(element: HTMLElement, structuralIndex: number): NativeTurnRecord {
        const key = this.deriveKey(element, structuralIndex);
        const existing = this.keyToRecord.get(key);
        if (existing) {
            const metadata = readChatGptMessageMetadata(element);
            const roleResolution = resolveChatGptMessageRole(element, metadata, existing.role);
            if (
                existing.element !== element
                || existing.role !== roleResolution.role
                || existing.roleSource !== roleResolution.source
                || existing.roleConfidence !== roleResolution.confidence
                || !metadataEquals(existing.metadata, metadata)
            ) {
                existing.element = element;
                existing.role = roleResolution.role;
                existing.roleSource = roleResolution.source;
                existing.roleConfidence = roleResolution.confidence;
                existing.metadata = metadata;
                this.elementToRecord.set(element, existing);
                this.markTurnDirty(existing);
            }
            return existing;
        }

        const metadata = readChatGptMessageMetadata(element);
        const roleResolution = resolveChatGptMessageRole(element, metadata);
        const record: NativeTurnRecord = {
            key,
            element,
            role: roleResolution.role,
            roleSource: roleResolution.source,
            roleConfidence: roleResolution.confidence,
            metadata,
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
        this.markTurnDirty(record);
        return record;
    }

    markDirtyByElement(element: HTMLElement): boolean {
        const record = this.elementToRecord.get(element);
        if (!record) return false;
        this.markTurnDirty(record);
        return true;
    }

    consumeDirtyRecords(records: readonly NativeTurnRecord[]): readonly NativeTurnRecord[] {
        if (this.dirtyTurns.size === 0) return [];
        const dirtyRecords = records.filter((record) => this.dirtyTurns.has(record.key));
        for (const record of dirtyRecords) this.dirtyTurns.delete(record.key);
        return dirtyRecords;
    }

    dirtyTurnKeys(): readonly string[] {
        return [...this.dirtyTurns];
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

    private markTurnDirty(record: NativeTurnRecord): void {
        this.dirtyTurns.add(record.key);
        this.markMeasurementDirty(record);
    }

    private deriveKey(element: HTMLElement, structuralIndex: number): string {
        const metadataKey = readChatGptMessageIdentityKey(element);
        if (metadataKey) return `metadata:${metadataKey}`;
        const turnId = element.id;
        if (turnId) return `attr:${turnId}`;
        return `unstable:${location.pathname}:${structuralIndex}`;
    }

}

function metadataEquals(left: ChatGptMessageMetadata | undefined, right: ChatGptMessageMetadata): boolean {
    if (!left) return false;
    return left.messageId === right.messageId
        && left.turnId === right.turnId
        && left.testId === right.testId
        && left.authorRole === right.authorRole
        && left.modelLabel === right.modelLabel;
}
