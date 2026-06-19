export interface ChatGptTextSnapshot {
    readonly key: string;
    readonly text: string;
    readonly bytes: number;
    readonly textHash: string;
    readonly textLength: number;
    readonly snapshotVersion: number;
    readonly createdAtMs: number;
    readonly lastAccessedMs: number;
}

export interface ChatGptTextSnapshotCacheOptions {
    readonly maxBytes: number;
    readonly maxEntryBytes: number;
    readonly ttlMs: number;
}

export interface ChatGptTextSnapshotCacheSnapshot {
    readonly entryCount: number;
    readonly totalBytes: number;
    readonly maxBytes: number;
}

const DEFAULT_OPTIONS: ChatGptTextSnapshotCacheOptions = {
    maxBytes: 8 * 1024 * 1024,
    maxEntryBytes: 256 * 1024,
    ttlMs: 2 * 60 * 60 * 1000,
};

export class ChatGptTextSnapshotCache {
    private readonly entries = new Map<string, ChatGptTextSnapshot>();
    private totalBytes = 0;

    constructor(private readonly options: ChatGptTextSnapshotCacheOptions = DEFAULT_OPTIONS) {}

    put(key: string, text: string, nowMs: number): void {
        if (!key || !text) return;
        const bytes = measureUtf8Bytes(text);
        if (bytes > this.options.maxEntryBytes || bytes > this.options.maxBytes) return;
        const textHash = hashText(text);
        const existing = this.entries.get(key);
        if (existing?.textHash === textHash && existing.textLength === text.length) {
            this.entries.set(key, { ...existing, lastAccessedMs: nowMs });
            return;
        }

        this.delete(key);
        this.entries.set(key, {
            key,
            text,
            bytes,
            textHash,
            textLength: text.length,
            snapshotVersion: (existing?.snapshotVersion ?? 0) + 1,
            createdAtMs: nowMs,
            lastAccessedMs: nowMs,
        });
        this.totalBytes += bytes;
        this.evictExpired(nowMs);
        this.evictToBudget();
    }

    get(key: string, nowMs: number): ChatGptTextSnapshot | null {
        const entry = this.entries.get(key);
        if (!entry) return null;
        if (nowMs - entry.createdAtMs > this.options.ttlMs) {
            this.delete(key);
            return null;
        }
        const updated = { ...entry, lastAccessedMs: nowMs };
        this.entries.set(key, updated);
        return updated;
    }

    delete(key: string): void {
        const entry = this.entries.get(key);
        if (!entry) return;
        this.entries.delete(key);
        this.totalBytes -= entry.bytes;
    }

    clear(): void {
        this.entries.clear();
        this.totalBytes = 0;
    }

    snapshot(): ChatGptTextSnapshotCacheSnapshot {
        return {
            entryCount: this.entries.size,
            totalBytes: this.totalBytes,
            maxBytes: this.options.maxBytes,
        };
    }

    private evictExpired(nowMs: number): void {
        for (const entry of this.entries.values()) {
            if (nowMs - entry.createdAtMs > this.options.ttlMs) this.delete(entry.key);
        }
    }

    private evictToBudget(): void {
        while (this.totalBytes > this.options.maxBytes) {
            const oldest = [...this.entries.values()].sort((a, b) => a.lastAccessedMs - b.lastAccessedMs)[0];
            if (!oldest) return;
            this.delete(oldest.key);
        }
    }
}

export function renderChatGptTextSnapshot(snapshot: ChatGptTextSnapshot): string {
    return `<div data-acsb-native-snapshot="true">${escapeText(snapshot.text)}</div>`;
}

function measureUtf8Bytes(value: string): number {
    return new TextEncoder().encode(value).length;
}

function hashText(value: string): string {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index++) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16);
}

function escapeText(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
