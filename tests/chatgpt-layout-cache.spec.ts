import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import path from "path";
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

    test("keeps aggregate snapshot values correct across upsert and remove", () => {
        const cache = new ChatGptLayoutCache();
        cache.upsert({ key: "first", heightPx: 100, measuredAtMs: 10 });
        cache.upsert({ key: "latest", heightPx: 200, measuredAtMs: 20 });
        cache.upsert({ key: "first", heightPx: 50, measuredAtMs: 30 });

        expect(cache.snapshot()).toEqual({
            turnCount: 2,
            totalKnownHeightPx: 250,
            newestMeasurementMs: 30,
        });

        cache.remove("first");
        expect(cache.snapshot()).toEqual({
            turnCount: 1,
            totalKnownHeightPx: 200,
            newestMeasurementMs: 20,
        });

        cache.remove("latest");
        expect(cache.snapshot()).toEqual({
            turnCount: 0,
            totalKnownHeightPx: 0,
            newestMeasurementMs: null,
        });
    });

    test("keeps snapshot O(1) by avoiding measurement-map iteration", () => {
        const source = readFileSync(
            path.resolve("src/content/native/chatgpt/ChatGptLayoutCache.ts"),
            "utf8",
        );
        const snapshotStart = source.indexOf("    snapshot(): ChatGptLayoutCacheSnapshot");
        const nextMethodStart = source.indexOf("    private findNewestMeasurementMs", snapshotStart);
        const snapshotSource = source.slice(snapshotStart, nextMethodStart);

        expect(snapshotSource).not.toContain("for (");
        expect(snapshotSource).not.toContain(".values()");
        expect(snapshotSource).toContain("totalKnownHeightPx: this.totalKnownHeightPx");
        expect(snapshotSource).toContain("newestMeasurementMs: this.newestMeasurementMs");
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
