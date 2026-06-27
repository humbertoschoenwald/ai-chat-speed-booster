import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

test("ChatGPT conversation capture boundary is wired into Native guards", () => {
    const boundarySource = readFileSync("src/content/native/chatgpt/ChatGptConversationScreenshotBoundary.ts", "utf8");
    const snapshotSource = readFileSync("src/content/native/chatgpt/ChatGptTextSnapshotRenderer.ts", "utf8");
    const containmentSource = readFileSync("src/content/native/chatgpt/ChatGptTurnContainmentController.ts", "utf8");
    const runtimeSource = readFileSync("src/content/native/chatgpt/ChatGptContentRuntime.ts", "utf8");

    expect(boundarySource).toContain("data-conversation");
    expect(boundarySource).toContain("protectedTurnCount");
    expect(snapshotSource).toContain("containsChatGptConversationScreenshotBoundary(turn)");
    expect(containmentSource).toContain("containsChatGptConversationScreenshotBoundary(turn)");
    expect(runtimeSource).toContain("nativeConversationScreenshotBoundary");
});
