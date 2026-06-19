import { test, expect } from "@playwright/test";
import { isStaticSummaryCandidate } from "../src/content/native/chatgpt/ChatGptToolCallSummaryController";
import type { ToolCallGroupRecord } from "../src/content/native/ToolCallGroupController";
import { classifyChatGptToolCallState } from "../src/content/native/chatgpt/ChatGptToolCallStateGuard";

test("completed closed tool calls are static summary candidates", () => {
    expect(isStaticSummaryCandidate(group("completed", element({ state: "closed", text: "Read file" })))).toBe(true);
});

test("active tool calls are not static summary candidates", () => {
    expect(isStaticSummaryCandidate(group("running", element({ state: "closed", text: "Read file" })))).toBe(false);
    expect(isStaticSummaryCandidate(group("completed", element({ state: "closed", text: "Calling tool" })))).toBe(false);
    expect(isStaticSummaryCandidate(group("completed", element({ state: "closed", active: true, text: "Read file" })))).toBe(false);
});

test("open or user-owned tool-like nodes are not static summary candidates", () => {
    expect(isStaticSummaryCandidate(group("completed", element({ text: "Read file" })))).toBe(false);
    expect(isStaticSummaryCandidate(group("completed", element({ state: "closed", userOwned: true, text: "Read file" })))).toBe(false);
});

test("ChatGPT guard identifies active text", () => {
    expect(classifyChatGptToolCallState(element({ text: "Calling tool" }))).toBe("active");
});

function group(state: ToolCallGroupRecord["state"], element: HTMLElement): ToolCallGroupRecord {
    return { id: "g1", ownerTurnKey: "t1", element, state, estimatedNodeCost: 1 };
}

function element(options: { readonly state?: string; readonly text?: string; readonly active?: boolean; readonly userOwned?: boolean }): HTMLElement {
    return {
        innerText: options.text ?? "",
        textContent: options.text ?? "",
        getAttribute: (name: string) => name === "data-state" ? options.state ?? null : null,
        querySelector: (selector: string) => {
            if (selector.includes("data-state") && options.state === "closed") return {};
            if (selector.includes("aria-busy") && options.active) return {};
            return null;
        },
        matches: (selector: string) => selector.includes("aria-busy") && options.active === true,
        closest: (selector: string) => selector.includes("data-message-author-role") && options.userOwned === true ? {} : null,
    } as unknown as HTMLElement;
}
