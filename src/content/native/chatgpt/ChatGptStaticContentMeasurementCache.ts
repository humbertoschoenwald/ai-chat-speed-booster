import type { NativeTurnRecord } from "../TurnRegistry";

export type ChatGptCodeNodeBucket = "none" | "small" | "medium" | "heavy";

export interface ChatGptStaticContentMeasurement {
    readonly key: string;
    readonly height: number | null;
    readonly nodeCost: number;
    readonly codeNodeCount: number;
    readonly codeNodeBucket: ChatGptCodeNodeBucket;
    readonly textLengthBucket: string;
    readonly hasInteractiveControls: boolean;
}

export interface ChatGptStaticContentMeasurementCacheSnapshot {
    readonly entryCount: number;
    readonly cacheHits: number;
    readonly measuredTurns: number;
    readonly estimatedTurnNodeCost: number;
    readonly codeNodeCount: number;
    readonly codeBucketCounts: Record<ChatGptCodeNodeBucket, number>;
    readonly codeBucketByTurnKey: ReadonlyMap<string, ChatGptCodeNodeBucket>;
    readonly heavyCodeTurnCount: number;
    readonly interactiveControlTurns: number;
}

const CODE_SELECTOR = "pre,code,[class*='code' i]";
const INTERACTIVE_SELECTOR = "button,[role='button'],a[href],[aria-haspopup='menu']";

function createEmptyCodeBucketCounts(): Record<ChatGptCodeNodeBucket, number> {
    return { none: 0, small: 0, medium: 0, heavy: 0 };
}

export class ChatGptStaticContentMeasurementCache {
    private readonly entries = new Map<string, ChatGptStaticContentMeasurement>();

    reset(): void {
        this.entries.clear();
    }

    measure(
        records: readonly NativeTurnRecord[],
        dirtyKeys: readonly string[],
    ): ChatGptStaticContentMeasurementCacheSnapshot {
        const dirty = new Set(dirtyKeys);
        let cacheHits = 0;
        let measuredTurns = 0;
        let estimatedTurnNodeCost = 0;
        let codeNodeCount = 0;
        let heavyCodeTurnCount = 0;
        let interactiveControlTurns = 0;
        const codeBucketCounts = createEmptyCodeBucketCounts();
        const codeBucketByTurnKey = new Map<string, ChatGptCodeNodeBucket>();

        for (const key of dirty) this.entries.delete(key);
        for (const record of records) {
            let measurement = this.entries.get(record.key);
            if (measurement) {
                cacheHits += 1;
            } else {
                measurement = measureRecord(record);
                this.entries.set(record.key, measurement);
                measuredTurns += 1;
            }
            estimatedTurnNodeCost += measurement.nodeCost;
            codeNodeCount += measurement.codeNodeCount;
            codeBucketCounts[measurement.codeNodeBucket] += 1;
            codeBucketByTurnKey.set(record.key, measurement.codeNodeBucket);
            if (measurement.codeNodeBucket === "heavy") heavyCodeTurnCount += 1;
            if (measurement.hasInteractiveControls) interactiveControlTurns += 1;
        }

        return {
            entryCount: this.entries.size,
            cacheHits,
            measuredTurns,
            estimatedTurnNodeCost,
            codeNodeCount,
            codeBucketCounts,
            codeBucketByTurnKey,
            heavyCodeTurnCount,
            interactiveControlTurns,
        };
    }
}

function measureRecord(record: NativeTurnRecord): ChatGptStaticContentMeasurement {
    const element = record.element;
    const codeNodeCount = element.querySelectorAll(CODE_SELECTOR).length;
    const hasInteractiveControls = element.querySelector(INTERACTIVE_SELECTOR) !== null;
    const text = (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim();
    return {
        key: record.key,
        height: readHeight(element),
        nodeCost: 1 + element.querySelectorAll("*").length,
        codeNodeCount,
        codeNodeBucket: bucketCodeNodeCount(codeNodeCount),
        textLengthBucket: bucketTextLength(text.length),
        hasInteractiveControls,
    };
}

export function bucketCodeNodeCount(codeNodeCount: number): ChatGptCodeNodeBucket {
    if (codeNodeCount <= 0) return "none";
    if (codeNodeCount <= 4) return "small";
    if (codeNodeCount <= 16) return "medium";
    return "heavy";
}

function readHeight(element: HTMLElement): number | null {
    const height = element.getBoundingClientRect?.().height ?? null;
    return typeof height === "number" && Number.isFinite(height) ? height : null;
}

function bucketTextLength(length: number): string {
    if (length === 0) return "empty";
    if (length < 512) return "short";
    if (length < 4_096) return "medium";
    return "long";
}
