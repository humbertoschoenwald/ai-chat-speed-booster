/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: centralize provider-configured exclusions for message-turn candidates.
 * Boundary: pure selector filtering only; DOM observation and message state live elsewhere.
 * ADR: docs/adr/architecture/message-management/chatgpt-search-highlight-exclusion.md.
 */
import type { SiteSelectors } from "./sites";

export function isExcludedMessageTurn(element: Element, selectors: SiteSelectors): boolean {
    return selectors.excludedMessageAncestorSelectors?.some((selector) =>
        element.closest(selector) !== null,
    ) ?? false;
}

export function filterMessageTurns<T extends Element>(
    elements: readonly T[],
    selectors: SiteSelectors,
): T[] {
    return elements.filter((element) => !isExcludedMessageTurn(element, selectors));
}
