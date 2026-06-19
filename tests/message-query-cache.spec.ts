import { test, expect } from "@playwright/test";
import { MessageQueryCache } from "../src/content/MessageQueryCache";

test("message query cache invalidates by route", () => {
    const cache = new MessageQueryCache();
    expect(cache.snapshot().generation).toBe(0);
    cache.invalidate("/c/1");
    expect(cache.snapshot()).toMatchObject({ routeKey: "/c/1", generation: 1 });
});
