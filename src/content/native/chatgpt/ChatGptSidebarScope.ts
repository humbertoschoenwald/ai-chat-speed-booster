export interface ChatGptSidebarActiveMarkerSnapshot {
    readonly activeSidebarLinkCount: number;
    readonly activeMarkerCount: number;
}

export const CHATGPT_SIDEBAR_SCOPE_SELECTOR = "nav,aside,[role='navigation'],[data-testid*='sidebar' i],[data-testid*='history' i]";
const SIDEBAR_ACTIVE_MARKER_SELECTOR = "[data-active='true'],[aria-current='page'],[aria-selected='true']";

export function isChatGptSidebarListNode(element: HTMLElement): boolean {
    return element.matches?.(CHATGPT_SIDEBAR_SCOPE_SELECTOR) === true
        || (element.closest?.(CHATGPT_SIDEBAR_SCOPE_SELECTOR) ?? null) !== null;
}

export function getChatGptSidebarListSelectorForTests(): string {
    return CHATGPT_SIDEBAR_SCOPE_SELECTOR;
}

export function inspectChatGptSidebarActiveMarkers(root: ParentNode): ChatGptSidebarActiveMarkerSnapshot {
    const activeMarkers = Array.from(root.querySelectorAll?.<HTMLElement>(SIDEBAR_ACTIVE_MARKER_SELECTOR) ?? [])
        .filter((element) => element.closest(CHATGPT_SIDEBAR_SCOPE_SELECTOR) !== null);
    return {
        activeSidebarLinkCount: activeMarkers.filter((element) => element.matches("a,button,[role='link'],[role='button']")).length,
        activeMarkerCount: activeMarkers.length,
    };
}

export function getChatGptSidebarActiveMarkerSelectorForTests(): string {
    return SIDEBAR_ACTIVE_MARKER_SELECTOR;
}
