export function resolveChatGptConversationScope(
    documentRoot: Document,
    scrollContainer: HTMLElement | null,
): ParentNode {
    return scrollContainer ?? documentRoot;
}
