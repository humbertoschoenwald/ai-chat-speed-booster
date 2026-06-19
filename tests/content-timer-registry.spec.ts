/**
 * License: MIT. Provenance: AI Chat Speed Booster extension tests.
 * Responsibility: verify named content timers replace ad hoc timeout globals.
 * Boundary: timer lifecycle only; content recovery behavior is tested elsewhere.
 * ADR: docs/adr/architecture/lifecycle/lifecycle-recovery.md.
 */
import { test, expect } from "@playwright/test";
import { ContentTimerRegistry } from "../src/content/runtime/ContentTimerRegistry";

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

test("timer registry replaces a pending timer by key", async () => {
    const timers = new ContentTimerRegistry();
    const calls: string[] = [];

    timers.set("conversation-retry", () => calls.push("first"), 5);
    timers.set("conversation-retry", () => calls.push("second"), 5);
    await wait(20);

    expect(calls).toEqual(["second"]);
});

test("timer registry clears all pending timers", async () => {
    const timers = new ContentTimerRegistry();
    const calls: string[] = [];

    timers.set("resume-health-check", () => calls.push("resume"), 5);
    timers.set("viewport-resize", () => calls.push("resize"), 5);
    timers.clearAll();
    await wait(20);

    expect(calls).toEqual([]);
});
