export type ChatGptSegmentMarkerStatus = "stable-hit" | "changed" | "missing";

export interface ChatGptSegmentMarkerReadResult {
    readonly text: string;
    readonly status: ChatGptSegmentMarkerStatus;
}

export interface ChatGptSegmentMarkerDeltaCacheSnapshot {
    readonly entryCount: number;
    readonly stableHits: number;
    readonly changedMarkers: number;
    readonly missingMarkerTurns: number;
}

interface SegmentMarkerCacheEntry {
    readonly signature: string;
    readonly text: string;
}

const SEGMENT_MARKER_SELECTOR = "[data-start],[data-end]";

export class ChatGptSegmentMarkerDeltaCache {
    private readonly entries = new Map<string, SegmentMarkerCacheEntry>();
    private stableHits = 0;
    private changedMarkers = 0;
    private missingMarkerTurns = 0;

    clear(): void {
        this.entries.clear();
        this.stableHits = 0;
        this.changedMarkers = 0;
        this.missingMarkerTurns = 0;
    }

    readOrExtract(key: string, turn: HTMLElement, extractText: () => string): ChatGptSegmentMarkerReadResult {
        const signature = readSegmentMarkerSignature(turn);
        if (!signature) {
            this.missingMarkerTurns += 1;
            return { text: extractText(), status: "missing" };
        }

        const existing = this.entries.get(key);
        if (existing?.signature === signature) {
            this.stableHits += 1;
            return { text: existing.text, status: "stable-hit" };
        }

        const text = extractText();
        this.entries.set(key, { signature, text });
        this.changedMarkers += 1;
        return { text, status: "changed" };
    }

    delete(key: string): void {
        this.entries.delete(key);
    }

    snapshot(): ChatGptSegmentMarkerDeltaCacheSnapshot {
        return {
            entryCount: this.entries.size,
            stableHits: this.stableHits,
            changedMarkers: this.changedMarkers,
            missingMarkerTurns: this.missingMarkerTurns,
        };
    }
}

export function readSegmentMarkerSignature(turn: HTMLElement): string | null {
    const markers = Array.from(turn.querySelectorAll<HTMLElement>(SEGMENT_MARKER_SELECTOR));
    if (markers.length === 0) return null;
    const first = markers[0];
    const last = markers[markers.length - 1];
    const firstStart = first.getAttribute("data-start") ?? "";
    const firstEnd = first.getAttribute("data-end") ?? "";
    const lastStart = last.getAttribute("data-start") ?? "";
    const lastEnd = last.getAttribute("data-end") ?? "";
    return [markers.length, firstStart, firstEnd, lastStart, lastEnd].join(":");
}
