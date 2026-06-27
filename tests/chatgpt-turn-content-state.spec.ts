import { test, expect } from "@playwright/test";
import {
    classifyChatGptTurnContentState,
    summarizeChatGptTurnContentStates,
} from "../src/content/native/chatgpt/ChatGptTurnContentState";

test("ChatGPT turn content state detects empty placeholders", () => {
    expect(classifyChatGptTurnContentState(fakeTurn({ text: "" }))).toBe("placeholder");
});

test("ChatGPT turn content state keeps hydrated and active turns out of placeholder path", () => {
    expect(classifyChatGptTurnContentState(fakeTurn({ text: "real answer" }))).toBe("hydrated");
    expect(classifyChatGptTurnContentState(fakeTurn({ text: "", interactive: true }))).toBe("hydrated");
    expect(classifyChatGptTurnContentState(fakeTurn({ text: "", busy: true }))).toBe("active");
    expect(classifyChatGptTurnContentState(fakeTurn({ text: "", error: true }))).toBe("status");
});

test("ChatGPT turn content state summary counts placeholder buckets", () => {
    expect(summarizeChatGptTurnContentStates(["placeholder", "hydrated", "active", "status", "placeholder"])).toEqual({
        placeholderTurns: 2,
        hydratedTurns: 1,
        activeTurns: 1,
        statusTurns: 1,
    });
});

function fakeTurn(options: {
    readonly text: string;
    readonly interactive?: boolean;
    readonly busy?: boolean;
    readonly error?: boolean;
}): HTMLElement {
    return {
        innerText: options.text,
        textContent: options.text,
        querySelector: (selector: string) => {
            if (options.error && selector.includes("error")) return {};
            if (options.busy && selector.includes("aria-busy")) return {};
            if (options.interactive && selector.includes("button")) return {};
            return null;
        },
    } as unknown as HTMLElement;
}
