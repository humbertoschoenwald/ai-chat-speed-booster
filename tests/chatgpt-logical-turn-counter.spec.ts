import { test, expect } from "@playwright/test";
import { createChatGptLogicalDisplayStatus } from "../src/content/native/chatgpt/ChatGptLogicalTurnCounter";
import type { ExtensionStatus } from "../src/shared/types";

const baseStatus: ExtensionStatus = {
    enabled: true,
    totalMessages: 2,
    visibleMessages: 2,
    hiddenMessages: 0,
    showStatus: true,
    statusPosition: "top-right",
};

test("ChatGPT display counts collapse one user turn and one assistant turn into one conversation turn", () => {
    const status = createChatGptLogicalDisplayStatus([
        chatGptTurn(["user"]),
        chatGptTurn(["assistant", "assistant", "assistant", "assistant"]),
    ], baseStatus);

    expect(status.totalMessages).toBe(1);
    expect(status.visibleMessages).toBe(1);
    expect(status.hiddenMessages).toBe(0);
});

test("ChatGPT display counts keep assistant-only Fast Mode captures logical without role-node inflation", () => {
    const status = createChatGptLogicalDisplayStatus([
        chatGptTurn(["assistant", "assistant", "assistant"]),
    ], { ...baseStatus, totalMessages: 1, visibleMessages: 1 });

    expect(status.totalMessages).toBe(1);
    expect(status.visibleMessages).toBe(1);
    expect(status.hiddenMessages).toBe(0);
});

test("ChatGPT display counts report hidden logical turns from hidden user and assistant containers", () => {
    const status = createChatGptLogicalDisplayStatus([
        chatGptTurn(["user"], true),
        chatGptTurn(["assistant"], true),
        chatGptTurn(["user"]),
        chatGptTurn(["assistant", "assistant"]),
    ], { ...baseStatus, totalMessages: 4, visibleMessages: 2, hiddenMessages: 2 });

    expect(status.totalMessages).toBe(2);
    expect(status.visibleMessages).toBe(1);
    expect(status.hiddenMessages).toBe(1);
});

function chatGptTurn(roles: readonly string[], hidden = false): HTMLElement {
    return {
        querySelectorAll: () => roles.map((role) => ({
            dataset: { messageAuthorRole: role },
        })),
        closest: () => hidden ? {} : null,
    } as unknown as HTMLElement;
}
