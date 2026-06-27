export interface ChatGptSkipToContentPreservationSnapshot {
    readonly skipLinkCount: number;
    readonly screenReaderOnlyCount: number;
    readonly targetPresent: boolean;
}

const SKIP_TO_CONTENT_SELECTOR = [
    "[data-skip-to-content]",
    "a[href='#main']",
    "a[href='#content']",
    "a[href*='main-content' i]",
].join(",");
const SCREEN_READER_ONLY_SELECTOR = ".sr-only,[class*='sr-only' i],[data-sr-only='true']";
const MAIN_CONTENT_TARGET_SELECTOR = "main,#main,#content,[role='main'],[data-testid*='conversation' i]";
const PROTECTED_ACCESSIBILITY_NAV_SELECTOR = [SKIP_TO_CONTENT_SELECTOR, SCREEN_READER_ONLY_SELECTOR].join(",");

export function isChatGptProtectedAccessibilityNavNode(element: HTMLElement): boolean {
    return element.matches?.(PROTECTED_ACCESSIBILITY_NAV_SELECTOR) === true
        || (element.closest?.(PROTECTED_ACCESSIBILITY_NAV_SELECTOR) ?? null) !== null;
}

export function inspectChatGptSkipToContentPreservation(root: ParentNode): ChatGptSkipToContentPreservationSnapshot {
    return {
        skipLinkCount: query(root, SKIP_TO_CONTENT_SELECTOR).length,
        screenReaderOnlyCount: query(root, SCREEN_READER_ONLY_SELECTOR).length,
        targetPresent: root.querySelector?.(MAIN_CONTENT_TARGET_SELECTOR) !== null,
    };
}

export function getChatGptSkipToContentSelectorsForTests(): readonly string[] {
    return [SKIP_TO_CONTENT_SELECTOR, SCREEN_READER_ONLY_SELECTOR, MAIN_CONTENT_TARGET_SELECTOR];
}

function query(root: ParentNode, selector: string): HTMLElement[] {
    return Array.from(root.querySelectorAll?.<HTMLElement>(selector) ?? []);
}
