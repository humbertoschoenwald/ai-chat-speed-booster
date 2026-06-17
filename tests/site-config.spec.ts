import { test, expect } from "@playwright/test";
import { SITES } from "../src/shared/sites";

test("search ai site config is guarded by required query parameter (#23)", () => {
    const site = SITES.find((candidate) => candidate.id === "search-ai-mode");

    expect(site).toBeDefined();
    expect(site?.hostnames).toEqual(["www.google.com"]);
    expect(site?.urlPatterns).toEqual(["*://www.google.com/search*"]);
    expect(site?.requiredSearchParams).toEqual([
        { name: "udm", values: ["50"] },
    ]);
    expect(site?.selectors.messageTurn).toBe('div[data-xid^="aim-mars-turn-root"] > div[data-asrc="true"]');
    expect(site?.selectors.scrollContainer).toBe("body");
    expect(site?.fetchIntercept).toBeUndefined();
});


test("deepseek site config uses virtual-list roots without fetch trimming (#14)", () => {
    const site = SITES.find((candidate) => candidate.id === "deepseek");

    expect(site).toBeDefined();
    expect(site?.selectors.messageTurn).toBe(".ds-virtual-list-visible-items > [data-virtual-list-item-key]");
    expect(site?.selectors.scrollContainer).toBe(".ds-virtual-list.ds-scroll-area");
    expect(site?.messageIdAttribute).toBe("data-virtual-list-item-key");
    expect(site?.fetchIntercept).toBeUndefined();
});


test("grok site config uses scoped response roots without fetch trimming (#12)", () => {
    const site = SITES.find((candidate) => candidate.id === "grok");

    expect(site).toBeDefined();
    expect(site?.hostnames).toEqual(["grok.com"]);
    expect(site?.urlPatterns).toEqual(["*://grok.com/*"]);
    expect(site?.selectors.messageTurn).toBe('[data-testid="drop-ui"] div[id^="response-"]');
    expect(site?.selectors.scrollContainer).toBe('[data-testid="drop-ui"] main > div > div.overflow-y-auto');
    expect(site?.messageIdAttribute).toBe("id");
    expect(site?.fetchIntercept).toBeUndefined();
});
