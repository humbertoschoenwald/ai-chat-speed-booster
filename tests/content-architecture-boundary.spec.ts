import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { spawnSync } from "child_process";
import path from "path";

test("content entrypoint depends on ChatGPT through one provider runtime adapter", () => {
    const source = readFileSync(path.resolve("src/content/index.ts"), "utf8");

    expect(source).toContain('import { ChatGptContentRuntime }');
    for (const forbidden of [
        "ensureChatGptTextSnapshotRendererState",
        "syncChatGptNativeSnapshots",
        "detectChatGptDeliveryTimeout",
        "detectChatGptMaxLengthReadonly",
        "ChatGptTextSnapshotRenderer",
        "ChatGptTurnContentVisibilityController",
        "estimateChatGptPromptTokens",
        "readChatGptComposerText",
        "VirtualizationConflictDetector",
        "ToolCallGroupController",
        "TurnRegistry",
    ]) {
        expect(source, `${forbidden} belongs inside the ChatGPT runtime adapter`).not.toContain(forbidden);
    }
});

test("auto-load observer never forces the scroll position away from the top", () => {
    const source = readFileSync(path.resolve("src/content/DOMObserver.ts"), "utf8");

    expect(source.match(/private readonly handleScroll =/g)?.length).toBe(1);
    expect(source).not.toContain("scrollTo(");
    expect(source).not.toContain("0.12 * el.scrollHeight");
});

test("extension source does not carry Schoenwald large-file markers", () => {
    const marker = ["SCHOENWALD", "LARGE", "FILE"].join("-");
    const result = spawnSync(
        "git",
        ["grep", "-n", marker, "--", "src", "tests", "scripts"],
        { encoding: "utf8" },
    );

    expect(result.status, result.stdout).toBe(1);
    expect(result.stdout).toBe("");
});
