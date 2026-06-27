import { test, expect } from "@playwright/test";
import {
    CHATGPT_ACCESSIBLE_STATUS_SELECTOR,
    containsChatGptAccessibleStatus,
    inspectChatGptAccessibleStatusPreservation,
    isChatGptAccessibleStatusNode,
} from "../src/content/native/chatgpt/ChatGptAccessibleStatusPreservation";
import { classifyChatGptTurnContentState } from "../src/content/native/chatgpt/ChatGptTurnContentState";

test("ChatGPT accessible status selector detects live regions", () => {
    expect(CHATGPT_ACCESSIBLE_STATUS_SELECTOR).toContain("aria-live");
    expect(isChatGptAccessibleStatusNode(statusNode())).toBe(true);
    expect(containsChatGptAccessibleStatus(rootWith([statusNode()]))).toBe(true);
});

test("ChatGPT accessible status diagnostics split turn and global regions", () => {
    const snapshot = inspectChatGptAccessibleStatusPreservation(rootWith([
        statusNode(),
        statusNode(true),
    ]));

    expect(snapshot).toEqual({
        statusNodeCount: 2,
        turnScopedStatusNodeCount: 1,
        globalStatusNodeCount: 1,
    });
});

test("ChatGPT turn content state treats accessible status as status content", () => {
    expect(classifyChatGptTurnContentState(turnWithStatus())).toBe("status");
});

test("ChatGPT Native text snapshots preserve status instead of duplicating it", async () => {
    const source = await import("node:fs/promises").then((fs) =>
        fs.readFile("src/content/native/chatgpt/ChatGptTextSnapshotRenderer.ts", "utf8"),
    );

    expect(source).toContain("CHATGPT_ACCESSIBLE_STATUS_SELECTOR");
    expect(source).toContain("containsChatGptAccessibleStatus(turn)");
});

function statusNode(insideTurn = false): HTMLElement {
    return {
        matches: (selector: string) => selector.includes("aria-live") || selector.includes("role='status'"),
        closest: (selector: string) => insideTurn && selector.includes("conversation-turn") ? {} : null,
        querySelector: () => null,
    } as unknown as HTMLElement;
}

function rootWith(nodes: readonly HTMLElement[]): ParentNode {
    return {
        querySelector: () => nodes[0] ?? null,
        querySelectorAll: () => nodes,
    } as unknown as ParentNode;
}

function turnWithStatus(): HTMLElement {
    return {
        innerText: "Working",
        textContent: "Working",
        querySelector: (selector: string) => selector.includes("aria-live") ? statusNode(true) : null,
    } as unknown as HTMLElement;
}
