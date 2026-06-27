import { test, expect } from "@playwright/test";
import { inspectChatGptSelectorDrift } from "../src/content/native/chatgpt/ChatGptSelectorDriftSentinel";

test("ChatGPT selector sentinel passes current fixture-like signals", () => {
    const turn = fakeTurn("turn-1");
    const root = fakeRoot({
        turns: [turn],
        composer: fakeComposer(),
        tools: [fakeTool("Called tool")],
    });

    expect(inspectChatGptSelectorDrift({ root, scrollRoot: fakeElement(), turns: [turn] })).toMatchObject({
        confidence: "high",
        failedContracts: [],
        turnCount: 1,
        dedupedTurnCount: 1,
        composerPresent: true,
        scrollRootPresent: true,
        toolCardCount: 1,
        knownToolLabelCount: 1,
        riskyOptimizationAllowed: true,
    });
});

test("ChatGPT selector sentinel degrades unknown tool labels conservatively", () => {
    const turn = fakeTurn("turn-1");
    const snapshot = inspectChatGptSelectorDrift({
        root: fakeRoot({ turns: [turn], composer: fakeComposer(), tools: [fakeTool("Provider changed label")] }),
        scrollRoot: fakeElement(),
        turns: [turn],
    });

    expect(snapshot.confidence).toBe("medium");
    expect(snapshot.failedContracts).toContain("chatgpt-tool-labels-unknown");
    expect(snapshot.riskyOptimizationAllowed).toBe(true);
});

test("ChatGPT selector sentinel disables risky work on low-confidence drift", () => {
    const turn = fakeTurn("turn-1");
    const extraTurns = [fakeTurn("a"), fakeTurn("b"), fakeTurn("c"), fakeTurn("d"), fakeTurn("e")];
    const snapshot = inspectChatGptSelectorDrift({
        root: fakeRoot({ turns: [turn, ...extraTurns], composer: null, tools: [] }),
        scrollRoot: null,
        turns: [turn],
    });

    expect(snapshot.confidence).toBe("low");
    expect(snapshot.failedContracts).toContain("chatgpt-turn-selector-overbroad");
    expect(snapshot.failedContracts).toContain("chatgpt-scroll-root-missing");
    expect(snapshot.failedContracts).toContain("chatgpt-composer-scope-missing");
    expect(snapshot.riskyOptimizationAllowed).toBe(false);
});

function fakeRoot(options: {
    readonly turns: readonly HTMLElement[];
    readonly composer: HTMLElement | null;
    readonly tools: readonly HTMLElement[];
}): ParentNode {
    return {
        querySelector: (selector: string) => selector.includes("prompt-textarea") ? options.composer : null,
        querySelectorAll: (selector: string) => {
            if (selector.includes("conversation-turn")) return options.turns;
            if (selector.includes("tool")) return options.tools;
            return [];
        },
    } as unknown as ParentNode;
}

function fakeTurn(id: string): HTMLElement {
    return {
        getAttribute: (name: string) => name === "data-turn-id" ? id : null,
        matches: (selector: string) => selector.includes("section[data-testid^='conversation-turn-']"),
    } as unknown as HTMLElement;
}

function fakeComposer(): HTMLElement {
    return {
        matches: (selector: string) => selector.includes("textarea") || selector.includes("contenteditable"),
        closest: () => null,
        querySelector: () => null,
    } as unknown as HTMLElement;
}

function fakeTool(label: string): HTMLElement {
    const labelHost = {
        getAttribute: (name: string) => name === "aria-label" ? label : null,
        innerText: label,
        textContent: label,
    } as unknown as HTMLElement;
    return {
        querySelector: () => labelHost,
        getAttribute: () => null,
        innerText: label,
        textContent: label,
    } as unknown as HTMLElement;
}

function fakeElement(): HTMLElement {
    return {} as HTMLElement;
}
