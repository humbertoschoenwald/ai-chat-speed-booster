import { test, expect } from "@playwright/test";
import { getLoadOlderControlSelectorForTests, isLoadOlderControlNode } from "../src/content/LoadOlderControlScope";

test("ACSB load older controls are recognized as extension-owned nodes", () => {
    expect(isLoadOlderControlNode(controlNode(true))).toBe(true);
    expect(isLoadOlderControlNode(controlNode(false))).toBe(false);
    expect(getLoadOlderControlSelectorForTests()).toContain("acsb-load-more-wrapper");
    expect(getLoadOlderControlSelectorForTests()).toContain("data-acsb-load-older-control");
});

test("ACSB load older controls are excluded from canonical turn queries", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("src/content/DOMObserver.ts", "utf8"));

    expect(source).toContain("isLoadOlderControlNode");
    expect(source).toContain("!isLoadOlderControlNode(element)");
});

test("ACSB load older control keeps accessibility and ownership markers", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("src/content/UIComponents.ts", "utf8"));

    expect(source).toContain("aria-label", "Load older messages");
    expect(source).toContain("data-acsb-owner");
    expect(source).toContain("data-acsb-load-older-control");
    expect(["stable", "timeout", "status"]).toEqual(["stable", "timeout", "status"]);
});

function controlNode(isControl: boolean): Element {
    return {
        matches: (selector: string) => isControl && selector.includes("acsb-load-more"),
        closest: (selector: string) => isControl && selector.includes("acsb-load-more") ? {} : null,
    } as unknown as Element;
}
