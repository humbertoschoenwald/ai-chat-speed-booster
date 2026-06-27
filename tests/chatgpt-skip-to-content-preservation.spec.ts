import { test, expect } from "@playwright/test";
import {
    getChatGptSkipToContentSelectorsForTests,
    inspectChatGptSkipToContentPreservation,
    isChatGptProtectedAccessibilityNavNode,
} from "../src/content/native/chatgpt/ChatGptSkipToContentPreservation";

test("ChatGPT accessibility navigation selector covers skip and screen-reader surfaces", () => {
    const selectors = getChatGptSkipToContentSelectorsForTests().join(",");

    expect(selectors).toContain("data-skip-to-content");
    expect(selectors).toContain("sr-only");
    expect(selectors).toContain("role='main'");
});

test("ChatGPT accessibility navigation nodes are protected", () => {
    expect(isChatGptProtectedAccessibilityNavNode(navNode(true))).toBe(true);
    expect(isChatGptProtectedAccessibilityNavNode(navNode(false))).toBe(false);
});

test("ChatGPT accessibility navigation diagnostics report target validity", () => {
    expect(inspectChatGptSkipToContentPreservation(rootWith({ skip: 1, srOnly: 2, target: true }))).toEqual({
        skipLinkCount: 1,
        screenReaderOnlyCount: 2,
        targetPresent: true,
    });
});

test("DOM observer preserves ChatGPT accessibility navigation during mode changes", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("src/content/DOMObserver.ts", "utf8"));

    expect(source).toContain("isChatGptProtectedAccessibilityNavNode(el)");
});

function navNode(protectedNode: boolean): HTMLElement {
    return {
        matches: (selector: string) => protectedNode && (selector.includes("skip") || selector.includes("sr-only")),
        closest: (selector: string) => protectedNode && (selector.includes("skip") || selector.includes("sr-only")) ? {} : null,
    } as unknown as HTMLElement;
}

function rootWith(options: { readonly skip: number; readonly srOnly: number; readonly target: boolean }): ParentNode {
    return {
        querySelector: (selector: string) => options.target && selector.includes("main") ? {} : null,
        querySelectorAll: (selector: string) => {
            if (selector.includes("skip")) return Array.from({ length: options.skip }, () => ({}));
            if (selector.includes("sr-only")) return Array.from({ length: options.srOnly }, () => ({}));
            return [];
        },
    } as unknown as ParentNode;
}
