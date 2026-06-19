import { test, expect } from "@playwright/test";
import { coerceConfigPatchForSite } from "../src/background/configPolicy";

test("background rejects Native Mode config writes outside ChatGPT", () => {
    expect(coerceConfigPatchForSite({ performanceMode: "native" }, "gemini"))
        .toEqual({ performanceMode: "legacy" });
    expect(coerceConfigPatchForSite({ performanceMode: "native" }, undefined))
        .toEqual({ performanceMode: "legacy" });
});

test("background preserves Native Mode writes for ChatGPT and non-mode writes elsewhere", () => {
    expect(coerceConfigPatchForSite({ performanceMode: "native" }, "chatgpt"))
        .toEqual({ performanceMode: "native" });
    expect(coerceConfigPatchForSite({ autoRefreshDeliveryTimeout: true }, "gemini"))
        .toEqual({ autoRefreshDeliveryTimeout: true });
});
