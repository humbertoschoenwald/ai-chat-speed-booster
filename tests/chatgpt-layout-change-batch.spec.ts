import { test, expect } from "@playwright/test";
import { ChatGptLayoutChangeBatch } from "../src/content/native/chatgpt/ChatGptLayoutChangeBatch";
import type { NativeTurnRecord, TurnRegistry } from "../src/content/native/TurnRegistry";

test("ChatGPT layout change batch waits for a stable frame window", () => {
    const batch = new ChatGptLayoutChangeBatch();
    const registry = measuringRegistry();
    const records = [recordFor("old"), recordFor("near")];

    batch.markDirty("viewport-resize", 1_000);
    batch.markDirty("composer-resize", 1_020);

    expect(batch.consume(records, 1, registry, 1_030)).toMatchObject({
        pending: true,
        changeCount: 2,
        measuredTurnCount: 0,
        protectedTailSize: 1,
        lastReason: "composer-resize",
    });
    expect(registry.measuredKeys).toEqual([]);
});

test("ChatGPT layout change batch remeasures only near-visible turns", () => {
    const batch = new ChatGptLayoutChangeBatch();
    const registry = measuringRegistry();
    const oldCached = recordFor("old-cached", 220);
    const oldUncached = recordFor("old-uncached");
    const visible = recordFor("visible");
    const near = recordFor("near");

    batch.markDirty("viewport-resize", 2_000);
    const snapshot = batch.consume([oldCached, oldUncached, visible, near], 2, registry, 2_100);

    expect(snapshot).toEqual({
        pending: false,
        changeCount: 1,
        measuredTurnCount: 2,
        skippedCachedOldTurnCount: 1,
        protectedTailSize: 2,
        lastReason: "viewport-resize",
    });
    expect(registry.measuredKeys).toEqual(["visible", "near"]);
});

test("ChatGPT viewport resize routes through Native layout batching", async () => {
    const indexSource = await import("node:fs/promises").then((fs) => fs.readFile("src/content/index.ts", "utf8"));
    const runtimeSource = await import("node:fs/promises").then((fs) =>
        fs.readFile("src/content/native/chatgpt/ChatGptContentRuntime.ts", "utf8"),
    );

    expect(indexSource).toContain("scheduleNativeLayoutWork(nativeModeController");
    expect(runtimeSource).toContain("layoutChangeBatch.consume");
    expect(runtimeSource).toContain("this.scheduleNativeScrollWork(controller)");
});

function recordFor(key: string, measuredHeight: number | null = null): NativeTurnRecord {
    return {
        key,
        element: {} as HTMLElement,
        role: "assistant",
        hydrationState: "hydrated",
        measuredHeight,
        pinReasons: new Set(),
        lastMeasuredAt: null,
    };
}

function measuringRegistry(): Pick<TurnRegistry, "measure"> & { readonly measuredKeys: string[] } {
    const measuredKeys: string[] = [];
    return {
        measuredKeys,
        measure: (record: NativeTurnRecord, now = Date.now()) => {
            measuredKeys.push(record.key);
            record.measuredHeight = 100;
            record.lastMeasuredAt = now;
            return 100;
        },
    };
}
