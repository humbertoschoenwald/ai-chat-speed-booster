import { test, expect } from "@playwright/test";
import {
    ChatGptTextSnapshotCache,
    renderChatGptTextSnapshot,
} from "../src/content/native/chatgpt/ChatGptTextSnapshotCache";

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
        expect(renderChatGptTextSnapshot(snapshot!)).toBe(
            `<div data-acsb-native-snapshot="true">&lt;hello&gt;&amp;&quot;&#39;</div>`,
        );
    });
});
