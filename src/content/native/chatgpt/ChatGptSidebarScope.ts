export const CHATGPT_SIDEBAR_SCOPE_SELECTOR = "nav,aside,[role='navigation'],[data-testid*='sidebar' i],[data-testid*='history' i]";

export function isChatGptSidebarListNode(element: HTMLElement): boolean {
    return element.matches?.(CHATGPT_SIDEBAR_SCOPE_SELECTOR) === true
        || (element.closest?.(CHATGPT_SIDEBAR_SCOPE_SELECTOR) ?? null) !== null;
}

export function getChatGptSidebarListSelectorForTests(): string {
    return CHATGPT_SIDEBAR_SCOPE_SELECTOR;
}
