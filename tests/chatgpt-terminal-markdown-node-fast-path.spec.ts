import { test, expect } from "@playwright/test";
import {
    getChatGptTerminalMarkdownSelectorsForTests,
    readChatGptTerminalMarkdownNodeText,
} from "../src/content/native/chatgpt/ChatGptTerminalMarkdownNodeFastPath";
import { readCompletedChatGptMarkdownProseText } from "../src/content/native/chatgpt/ChatGptTextSnapshotRenderer";

test("ChatGPT terminal markdown fast path reads only-node text", () => {
    expect(readChatGptTerminalMarkdownNodeText(turnWithMarkers([{ only: true, text: "simple answer" }]))).toEqual({
        status: "simple",
        text: "simple answer",
    });
});

test("ChatGPT terminal markdown fast path reads last-node text", () => {
    expect(readChatGptTerminalMarkdownNodeText(turnWithMarkers([{ last: true, text: "terminal answer" }]))).toEqual({
        status: "simple",
        text: "terminal answer",
    });
});

test("ChatGPT terminal markdown fast path falls back for multi-node and missing markers", () => {
    expect(readChatGptTerminalMarkdownNodeText(turnWithMarkers([
        { only: true, text: "one" },
        { only: true, text: "two" },
    ])).status).toBe("inconsistent");
    expect(readChatGptTerminalMarkdownNodeText(turnWithMarkers([])).status).toBe("missing-marker");
});

test("ChatGPT terminal markdown fast path bypasses active turns", () => {
    expect(readChatGptTerminalMarkdownNodeText(turnWithMarkers([{ only: true, text: "wait" }], true)).status).toBe("active");
});

test("ChatGPT completed markdown text uses terminal marker fast path", () => {
    expect(readCompletedChatGptMarkdownProseText(turnWithMarkers([{ only: true, text: "fast text" }]))).toBe("fast text");
    expect(getChatGptTerminalMarkdownSelectorsForTests()).toEqual([
        "[data-is-only-node='true']",
        "[data-is-last-node='true']",
    ]);
});

function turnWithMarkers(
    markers: readonly { readonly only?: boolean; readonly last?: boolean; readonly text: string }[],
    active = false,
): HTMLElement {
    const nodes = markers.map((marker) => ({
        innerText: marker.text,
        textContent: marker.text,
        matches: () => false,
        querySelectorAll: () => [],
        getAttribute: (name: string) => {
            if (name === "data-is-only-node") return marker.only ? "true" : null;
            if (name === "data-is-last-node") return marker.last ? "true" : null;
            return null;
        },
    })) as unknown as HTMLElement[];
    return {
        innerText: markers.map((marker) => marker.text).join(" "),
        textContent: markers.map((marker) => marker.text).join(" "),
        contains: () => false,
        querySelector: (selector: string) => active && selector.includes("aria-busy") ? {} : null,
        querySelectorAll: (selector: string) => {
            if (selector.includes("data-is-only-node")) return nodes.filter((_, index) => markers[index]?.only);
            if (selector.includes("data-is-last-node")) return nodes.filter((_, index) => markers[index]?.last);
            return [];
        },
    } as unknown as HTMLElement;
}
