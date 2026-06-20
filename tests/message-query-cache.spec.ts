import { test, expect } from "@playwright/test";
import { MessageQueryCache } from "../src/content/MessageQueryCache";

test("message query cache deduplicates nested ChatGPT turn wrappers", () => {
    const firstOuter = fakeTurn("a");
    const firstInner = fakeTurn("a-inner");
    const secondOuter = fakeTurn("b");
    const secondInner = fakeTurn("b-inner");
    firstOuter.contains = (candidate: Node | null) => candidate === firstInner;
    secondOuter.contains = (candidate: Node | null) => candidate === secondInner;
    const originalDocument = globalThis.document;
    Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: { querySelectorAll: () => [firstOuter, firstInner, secondOuter, secondInner] },
    });

    try {
        const cache = new MessageQueryCache();
        const turns = cache.queryTurns({
            messageTurn: '[data-turn-id-container], section[data-testid^="conversation-turn-"]',
            scrollContainer: "main",
        }, "/c/fixture");

        expect(turns).toEqual([firstOuter, secondOuter]);
    } finally {
        Object.defineProperty(globalThis, "document", { configurable: true, value: originalDocument });
    }
});

function fakeTurn(id: string): HTMLElement {
    return {
        getAttribute: (name: string) => name === "data-turn-id-container" ? id : null,
        closest: () => null,
        contains: () => false,
    } as unknown as HTMLElement;
}

test("message query cache does not pin an empty first scan", () => {
    const firstTurn = fakeTurn("ready");
    let queryCount = 0;
    const originalDocument = globalThis.document;
    Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: { querySelectorAll: () => queryCount++ === 0 ? [] : [firstTurn] },
    });

    try {
        const cache = new MessageQueryCache();
        const selectors = { messageTurn: "article", scrollContainer: "main" };
        expect(cache.queryTurns(selectors, "/c/loading")).toEqual([]);
        expect(cache.queryTurns(selectors, "/c/loading")).toEqual([firstTurn]);
        expect(cache.snapshot().cachedTurnCount).toBe(1);
    } finally {
        Object.defineProperty(globalThis, "document", { configurable: true, value: originalDocument });
    }
});

test("message query cache invalidates by route", () => {
    const cache = new MessageQueryCache();
    expect(cache.snapshot().generation).toBe(0);
    cache.invalidate("/c/1");
    expect(cache.snapshot()).toMatchObject({ routeKey: "/c/1", generation: 1 });
});
