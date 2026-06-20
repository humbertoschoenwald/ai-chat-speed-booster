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

test("ChatGPT display counts unique user and assistant turns without role-node inflation", () => {
    const status = createChatGptLogicalDisplayStatus([
        chatGptTurn(["user"]),
        chatGptTurn(["assistant", "assistant", "assistant", "assistant"]),
    ], baseStatus);

    expect(status.totalMessages).toBe(2);
    expect(status.visibleMessages).toBe(2);
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

test("ChatGPT display counts the new fixture shape as 8 turns, not 15 role nodes", () => {
    const rolesByTurn = [
        ["user"],
        ["assistant", "assistant", "assistant"],
        ["user"],
        ["assistant", "assistant"],
        ["user"],
        ["assistant", "assistant", "assistant", "assistant"],
        ["user"],
        ["assistant", "assistant"],
    ];
    const status = createChatGptLogicalDisplayStatus(
        rolesByTurn.map((roles, index) => chatGptTurn(roles, index < 5)),
        { ...baseStatus, totalMessages: 15, visibleMessages: 15, hiddenMessages: 0 },
    );

    expect(rolesByTurn.flat()).toHaveLength(15);
    expect(status.totalMessages).toBe(8);
    expect(status.visibleMessages).toBe(3);
    expect(status.hiddenMessages).toBe(5);
});

test("ChatGPT display counts report hidden logical turns from hidden user and assistant containers", () => {
    const status = createChatGptLogicalDisplayStatus([
        chatGptTurn(["user"], true),
        chatGptTurn(["assistant"], true),
        chatGptTurn(["user"]),
        chatGptTurn(["assistant", "assistant"]),
    ], { ...baseStatus, totalMessages: 4, visibleMessages: 2, hiddenMessages: 2 });

    expect(status.totalMessages).toBe(4);
    expect(status.visibleMessages).toBe(2);
    expect(status.hiddenMessages).toBe(2);
});

test("ChatGPT display counts do not inflate Stable logical message counts", () => {
    const status = createChatGptLogicalDisplayStatus(
        Array.from({ length: 20 }, (_, index) => chatGptTurn([index % 2 === 0 ? "user" : "assistant"], index < 14)),
        { ...baseStatus, totalMessages: 10, visibleMessages: 3, hiddenMessages: 7 },
    );

    expect(status.totalMessages).toBe(10);
    expect(status.visibleMessages).toBe(3);
    expect(status.hiddenMessages).toBe(7);
});

let turnCounter = 0;
function chatGptTurn(roles: readonly string[], hidden = false): HTMLElement {
    const id = `turn-${turnCounter++}`;
    return {
        getAttribute: (name: string) => {
            if (name === "data-turn-id-container") return id;
            if (name === "data-testid") return `conversation-${id}`;
            return null;
        },
        querySelectorAll: () => roles.map((role) => ({
            dataset: { messageAuthorRole: role },
        })),
        closest: () => hidden ? {} : null,
    } as unknown as HTMLElement;
}
