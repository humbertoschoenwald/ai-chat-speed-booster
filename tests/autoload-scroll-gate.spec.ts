/**
 * License: MIT. Provenance: AI Chat Speed Booster extension tests.
 * Responsibility: regress Auto Load top-scroll gating.
 * Boundary: pure model tests; browser scroll diagnostics remain in diagnose:scroll.
 * ADR: docs/adr/experience/autoload-top-scroll-gate.md.
 */
import { test, expect } from "@playwright/test";
import { AutoLoadScrollGate } from "../src/content/scroll/AutoLoadScrollGate";

test("auto-load reveals at top without requesting a corrective scroll", () => {
    let now = 1_000;
    const gate = new AutoLoadScrollGate({ now: () => now, cooldownMs: 500 });

    expect(gate.shouldRevealOlderTurn({
        scrollTop: 0,
        scrollHeight: 5_000,
        clientHeight: 800,
        totalMessages: 20,
        visibleMessages: 6,
    })).toBe(true);

    expect(gate.shouldRevealOlderTurn({
        scrollTop: 0,
        scrollHeight: 5_000,
        clientHeight: 800,
        totalMessages: 20,
        visibleMessages: 7,
    })).toBe(false);

    now += 600;
    expect(gate.shouldRevealOlderTurn({
        scrollTop: 0,
        scrollHeight: 5_000,
        clientHeight: 800,
        totalMessages: 20,
        visibleMessages: 7,
    })).toBe(true);
});

test("auto-load ignores non-top scroll positions and complete conversations", () => {
    const gate = new AutoLoadScrollGate();

    expect(gate.shouldRevealOlderTurn({
        scrollTop: 1_500,
        scrollHeight: 5_000,
        clientHeight: 800,
        totalMessages: 20,
        visibleMessages: 6,
    })).toBe(false);

    expect(gate.shouldRevealOlderTurn({
        scrollTop: 0,
        scrollHeight: 5_000,
        clientHeight: 800,
        totalMessages: 6,
        visibleMessages: 6,
    })).toBe(false);
});
