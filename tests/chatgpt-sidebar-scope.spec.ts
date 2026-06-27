import { test, expect } from "@playwright/test";
import {
    getChatGptSidebarListSelectorForTests,
    isChatGptSidebarListNode,
} from "../src/content/native/chatgpt/ChatGptSidebarScope";

test("ChatGPT sidebar list scope detects sidebar and history nodes", () => {
    expect(isChatGptSidebarListNode(sidebarNode(true))).toBe(true);
    expect(isChatGptSidebarListNode(sidebarNode(false))).toBe(false);
    expect(getChatGptSidebarListSelectorForTests()).toContain("sidebar");
    expect(getChatGptSidebarListSelectorForTests()).toContain("history");
});

test("DOM observer routes ChatGPT sidebar list changes outside conversation scans", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("src/content/DOMObserver.ts", "utf8"));

    expect(source).toContain("isChatGptSidebarListNode(el)");
    expect(source).toContain("isChatGptSidebarListNode(root) ? null : root");
});

function sidebarNode(sidebar: boolean): HTMLElement {
    return {
        matches: (selector: string) => sidebar && selector.includes("sidebar"),
        closest: (selector: string) => sidebar && selector.includes("sidebar") ? {} : null,
    } as unknown as HTMLElement;
}
