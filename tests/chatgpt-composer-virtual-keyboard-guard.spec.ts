import { test, expect } from "@playwright/test";
import {
    containsChatGptComposerScope,
    createChatGptComposerScopeSnapshot,
    isInChatGptComposerScope,
} from "../src/content/native/chatgpt/ChatGptComposerScope";

test("ChatGPT composer guard protects virtual keyboard textarea nodes", () => {
    const textarea = composerNode("textarea", true);

    expect(isInChatGptComposerScope(textarea)).toBe(true);
    expect(containsChatGptComposerScope(rootWith([textarea]))).toBe(true);
});

test("ChatGPT composer guard protects virtual keyboard ProseMirror nodes", () => {
    const proseMirror = composerNode("prosemirror", true);

    expect(isInChatGptComposerScope(proseMirror)).toBe(true);
    expect(createChatGptComposerScopeSnapshot(rootWith([proseMirror]))).toMatchObject({
        composerEditableNodes: 1,
    });
});

test("DOM observer treats virtual keyboard mutations as composer-owned", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("src/content/DOMObserver.ts", "utf8"));

    expect(source).toContain("data-virtualkeyboard");
    expect(source).toContain("isComposerOwned");
});

function composerNode(kind: "textarea" | "prosemirror", virtualKeyboard: boolean): HTMLElement {
    return {
        matches: (selector: string) => Boolean(
            (kind === "textarea" && selector.includes("textarea"))
            || (kind === "prosemirror" && selector.includes("ProseMirror"))
            || (virtualKeyboard && selector.includes("data-virtualkeyboard")),
        ),
        closest: () => null,
        querySelector: () => null,
        querySelectorAll: () => [],
    } as unknown as HTMLElement;
}

function rootWith(nodes: readonly HTMLElement[]): HTMLElement {
    return {
        matches: () => false,
        closest: () => null,
        querySelector: (selector: string) => nodes.find((node) => node.matches(selector)) ?? null,
        querySelectorAll: (selector: string) => nodes.filter((node) => node.matches(selector)),
    } as unknown as HTMLElement;
}
