import { test, expect } from "@playwright/test";
import { detectChatGptMaxLengthReadonly } from "../src/content/native/chatgpt/ChatGptMaxLengthReadonlyDetector";
import { detectChatGptDeliveryTimeout } from "../src/content/native/chatgpt/ChatGptDeliveryTimeoutDetector";
import { classifyChatGptThreadStatus } from "../src/content/native/chatgpt/ChatGptThreadStatusClassifier";

test("ChatGPT max-length UI is status-only and has no progress fields", () => {
    const snapshot = detectChatGptMaxLengthReadonly(textRoot(
        "This conversation has reached the maximum conversation length. Please start a new chat.",
    ));

    expect(snapshot).toEqual({
        detected: true,
        reason: "maximum conversation length",
    });
    expect(Object.keys(snapshot)).toEqual(["detected", "reason"]);
});

test("ChatGPT max-length UI stays separate from delivery-timeout refresh", () => {
    const root = textRoot("This conversation is too long. Please start a new chat.");

    expect(detectChatGptMaxLengthReadonly(root).detected).toBe(true);
    expect(detectChatGptDeliveryTimeout(root).detected).toBe(false);
});

test("normal ChatGPT text is not a max-length readonly state", () => {
    expect(detectChatGptMaxLengthReadonly(textRoot("Ready when you are."))).toEqual({
        detected: false,
        reason: null,
    });
});

function textRoot(textContent: string): ParentNode {
    return { textContent } as unknown as ParentNode;
}

test("ChatGPT thread status classifier preserves readonly status without progress", () => {
    const snapshot = classifyChatGptThreadStatus(textRoot(
        "This conversation has reached the maximum conversation length. Please start a new chat.",
    ));

    expect(snapshot).toEqual({
        detected: true,
        kind: "readonly",
        reason: "maximum conversation length",
        controlCount: 0,
    });
    expect(Object.keys(snapshot)).toEqual(["detected", "kind", "reason", "controlCount"]);
});

test("ChatGPT thread status classifier ignores normal completed threads", () => {
    expect(classifyChatGptThreadStatus(textRoot("Here is a normal completed answer."))).toEqual({
        detected: false,
        kind: "none",
        reason: null,
        controlCount: 0,
    });
});
