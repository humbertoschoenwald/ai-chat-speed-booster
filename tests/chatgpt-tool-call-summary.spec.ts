import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { readCachedCollapsedToolCallLabel } from "../src/content/native/chatgpt/ChatGptToolCallLabelCache";
import { isStaticSummaryCandidate } from "../src/content/native/chatgpt/ChatGptToolCallSummaryController";
import { classifyChatGptToolCardLabel } from "../src/content/native/chatgpt/ChatGptToolCardLabelTaxonomy";
import type { ToolCallGroupRecord } from "../src/content/native/ToolCallGroupController";
import { classifyChatGptToolCallState, hasNestedToolCallButtons } from "../src/content/native/chatgpt/ChatGptToolCallStateGuard";

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

test("completed collapsed tool labels are cached without expanded details", () => {
    const host = element({ state: "closed", text: "Expanded hidden details", label: "Called tool" });

    expect(readCachedCollapsedToolCallLabel(host)).toBe("Called tool");
    expect(readCachedCollapsedToolCallLabel(host)).toBe("Called tool");
    expect(host.textReadCount()).toBe(0);
});

test("tool label cache bypasses expanded state and invalidates state changes", () => {
    const host = element({ state: "closed", text: "Closed fallback", label: "Called tool" });

    expect(readCachedCollapsedToolCallLabel(host)).toBe("Called tool");
    host.setState("open");
    expect(readCachedCollapsedToolCallLabel(host)).toBe("Called tool");
    expect(isStaticSummaryCandidate(group("completed", host))).toBe(false);
});

test("nested ChatGPT tool call buttons stay host-owned", () => {
    const host = element({ state: "closed", text: "Read file", nestedButtons: true });

    expect(hasNestedToolCallButtons(host)).toBe(true);
    expect(isStaticSummaryCandidate(group("completed", host))).toBe(false);
});

test("ChatGPT guard identifies active text", () => {
    expect(classifyChatGptToolCallState(element({ text: "Calling tool" }))).toBe("active");
    expect(readFileSync("src/content/native/chatgpt/ChatGptToolCallSummaryController.ts", "utf8")).toContain("RESTORE_SPIKE_LIMIT");
});

test("static tool summaries reduce icon paint without replacing original nodes", () => {
    const source = readFileSync("src/content/native/chatgpt/ChatGptToolCallSummaryController.ts", "utf8");

    expect(source).toContain("[${HOST_ATTR}='true'] svg");
    expect(source).toContain("transition-duration:0s!important");
    expect(source).toContain("filter:none!important");
    expect(source).toContain("will-change:auto!important");
    expect(source).toContain("aria-hidden");
    expect(source).toContain("presentation");
    expect(source).toContain("tabindex");
    expect(source).not.toContain("querySelectorAll<SVGElement>");
});

function group(state: ToolCallGroupRecord["state"], element: HTMLElement): ToolCallGroupRecord {
    return { id: "g1", ownerTurnKey: "t1", element, state, estimatedNodeCost: 1 };
}

function element(options: { readonly state?: string; readonly text?: string; readonly label?: string; readonly active?: boolean; readonly userOwned?: boolean; readonly nestedButtons?: boolean }): HTMLElement {
    let state = options.state;
    let textReads = 0;
    const labelNode = {
        getAttribute: (name: string) => name === "aria-label" ? options.label ?? null : null,
        get innerText() {
            textReads += 1;
            return options.label ?? "";
        },
        get textContent() {
            textReads += 1;
            return options.label ?? "";
        },
    } as unknown as HTMLElement;
    const innerButton = {} as HTMLElement;
    const outerButton = {
        contains: (candidate: HTMLElement) => candidate === innerButton,
    } as HTMLElement;
    return {
        get innerText() {
            textReads += 1;
            return options.text ?? "";
        },
        get textContent() {
            textReads += 1;
            return options.text ?? "";
        },
        textReadCount: () => textReads,
        setState: (next: string) => {
            state = next;
        },
        getAttribute: (name: string) => name === "data-state" ? state ?? null : null,
        querySelector: (selector: string) => {
            if (selector.includes("aria-label") && options.label) return labelNode;
            if (selector.includes("data-state") && state) return { getAttribute: () => state };
            if (selector.includes("aria-busy") && options.active) return {};
            return null;
        },
        querySelectorAll: (selector: string) => selector === "button" && options.nestedButtons
            ? [outerButton, innerButton]
            : [],
        matches: (selector: string) => selector.includes("aria-busy") && options.active === true,
        closest: (selector: string) => selector.includes("data-message-author-role") && options.userOwned === true ? {} : null,
    } as unknown as HTMLElement;
}

test("ChatGPT tool card label taxonomy classifies known label families", () => {
    expect(classifyChatGptToolCardLabel("Called tool")).toMatchObject({
        kind: "completed",
        staticSummaryEligible: true,
    });
    expect(classifyChatGptToolCardLabel("Looked for available tools")).toMatchObject({
        kind: "lookup-status",
        staticSummaryEligible: false,
    });
    expect(classifyChatGptToolCardLabel("Calling tool")).toMatchObject({
        kind: "active",
        staticSummaryEligible: false,
    });
    expect(classifyChatGptToolCardLabel("Open tool call list")).toMatchObject({
        kind: "collapsed-control",
        staticSummaryEligible: false,
    });
    expect(classifyChatGptToolCardLabel("Custom unknown provider status")).toMatchObject({
        kind: "unknown",
        staticSummaryEligible: false,
    });
});

test("ChatGPT tool summary preserves lookup and control labels", () => {
    expect(isStaticSummaryCandidate(group("completed", element({ state: "closed", label: "Looked for available tools" })))).toBe(false);
    expect(isStaticSummaryCandidate(group("completed", element({ state: "closed", label: "Open tool call list" })))).toBe(false);
    expect(isStaticSummaryCandidate(group("completed", element({ state: "closed", label: "Custom unknown provider status" })))).toBe(false);
});
