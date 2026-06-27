import { test, expect } from "@playwright/test";
import {
    getChatGptToastPortalSelectorForTests,
    inspectChatGptToastPortalBoundary,
    isChatGptToastPortalNode,
} from "../src/content/native/chatgpt/ChatGptToastPortalBoundary";

test("ChatGPT toast portal boundary excludes global portal nodes from turn work", () => {
    expect(isChatGptToastPortalNode(fakeBoundaryNode({ toast: true }))).toBe(true);
    expect(isChatGptToastPortalNode(fakeBoundaryNode({ portal: true }))).toBe(true);
    expect(isChatGptToastPortalNode(fakeBoundaryNode({ toast: true, insideTurn: true }))).toBe(false);
});

test("ChatGPT toast portal boundary separates global status from conversation status", () => {
    const globalStatus = fakeBoundaryNode({ live: true });
    const conversationStatus = fakeBoundaryNode({ live: true, insideTurn: true });
    const snapshot = inspectChatGptToastPortalBoundary(fakeRoot({
        portals: [fakeBoundaryNode({ portal: true })],
        toasts: [fakeBoundaryNode({ toast: true })],
        liveStatuses: [globalStatus, conversationStatus],
    }));

    expect(snapshot).toEqual({
        portalNodeCount: 1,
        toastNodeCount: 1,
        liveStatusNodeCount: 1,
        conversationOwnedStatusCount: 1,
    });
});

test("ChatGPT toast portal boundary is wired into mutation filtering", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("src/content/DOMObserver.ts", "utf8"));

    expect(getChatGptToastPortalSelectorForTests()).toContain("aria-live");
    expect(source).toContain("isChatGptToastPortalNode(el)");
});

function fakeBoundaryNode(options: {
    readonly toast?: boolean;
    readonly portal?: boolean;
    readonly live?: boolean;
    readonly insideTurn?: boolean;
}): HTMLElement {
    return {
        matches: (selector: string) => Boolean(
            (options.toast && selector.includes("toast"))
            || (options.portal && selector.includes("portal"))
            || (options.live && selector.includes("aria-live")),
        ),
        closest: (selector: string) => {
            if (options.insideTurn && selector.includes("conversation-turn")) return {};
            if (options.portal && selector.includes("portal")) return {};
            if (options.toast && selector.includes("toast")) return {};
            return null;
        },
    } as unknown as HTMLElement;
}

function fakeRoot(options: {
    readonly portals: readonly HTMLElement[];
    readonly toasts: readonly HTMLElement[];
    readonly liveStatuses: readonly HTMLElement[];
}): ParentNode {
    return {
        querySelectorAll: (selector: string) => {
            if (selector.includes("portal")) return options.portals;
            if (selector.includes("toast")) return options.toasts;
            if (selector.includes("aria-live")) return options.liveStatuses;
            return [];
        },
    } as unknown as ParentNode;
}
