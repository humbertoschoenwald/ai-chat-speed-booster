import { test, expect } from "@playwright/test";
import { ChatGptLayoutCache } from "../src/content/native/chatgpt/ChatGptLayoutCache";

test.describe("ChatGPT layout cache", () => {
    test("builds a full scroll plan from safe metadata", () => {
        const cache = new ChatGptLayoutCache();
        cache.upsert({ key: "first", heightPx: 100.4, measuredAtMs: 10 });
        cache.upsert({ key: "latest", heightPx: 200.2, measuredAtMs: 20 });

        const plan = cache.createPlan(["first", "latest"], {
            scrollTopPx: 0,
            viewportHeightPx: 80,
            overscanPx: 0,
        });

        expect(plan.totalHeightPx).toBe(300);
        expect(plan.records.map((record) => record.key)).toEqual(["first", "latest"]);
        expect(cache.snapshot()).toEqual({
            turnCount: 2,
            totalKnownHeightPx: 300,
            newestMeasurementMs: 20,
        });
    });

    test("ignores unknown order keys and invalid measurements", () => {
        const cache = new ChatGptLayoutCache();
        cache.upsert({ key: "", heightPx: 100, measuredAtMs: 1 });
        cache.upsert({ key: "valid", heightPx: Number.NaN, measuredAtMs: 2 });
        cache.upsert({ key: "valid", heightPx: 0, measuredAtMs: 3 });

        const plan = cache.createPlan(["missing", "valid"], {
            scrollTopPx: 0,
            viewportHeightPx: 10,
            overscanPx: 0,
        });

        expect(plan.records).toEqual([
            { key: "valid", topPx: 0, heightPx: 1, bottomPx: 1, pinned: false },
        ]);
    });
});
