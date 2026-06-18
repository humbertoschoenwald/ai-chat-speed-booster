import { test, expect } from "@playwright/test";
import { RequestLifecycleTracker } from "../src/content/RequestLifecycleTracker";

const node = (role: "user" | "assistant", failed = false): HTMLElement => ({
    matches: (selector: string) => selector.includes(role),
    querySelector: (selector: string) => (failed && selector.includes("alert") ? {} : null),
}) as unknown as HTMLElement;

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

test("accepted request counter waits for assistant response (#30)", () => {
    const reports: number[] = [];
    const tracker = new RequestLifecycleTracker("chatgpt", "user", (_siteId, count) => reports.push(count), 0);

    tracker.observeAddedTurns([node("user")]);
    tracker.observeAddedTurns([node("assistant", true)]);
    tracker.observeAddedTurns([node("user"), node("assistant")]);

    expect(reports).toEqual([1]);
});

test("accepted request reports remain scoped to the current site", () => {
    const reports: string[] = [];
    const chatgpt = new RequestLifecycleTracker("chatgpt", "user", (siteId, count) => reports.push(`${siteId}:${count}`), 0);
    const grok = new RequestLifecycleTracker("grok", "user", (siteId, count) => reports.push(`${siteId}:${count}`), 0);

    chatgpt.observeAddedTurns([node("user"), node("assistant")]);
    grok.observeAddedTurns([node("user"), node("assistant")]);

    expect(reports).toEqual(["chatgpt:1", "grok:1"]);
});

test("streaming error cancels a delayed accepted request (#30)", async () => {
    const reports: number[] = [];
    const tracker = new RequestLifecycleTracker("chatgpt", "user", (_siteId, count) => reports.push(count), 20);

    tracker.observeAddedTurns([node("user"), node("assistant")]);
    tracker.observeAddedTurns([node("assistant", true)]);
    await wait(30);

    expect(reports).toEqual([]);
});

test("successful delayed response increments once after quiet window (#30)", async () => {
    const reports: number[] = [];
    const tracker = new RequestLifecycleTracker("chatgpt", "user", (_siteId, count) => reports.push(count), 5);

    tracker.observeAddedTurns([node("user"), node("assistant")]);
    await wait(10);

    expect(reports).toEqual([1]);
});


test("removed pending response does not increment accepted counter (#30)", async () => {
    const reports: number[] = [];
    const tracker = new RequestLifecycleTracker("chatgpt", "user", (_siteId, count) => reports.push(count), 20);
    const response = node("assistant");

    tracker.observeAddedTurns([node("user"), response]);
    tracker.observeRemovedTurns([response]);
    await wait(30);

    expect(reports).toEqual([]);
});

test("global rejected state cancels pending accepted counter (#30)", async () => {
    const reports: number[] = [];
    const tracker = new RequestLifecycleTracker("chatgpt", "user", (_siteId, count) => reports.push(count), 20);

    tracker.observeAddedTurns([node("user"), node("assistant")]);
    tracker.observeFailureState(node("assistant", true));
    await wait(30);

    expect(reports).toEqual([]);
});

test("retry after rejected request increments once after success (#30)", async () => {
    const reports: number[] = [];
    const tracker = new RequestLifecycleTracker("chatgpt", "user", (_siteId, count) => reports.push(count), 0);

    tracker.observeAddedTurns([node("user"), node("assistant", true)]);
    tracker.observeAddedTurns([node("user"), node("assistant")]);

    expect(reports).toEqual([1]);
});

test("duplicate accepted response mutation is ignored (#30)", () => {
    const reports: number[] = [];
    const tracker = new RequestLifecycleTracker("chatgpt", "user", (_siteId, count) => reports.push(count), 0);
    const user = node("user");
    const assistant = node("assistant");

    tracker.observeAddedTurns([user, assistant]);
    tracker.observeAddedTurns([user, assistant]);

    expect(reports).toEqual([1]);
});
