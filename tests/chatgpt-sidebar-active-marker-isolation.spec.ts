import { test, expect } from "@playwright/test";
import {
    getChatGptSidebarActiveMarkerSelectorForTests,
    inspectChatGptSidebarActiveMarkers,
    isChatGptSidebarListNode,
} from "../src/content/native/chatgpt/ChatGptSidebarScope";

test("ChatGPT sidebar active markers are reported only in sidebar diagnostics", () => {
    const sidebarActive = activeNode(true, true);
    const turnActive = activeNode(false, true);

    expect(inspectChatGptSidebarActiveMarkers(rootWith([sidebarActive, turnActive]))).toEqual({
        activeSidebarLinkCount: 1,
        activeMarkerCount: 1,
    });
    expect(getChatGptSidebarActiveMarkerSelectorForTests()).toContain("data-active");
});

test("ChatGPT sidebar active node remains a sidebar node, not a turn signal", () => {
    expect(isChatGptSidebarListNode(activeNode(true, true))).toBe(true);
    expect(isChatGptSidebarListNode(activeNode(false, true))).toBe(false);
});

test("ChatGPT turn scheduling code does not read data-active", async () => {
    const fs = await import("node:fs/promises");
    const turnStateSource = await fs.readFile("src/content/native/chatgpt/ChatGptTurnContentState.ts", "utf8");
    const runtimeSource = await fs.readFile("src/content/native/chatgpt/ChatGptContentRuntime.ts", "utf8");

    expect(turnStateSource).not.toContain("data-active");
    expect(runtimeSource).not.toContain("data-active");
});

function activeNode(sidebar: boolean, active: boolean): HTMLElement {
    return {
        matches: (selector: string) => Boolean(
            (active && selector.includes("data-active"))
            || selector.includes("role='link'"),
        ),
        closest: (selector: string) => sidebar && selector.includes("navigation") ? {} : null,
    } as unknown as HTMLElement;
}

function rootWith(nodes: readonly HTMLElement[]): ParentNode {
    return {
        querySelectorAll: (selector: string) => nodes.filter((node) => node.matches(selector)),
    } as unknown as ParentNode;
}
