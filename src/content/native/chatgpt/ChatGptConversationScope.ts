const CHATGPT_CONVERSATION_SCOPE_SELECTOR = [
    "main",
    "[data-testid='conversation-turns']",
    "[data-testid*='conversation' i]",
].join(",");

export function resolveChatGptConversationScope(
    documentRoot: Document,
    scrollContainer: HTMLElement | null,
): ParentNode {
    if (scrollContainer) return scrollContainer;
    return documentRoot.querySelector?.<HTMLElement>(CHATGPT_CONVERSATION_SCOPE_SELECTOR) ?? documentRoot.body ?? documentRoot;
}

export function getChatGptConversationScopeSelectorForTests(): string {
    return CHATGPT_CONVERSATION_SCOPE_SELECTOR;
}
