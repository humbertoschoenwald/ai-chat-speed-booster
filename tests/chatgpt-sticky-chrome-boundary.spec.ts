import { test, expect } from "@playwright/test";
import {
    getChatGptStickyChromeSelectorForTests,
    inspectChatGptStickyChromeBoundary,
    isChatGptStickyChromeNode,
} from "../src/content/native/chatgpt/ChatGptStickyChromeBoundary";

test("ChatGPT sticky chrome boundary detects fixed and sticky chrome", () => {
    expect(isChatGptStickyChromeNode(chromeNode("sticky"))).toBe(true);
    expect(isChatGptStickyChromeNode(chromeNode("fixed"))).toBe(true);
    expect(isChatGptStickyChromeNode(chromeNode("turn"))).toBe(false);
    expect(getChatGptStickyChromeSelectorForTests()).toContain("position: sticky");
});

test("ChatGPT sticky chrome diagnostics count chrome separately", () => {
    const snapshot = inspectChatGptStickyChromeBoundary(rootFor({ sticky: 2, fixed: 1, header: 1 }));

    expect(snapshot).toEqual({
        stickyNodeCount: 2,
        fixedNodeCount: 1,
        headerNodeCount: 1,
    });
});

test("DOM observer ignores sticky chrome for Native conversation work", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("src/content/DOMObserver.ts", "utf8"));

    expect(source).toContain("isChatGptStickyChromeNode(el)");
});

function chromeNode(kind: "sticky" | "fixed" | "turn"): HTMLElement {
    return {
        matches: (selector: string) => kind !== "turn" && selector.includes(kind === "sticky" ? "sticky" : "fixed"),
        closest: (selector: string) => kind !== "turn" && selector.includes(kind === "sticky" ? "sticky" : "fixed") ? {} : null,
    } as unknown as HTMLElement;
}

function rootFor(counts: { readonly sticky: number; readonly fixed: number; readonly header: number }): ParentNode {
    return {
        querySelectorAll: (selector: string) => {
            if (selector.includes("sticky")) return Array.from({ length: counts.sticky }, () => ({}));
            if (selector.includes("fixed")) return Array.from({ length: counts.fixed }, () => ({}));
            if (selector.includes("header")) return Array.from({ length: counts.header }, () => ({}));
            return [];
        },
    } as unknown as ParentNode;
}
