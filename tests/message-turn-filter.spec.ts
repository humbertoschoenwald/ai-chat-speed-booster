/**
 * License: MIT. Provenance: AI Chat Speed Booster extension tests.
 * Responsibility: regress ChatGPT Stable message-turn filtering.
 * Boundary: synthetic DOM-shape test only; private saved HTML is not committed.
 * ADR: docs/adr/architecture/message-management/chatgpt-search-highlight-exclusion.md.
 */
import { test, expect } from "@playwright/test";
import { SITES } from "../src/shared/sites";
import { filterMessageTurns } from "../src/shared/messageTurnFilter";

test("ChatGPT conversation turns are not excluded by the current thread wrapper", () => {
    const chatGpt = SITES.find((site) => site.id === "chatgpt");
    expect(chatGpt).toBeDefined();
    expect(chatGpt!.selectors.excludedMessageAncestorSelectors).toBeUndefined();

    const real = {
        id: "real-turn",
        closest: () => ({ className: "qMYqUG_convSearchResultHighlightRoot" }),
    } as unknown as HTMLElement;

    expect(filterMessageTurns([real], chatGpt!.selectors).map((element) => element.id))
        .toEqual(["real-turn"]);
});
