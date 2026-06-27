import { test, expect } from "@playwright/test";
import {
    getChatGptComposerLayoutBoundarySelectorsForTests,
    inspectChatGptComposerLayoutBoundary,
    isChatGptComposerLayoutBoundary,
} from "../src/content/native/chatgpt/ChatGptComposerLayoutBoundary";

test("ChatGPT composer layout boundary detects expanded composer nodes", () => {
    const expanded = layoutNode({ boundary: true, expanded: true });
    const normal = layoutNode({ boundary: false });

    expect(isChatGptComposerLayoutBoundary(expanded)).toBe(true);
    expect(isChatGptComposerLayoutBoundary(normal)).toBe(false);
    expect(inspectChatGptComposerLayoutBoundary(rootWith([expanded, normal]))).toMatchObject({
        boundaryNodeCount: 1,
        expandedNodeCount: 1,
    });
});

test("ChatGPT composer layout boundary detects prompt header metadata", () => {
    const header = layoutNode({ header: true });

    expect(inspectChatGptComposerLayoutBoundary(rootWith([header]))).toMatchObject({
        headerNodeCount: 1,
    });
    expect(getChatGptComposerLayoutBoundarySelectorsForTests().join(",")).toContain("prompt");
});

test("DOM observer ignores ChatGPT composer layout mutations", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("src/content/DOMObserver.ts", "utf8"));

    expect(source).toContain("isChatGptComposerLayoutBoundary(el)");
});

function layoutNode(options: { readonly boundary?: boolean; readonly expanded?: boolean; readonly header?: boolean }): HTMLElement {
    return {
        matches: (selector: string) => Boolean(
            (options.boundary && selector.includes("composer"))
            || (options.expanded && selector.includes("expanded"))
            || (options.header && selector.includes("prompt")),
        ),
        closest: (selector: string) => options.boundary && selector.includes("composer") ? {} : null,
        querySelectorAll: () => [],
    } as unknown as HTMLElement;
}

function rootWith(nodes: readonly HTMLElement[]): ParentNode {
    return {
        querySelectorAll: (selector: string) => nodes.filter((node) => node.matches(selector)),
    } as unknown as ParentNode;
}
