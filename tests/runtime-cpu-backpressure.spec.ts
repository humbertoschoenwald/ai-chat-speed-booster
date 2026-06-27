import { test, expect } from "@playwright/test";

test("content UI refresh has global backpressure across modes", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("src/content/index.ts", "utf8"));

    expect(source).toContain("UI_REFRESH_MIN_INTERVAL_MS");
    expect(source).toContain("UI_REFRESH_HIDDEN_MIN_INTERVAL_MS");
    expect(source).toContain("shouldThrottleUiRefresh");
    expect(source).toContain("scheduleThrottledUiRefresh");
    expect(source).toContain("refreshUiTimer");
});

test("ChatGPT Native and Extreme snapshot work is rate limited", async () => {
    const source = await import("node:fs/promises").then((fs) =>
        fs.readFile("src/content/native/chatgpt/ChatGptContentRuntime.ts", "utf8"),
    );

    expect(source).toContain("NATIVE_SNAPSHOT_MIN_INTERVAL_MS");
    expect(source).toContain("lastNativeSnapshotSyncAt");
    expect(source).toContain("now - this.lastNativeSnapshotSyncAt");
    expect(source).toContain("!this.layoutChangeBatch.snapshot().pending");
});
