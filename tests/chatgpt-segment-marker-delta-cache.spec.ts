import { test, expect } from "@playwright/test";
import {
    ChatGptSegmentMarkerDeltaCache,
    readSegmentMarkerSignature,
} from "../src/content/native/chatgpt/ChatGptSegmentMarkerDeltaCache";

test("ChatGPT segment marker cache reuses stable marker text", () => {
    const cache = new ChatGptSegmentMarkerDeltaCache();
    const turn = markerTurn([
        { start: "0", end: "4" },
        { start: "5", end: "9" },
    ]);
    let extractionCount = 0;
    const extract = () => {
        extractionCount += 1;
        return "cached text";
    };

    expect(cache.readOrExtract("m1", turn, extract)).toEqual({ text: "cached text", status: "changed" });
    expect(cache.readOrExtract("m1", turn, extract)).toEqual({ text: "cached text", status: "stable-hit" });
    expect(extractionCount).toBe(1);
    expect(cache.snapshot()).toMatchObject({ entryCount: 1, stableHits: 1, changedMarkers: 1 });
});

test("ChatGPT segment marker cache invalidates changed markers", () => {
    const cache = new ChatGptSegmentMarkerDeltaCache();
    let text = "first";
    cache.readOrExtract("m1", markerTurn([{ start: "0", end: "1" }]), () => text);
    text = "second";

    expect(cache.readOrExtract("m1", markerTurn([{ start: "0", end: "2" }]), () => text)).toEqual({
        text: "second",
        status: "changed",
    });
});

test("ChatGPT segment marker cache falls back when markers are missing", () => {
    const cache = new ChatGptSegmentMarkerDeltaCache();

    expect(readSegmentMarkerSignature(markerTurn([]))).toBeNull();
    expect(cache.readOrExtract("m1", markerTurn([]), () => "fallback text")).toEqual({
        text: "fallback text",
        status: "missing",
    });
    expect(cache.snapshot()).toMatchObject({ entryCount: 0, missingMarkerTurns: 1 });
});

function markerTurn(markers: readonly { readonly start: string; readonly end: string }[]): HTMLElement {
    return {
        querySelectorAll: () => markers.map((marker) => ({
            getAttribute: (name: string) => {
                if (name === "data-start") return marker.start;
                if (name === "data-end") return marker.end;
                return null;
            },
        })),
    } as unknown as HTMLElement;
}
