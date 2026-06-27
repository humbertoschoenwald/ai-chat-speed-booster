import { test, expect } from "@playwright/test";
import { canonicalStickyNoteUrl, isChatGptLocation } from "../src/content/chatgpt/ChatGptStickyNoteController";

test("ChatGPT sticky notes persist by canonical conversation URL", () => {
    expect(canonicalStickyNoteUrl({
        origin: "https://chatgpt.com",
        pathname: "/c/thread-id",
        search: "?model=gpt-test",
    })).toBe("https://chatgpt.com/c/thread-id?model=gpt-test");
});

test("ChatGPT sticky notes are ChatGPT-only", () => {
    expect(isChatGptLocation({ hostname: "chatgpt.com" })).toBe(true);
    expect(isChatGptLocation({ hostname: "www.chatgpt.com" })).toBe(true);
    expect(isChatGptLocation({ hostname: "example.com" })).toBe(false);
});

test("ChatGPT sticky note source keeps English labels and send/copy fallback", async () => {
    const source = await import("node:fs/promises").then((fs) =>
        fs.readFile("src/content/chatgpt/ChatGptStickyNoteController.ts", "utf8"),
    );

    expect(source).toContain("Sticky note");
    expect(source).toContain("Delete sticky notes");
    expect(source).toContain("Sent to ChatGPT.");
    expect(source).toContain("Copied to clipboard.");
    expect(source).toContain("trySendToChatGpt");
    expect(source).toContain("button[data-testid='send-button']");
    expect(source).not.toContain("Borrar sticky notes");
});
