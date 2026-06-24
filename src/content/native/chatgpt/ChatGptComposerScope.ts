export interface ChatGptComposerScopeSnapshot {
    readonly composerButtons: number;
    readonly composerSvgs: number;
    readonly composerEditableNodes: number;
}

const COMPOSER_ROOT_SELECTOR = [
    "form",
    "[data-testid*='composer' i]",
    "[aria-label*='message' i]",
].join(",");
const COMPOSER_EDITABLE_SELECTOR = [
    "textarea",
    "[contenteditable='true']",
    ".ProseMirror",
].join(",");
const COMPOSER_BUTTON_SELECTOR = `${COMPOSER_ROOT_SELECTOR} button,${COMPOSER_ROOT_SELECTOR} [role='button']`;
const COMPOSER_SVG_SELECTOR = `${COMPOSER_ROOT_SELECTOR} svg`;

export function isInChatGptComposerScope(element: HTMLElement): boolean {
    return element.matches?.(COMPOSER_ROOT_SELECTOR) === true
        || element.matches?.(COMPOSER_EDITABLE_SELECTOR) === true
        || (element.closest?.(COMPOSER_ROOT_SELECTOR) ?? null) !== null
        || (element.closest?.(COMPOSER_EDITABLE_SELECTOR) ?? null) !== null;
}

export function containsChatGptComposerScope(element: HTMLElement): boolean {
    return isInChatGptComposerScope(element)
        || (element.querySelector?.(COMPOSER_ROOT_SELECTOR) ?? null) !== null
        || (element.querySelector?.(COMPOSER_EDITABLE_SELECTOR) ?? null) !== null;
}

export function filterChatGptComposerScopeElements(elements: readonly HTMLElement[]): HTMLElement[] {
    return elements.filter((element) => !isInChatGptComposerScope(element));
}

export function createChatGptComposerScopeSnapshot(root: ParentNode): ChatGptComposerScopeSnapshot {
    const composerButtons = uniqueElements(query(root, COMPOSER_BUTTON_SELECTOR));
    const composerSvgs = uniqueElements(query(root, COMPOSER_SVG_SELECTOR));
    const composerEditableNodes = uniqueElements(query(root, COMPOSER_EDITABLE_SELECTOR));
    return {
        composerButtons: composerButtons.length,
        composerSvgs: composerSvgs.length,
        composerEditableNodes: composerEditableNodes.length,
    };
}

function query(root: ParentNode, selector: string): HTMLElement[] {
    return Array.from(root.querySelectorAll<HTMLElement>(selector));
}

function uniqueElements(elements: readonly HTMLElement[]): HTMLElement[] {
    return [...new Set(elements)];
}
