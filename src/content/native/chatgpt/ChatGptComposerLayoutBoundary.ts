export interface ChatGptComposerLayoutBoundarySnapshot {
    readonly boundaryNodeCount: number;
    readonly expandedNodeCount: number;
    readonly headerNodeCount: number;
}

const COMPOSER_LAYOUT_BOUNDARY_SELECTOR = [
    "[data-testid*='composer' i]",
    "[data-testid*='prompt-textarea' i]",
    "[data-virtualkeyboard]",
    "[aria-controls*='composer' i]",
].join(",");
const COMPOSER_EXPANDED_SELECTOR = "[aria-expanded='true'],[data-expanded='true']";
const COMPOSER_HEADER_SELECTOR = "[data-testid*='prompt-textarea' i],[aria-label*='prompt' i]";

export function isChatGptComposerLayoutBoundary(element: HTMLElement): boolean {
    return element.matches?.(COMPOSER_LAYOUT_BOUNDARY_SELECTOR) === true
        || (element.closest?.(COMPOSER_LAYOUT_BOUNDARY_SELECTOR) ?? null) !== null;
}

export function inspectChatGptComposerLayoutBoundary(root: ParentNode): ChatGptComposerLayoutBoundarySnapshot {
    return {
        boundaryNodeCount: query(root, COMPOSER_LAYOUT_BOUNDARY_SELECTOR).length,
        expandedNodeCount: query(root, COMPOSER_EXPANDED_SELECTOR).filter(isChatGptComposerLayoutBoundary).length,
        headerNodeCount: query(root, COMPOSER_HEADER_SELECTOR).length,
    };
}

export function getChatGptComposerLayoutBoundarySelectorsForTests(): readonly string[] {
    return [COMPOSER_LAYOUT_BOUNDARY_SELECTOR, COMPOSER_EXPANDED_SELECTOR, COMPOSER_HEADER_SELECTOR];
}

function query(root: ParentNode, selector: string): HTMLElement[] {
    return Array.from(root.querySelectorAll?.<HTMLElement>(selector) ?? []);
}
