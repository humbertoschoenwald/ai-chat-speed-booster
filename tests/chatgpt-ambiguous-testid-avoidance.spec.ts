import { test, expect } from "@playwright/test";
import {
    inspectChatGptAmbiguousTestIds,
    isAmbiguousChatGptTestIdValue,
    readUnambiguousChatGptTestId,
} from "../src/content/native/chatgpt/ChatGptAmbiguousTestIdAvoidance";
import { CHATGPT_ERROR_SELECTOR, CHATGPT_TOOL_SELECTOR, readChatGptTurnId } from "../src/content/native/chatgpt/ChatGptSelectors";

test("ChatGPT ambiguous test IDs are diagnostics only", () => {
    expect(isAmbiguousChatGptTestIdValue("tool-call")) .toBe(true);
    expect(isAmbiguousChatGptTestIdValue("more-options")).toBe(true);
    expect(isAmbiguousChatGptTestIdValue("conversation-turn-12")).toBe(false);
    expect(readUnambiguousChatGptTestId(elementWithTestId("tool-call"))).toBeNull();
    expect(readUnambiguousChatGptTestId(elementWithTestId("conversation-turn-12"))).toBe("conversation-turn-12");
});

test("ChatGPT turn IDs do not use ambiguous test ID fallbacks", () => {
    expect(readChatGptTurnId(elementWithTestId("option"))).toBeNull();
    expect(readChatGptTurnId(elementWithTestId("conversation-turn-abc"))).toBe("conversation-turn-abc");
});

test("ChatGPT Native primary selectors avoid broad tool and error test IDs", () => {
    expect(CHATGPT_TOOL_SELECTOR).not.toContain("data-testid");
    expect(CHATGPT_ERROR_SELECTOR).not.toContain("data-testid");
});

test("ChatGPT selector drift diagnostics report ambiguous test IDs", () => {
    const snapshot = inspectChatGptAmbiguousTestIds(rootWithTestIds(["option", "tool-call", "conversation-turn-1"]));

    expect(snapshot.ambiguousTestIdCount).toBe(2);
    expect(snapshot.ambiguousValues).toEqual(["option", "tool-call"]);
});

function elementWithTestId(value: string): HTMLElement {
    return {
        getAttribute: (name: string) => name === "data-testid" ? value : null,
    } as unknown as HTMLElement;
}

function rootWithTestIds(values: readonly string[]): ParentNode {
    return {
        querySelectorAll: () => values.map(elementWithTestId),
    } as unknown as ParentNode;
}
