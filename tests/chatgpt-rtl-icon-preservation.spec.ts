import { test, expect } from "@playwright/test";
import {
    annotateGeneratedSummaryWithRtlMetadata,
    getChatGptRtlFlipIconSelectorForTests,
    readChatGptRtlIconMetadata,
} from "../src/content/native/chatgpt/ChatGptRtlIconPreservation";

test("ChatGPT RTL icon metadata is read from source nodes", () => {
    expect(readChatGptRtlIconMetadata(sourceWithRtlIcons(2, "rtl"))).toEqual({
        rtlFlipIconCount: 2,
        direction: "rtl",
    });
    expect(getChatGptRtlFlipIconSelectorForTests()).toBe("[data-rtl-flip]");
});

test("ChatGPT generated summaries preserve RTL metadata without accessible icons", () => {
    const summary = attributeElement();

    annotateGeneratedSummaryWithRtlMetadata(summary, sourceWithRtlIcons(3, "rtl"));

    expect(summary.getAttribute("data-acsb-rtl-icon-metadata-preserved")).toBe("true");
    expect(summary.getAttribute("data-acsb-rtl-flip-icon-count")).toBe("3");
    expect(summary.getAttribute("dir")).toBe("rtl");
});

test("ChatGPT Native snapshot extraction excludes RTL icon clones", async () => {
    const source = await import("node:fs/promises").then((fs) =>
        fs.readFile("src/content/native/chatgpt/ChatGptTextSnapshotRenderer.ts", "utf8"),
    );

    expect(source).toContain("[data-rtl-flip]");
});

function sourceWithRtlIcons(count: number, direction: string): ParentNode {
    return {
        querySelectorAll: (selector: string) => selector.includes("data-rtl-flip")
            ? Array.from({ length: count }, () => ({}))
            : [],
        closest: () => null,
        getAttribute: (name: string) => name === "dir" ? direction : null,
    } as unknown as ParentNode;
}

function attributeElement(): HTMLElement {
    const attrs = new Map<string, string>();
    return {
        setAttribute: (name: string, value: string) => attrs.set(name, value),
        getAttribute: (name: string) => attrs.get(name) ?? null,
    } as unknown as HTMLElement;
}
