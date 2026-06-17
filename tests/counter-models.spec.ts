import { test, expect } from "@playwright/test";
import { RequestLifecycleTracker } from "../src/content/RequestLifecycleTracker";

const node = (role: "user" | "assistant", failed = false): HTMLElement => ({
    matches: (selector: string) => selector.includes(role),
    querySelector: (selector: string) => (failed && selector.includes("alert") ? {} : null),
}) as unknown as HTMLElement;

test("accepted request counter waits for assistant response (#30)", () => {
    const reports: number[] = [];
    const tracker = new RequestLifecycleTracker("chatgpt", "user", (_siteId, count) => reports.push(count));

    tracker.observeAddedTurns([node("user")]);
    tracker.observeAddedTurns([node("assistant", true)]);
    tracker.observeAddedTurns([node("user"), node("assistant")]);

    expect(reports).toEqual([1]);
});
