import { test, expect } from "@playwright/test";
import { ChatGptStaticContentMeasurementCache } from "../src/content/native/chatgpt/ChatGptStaticContentMeasurementCache";
import type { NativeTurnRecord } from "../src/content/native/TurnRegistry";

test("ChatGPT static measurement cache reuses unchanged completed turns", () => {
    const cache = new ChatGptStaticContentMeasurementCache();
    const record = recordFor("turn-1", measuredElement({ nodeCount: 12, codeCount: 3, text: "code heavy" }));

    expect(cache.measure([record], [])).toMatchObject({
        entryCount: 1,
        cacheHits: 0,
        measuredTurns: 1,
        estimatedTurnNodeCost: 13,
        codeNodeCount: 3,
    });
    expect(cache.measure([record], [])).toMatchObject({
        entryCount: 1,
        cacheHits: 1,
        measuredTurns: 0,
        estimatedTurnNodeCost: 13,
        codeNodeCount: 3,
    });
});

test("ChatGPT static measurement cache invalidates only dirty turns", () => {
    const cache = new ChatGptStaticContentMeasurementCache();
    const first = recordFor("turn-1", measuredElement({ nodeCount: 2, codeCount: 0, text: "normal" }));
    const second = recordFor("turn-2", measuredElement({ nodeCount: 4, codeCount: 1, text: "code" }));

    cache.measure([first, second], []);
    expect(cache.measure([first, second], ["turn-2"])).toMatchObject({
        entryCount: 2,
        cacheHits: 1,
        measuredTurns: 1,
        estimatedTurnNodeCost: 8,
        codeNodeCount: 1,
    });
});

function recordFor(key: string, element: HTMLElement): NativeTurnRecord {
    return {
        key,
        element,
        role: "assistant",
        hydrationState: "hydrated",
        measuredHeight: null,
        pinReasons: new Set(),
        lastMeasuredAt: null,
    };
}

function measuredElement(options: {
    readonly nodeCount: number;
    readonly codeCount: number;
    readonly text: string;
    readonly interactive?: boolean;
}): HTMLElement {
    return {
        innerText: options.text,
        textContent: options.text,
        querySelectorAll: (selector: string) => {
            if (selector.includes("pre") || selector.includes("code")) return Array.from({ length: options.codeCount }, () => ({}));
            if (selector === "*") return Array.from({ length: options.nodeCount }, () => ({}));
            return [];
        },
        querySelector: (selector: string) => options.interactive && selector.includes("button") ? {} : null,
        getBoundingClientRect: () => ({ height: 320 }),
    } as unknown as HTMLElement;
}

test("ChatGPT static measurement cache buckets code-heavy turns", () => {
    const cache = new ChatGptStaticContentMeasurementCache();
    const none = recordFor("none", measuredElement({ nodeCount: 1, codeCount: 0, text: "plain" }));
    const small = recordFor("small", measuredElement({ nodeCount: 6, codeCount: 3, text: "small code" }));
    const heavy = recordFor("heavy", measuredElement({ nodeCount: 40, codeCount: 28, text: "heavy code" }));
    const snapshot = cache.measure([none, small, heavy], []);

    expect(snapshot.codeBucketCounts).toEqual({ none: 1, small: 1, medium: 0, heavy: 1 });
    expect(snapshot.heavyCodeTurnCount).toBe(1);
    expect(snapshot.codeBucketByTurnKey.get("none")).toBe("none");
    expect(snapshot.codeBucketByTurnKey.get("small")).toBe("small");
    expect(snapshot.codeBucketByTurnKey.get("heavy")).toBe("heavy");
});
