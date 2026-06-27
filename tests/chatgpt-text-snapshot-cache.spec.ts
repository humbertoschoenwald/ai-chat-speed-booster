import { test, expect } from "@playwright/test";
import {
    ChatGptTextSnapshotCache,
    renderChatGptTextSnapshot,
} from "../src/content/native/chatgpt/ChatGptTextSnapshotCache";
import { estimateChatGptPromptTokens } from "../src/content/native/chatgpt/ChatGptTokenEstimator";

test.describe("ChatGPT text snapshot cache", () => {
    test("keeps small snapshots inside a bounded in-memory budget", () => {
        const cache = new ChatGptTextSnapshotCache({ maxBytes: 10, maxEntryBytes: 10, ttlMs: 100 });

        cache.put("a", "12345", 0);
        cache.put("b", "12345", 1);
        cache.put("c", "12345", 2);

        expect(cache.snapshot()).toEqual({ entryCount: 2, totalBytes: 10, maxBytes: 10 });
        expect(cache.get("a", 2)).toBeNull();
        expect(cache.get("b", 2)?.text).toBe("12345");
        expect(cache.get("c", 2)?.text).toBe("12345");
    });

    test("keeps snapshot version stable when text hash is unchanged", () => {
        const cache = new ChatGptTextSnapshotCache({ maxBytes: 100, maxEntryBytes: 100, ttlMs: 100 });

        cache.put("same", "stable text", 0);
        const first = cache.get("same", 1)!;
        cache.put("same", "stable text", 2);
        const second = cache.get("same", 3)!;
        cache.put("same", "changed text", 4);
        const third = cache.get("same", 5)!;

        expect(second.snapshotVersion).toBe(first.snapshotVersion);
        expect(second.textHash).toBe(first.textHash);
        expect(third.snapshotVersion).toBe(first.snapshotVersion + 1);
        expect(third.textHash).not.toBe(first.textHash);
    });

    test("expires snapshots and rejects oversized entries", () => {
        const cache = new ChatGptTextSnapshotCache({ maxBytes: 20, maxEntryBytes: 5, ttlMs: 10 });

        cache.put("big", "123456", 0);
        cache.put("ok", "12345", 0);

        expect(cache.get("big", 0)).toBeNull();
        expect(cache.get("ok", 11)).toBeNull();
        expect(cache.snapshot()).toEqual({ entryCount: 0, totalBytes: 0, maxBytes: 20 });
    });

    test("renders escaped text-only snapshot markup", () => {
        const cache = new ChatGptTextSnapshotCache({ maxBytes: 100, maxEntryBytes: 100, ttlMs: 100 });
        cache.put("safe", `<hello>&"'`, 0);
        const snapshot = cache.get("safe", 1);

        expect(snapshot).not.toBeNull();
        const markup = renderChatGptTextSnapshot(snapshot!);

        expect(markup).toContain(`data-acsb-native-snapshot="true"`);
        expect(markup).toContain(`data-acsb-native-accessibility-layer="snapshot"`);
        expect(markup).toContain(`data-acsb-native-pointer-policy="restore-only"`);
        expect(markup).toContain(`tabindex="-1"`);
        expect(markup).toContain("&lt;hello&gt;");
    });

    test("can render a static copy affordance without changing text", () => {
        const cache = new ChatGptTextSnapshotCache({ maxBytes: 100, maxEntryBytes: 100, ttlMs: 100 });
        cache.put("copy", "copyable text", 0);
        const snapshot = cache.get("copy", 1);

        expect(snapshot).not.toBeNull();
        const markup = renderChatGptTextSnapshot(snapshot!, { copyAvailable: true });

        expect(markup).toContain(`data-acsb-native-accessibility-layer="snapshot"`);
        expect(markup).toContain(`data-acsb-native-pointer-policy="restore-only"`);
        expect(markup).toContain(`tabindex="-1"`);
        expect(markup).toContain(`data-acsb-native-copy-affordance="true" aria-hidden="true"`);
    });
});


test("ChatGPT prompt token estimator warns near configured limit", () => {
    const small = estimateChatGptPromptTokens("hello world", 100);
    const nearLimit = estimateChatGptPromptTokens("word ".repeat(80), 100);

    expect(small.warningLevel).toBe("ok");
    expect(nearLimit.approxTokens).toBeGreaterThanOrEqual(80);
    expect(nearLimit.warningLevel).toBe("critical");
});
