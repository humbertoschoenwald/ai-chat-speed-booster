import { test, expect } from "@playwright/test";
import { TurnRegistry } from "../src/content/native/TurnRegistry";
import { readChatGptMessageMetadata } from "../src/content/native/chatgpt/ChatGptMessageMetadata";
import { resolveChatGptMessageRole } from "../src/content/native/chatgpt/ChatGptMessageRoleResolver";

test("ChatGPT message role resolver prefers section roles", () => {
    const turn = roleElement({ sectionRole: "user", messageRole: "assistant" });
    const metadata = readChatGptMessageMetadata(turn);

    expect(resolveChatGptMessageRole(turn, metadata)).toEqual({
        role: "user",
        source: "section",
        confidence: "high",
    });
});

test("ChatGPT message role resolver falls back to message metadata", () => {
    const turn = roleElement({ messageRole: "assistant" });
    const metadata = readChatGptMessageMetadata(turn);

    expect(resolveChatGptMessageRole(turn, metadata)).toEqual({
        role: "assistant",
        source: "message",
        confidence: "high",
    });
});

test("ChatGPT message role resolver falls back to cached role before unknown", () => {
    const turn = roleElement({});
    const metadata = readChatGptMessageMetadata(turn);

    expect(resolveChatGptMessageRole(turn, metadata, "assistant")).toEqual({
        role: "assistant",
        source: "cached",
        confidence: "medium",
    });
    expect(resolveChatGptMessageRole(turn, metadata)).toEqual({
        role: "unknown",
        source: "unknown",
        confidence: "low",
    });
});

test("ChatGPT turn registry stores role source and confidence diagnostics", () => {
    const registry = new TurnRegistry();
    const section = registry.track(roleElement({ sectionRole: "user", id: "s" }), 0);
    const message = registry.track(roleElement({ messageRole: "assistant", id: "m" }), 1);
    const unknown = registry.track(roleElement({ id: "u" }), 2);

    expect(section).toMatchObject({ role: "user", roleSource: "section", roleConfidence: "high" });
    expect(message).toMatchObject({ role: "assistant", roleSource: "message", roleConfidence: "high" });
    expect(unknown).toMatchObject({ role: "unknown", roleSource: "unknown", roleConfidence: "low" });
});

function roleElement(options: {
    readonly sectionRole?: string;
    readonly messageRole?: string;
    readonly id?: string;
}): HTMLElement {
    const messageRoot = {
        getAttribute: (name: string) => {
            if (name === "data-message-author-role") return options.messageRole ?? null;
            if (name === "data-message-id") return options.id ?? null;
            return null;
        },
    } as unknown as HTMLElement;

    return {
        id: options.id ?? "",
        matches: (selector: string) => Boolean(
            options.messageRole && selector.includes("data-message-author-role"),
        ),
        querySelector: (selector: string) => selector.includes("data-message-author-role") && options.messageRole ? messageRoot : null,
        getAttribute: (name: string) => {
            if (name === "data-turn-role") return options.sectionRole ?? null;
            if (name === "data-message-author-role") return options.sectionRole ?? null;
            if (name === "data-message-id") return options.id ?? null;
            if (name === "data-testid") return options.id ? `conversation-turn-${options.id}` : null;
            return null;
        },
        getBoundingClientRect: () => ({ height: 100 }),
    } as unknown as HTMLElement;
}
