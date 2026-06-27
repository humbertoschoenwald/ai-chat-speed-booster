import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

const baselinePath = "docs/chatgpt/fixture-signal-baseline.md";

const expectedFixtures = [
    "stable",
    "native",
    "timeout",
    "in-operator",
    "status",
] as const;

const expectedMetrics = [
    "Turn sections",
    "Wrappers",
    "Scroll roots",
    "Tool groups",
    "Code buckets",
    "Empty turns",
    "Page assets",
    "Status/live nodes",
] as const;

test("ChatGPT fixture signal baseline documents every fixture family", () => {
    const text = readFileSync(baselinePath, "utf8");

    for (const fixture of expectedFixtures) expect(text).toContain(`| ${fixture} |`);
    for (const metric of expectedMetrics) expect(text).toContain(metric);
});

test("ChatGPT fixture signal baseline requires explicit drift review", () => {
    const text = readFileSync(baselinePath, "utf8");

    expect(text).toContain("selector drift");
    expect(text).toContain("review the fixture");
    expect(text).toContain("conversation and canonical-turn scopes");
    expect(text).toContain("not live-site guarantees");
});

test("ChatGPT fixture signal baseline preserves code bucket coverage", () => {
    const text = readFileSync(baselinePath, "utf8");

    expect(text).toContain("none:7, small:2, medium:2, heavy:1");
    expect(text).toContain("none:2, small:2, medium:2, heavy:0");
    expect(text).toContain("none:3, small:0, medium:0, heavy:0");
});
