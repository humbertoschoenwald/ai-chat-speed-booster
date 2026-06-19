/**
 * License: MIT. Provenance: AI Chat Speed Booster extension tests.
 * Responsibility: regress ChatGPT search-highlight mirror exclusion.
 * Boundary: synthetic DOM-shape test only; private saved HTML is not committed.
 * ADR: docs/adr/architecture/message-management/chatgpt-search-highlight-exclusion.md.
 */
import { test, expect } from "@playwright/test";
import { SITES } from "../src/shared/sites";
import { filterMessageTurns } from "../src/shared/messageTurnFilter";

test("ChatGPT search highlight mirrors are not managed as conversation turns", () => {
    const chatGpt = SITES.find((site) => site.id === "chatgpt");
    expect(chatGpt).toBeDefined();
    expect(chatGpt!.selectors.excludedMessageAncestorSelectors).toContain(
        '[class*="convSearchResultHighlightRoot"]',
    );

    const mirror = {
        id: "mirror-turn",
        closest: (selector: string) =>
            selector.includes("convSearchResultHighlightRoot") ? {} : null,
    } as unknown as HTMLElement;
    const real = {
        id: "real-turn",
        closest: () => null,
    } as unknown as HTMLElement;

    expect(filterMessageTurns([mirror, real], chatGpt!.selectors).map((element) => element.id))
        .toEqual(["real-turn"]);
});
