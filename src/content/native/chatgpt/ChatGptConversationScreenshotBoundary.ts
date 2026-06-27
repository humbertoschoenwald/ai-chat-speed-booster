export interface ChatGptConversationScreenshotBoundarySnapshot {
    readonly boundaryNodeCount: number;
    readonly protectedTurnCount: number;
}

const CONVERSATION_SCREENSHOT_BOUNDARY_SELECTOR = "[data-conversation-screenshot-content]";

export function isChatGptConversationScreenshotBoundary(element: HTMLElement): boolean {
    return element.matches?.(CONVERSATION_SCREENSHOT_BOUNDARY_SELECTOR) === true
        || (element.closest?.(CONVERSATION_SCREENSHOT_BOUNDARY_SELECTOR) ?? null) !== null;
}

export function containsChatGptConversationScreenshotBoundary(root: ParentNode): boolean {
    return root.querySelector?.(CONVERSATION_SCREENSHOT_BOUNDARY_SELECTOR) !== null;
}

export function inspectChatGptConversationScreenshotBoundary(root: ParentNode, turns: readonly HTMLElement[]): ChatGptConversationScreenshotBoundarySnapshot {
    const boundaries = Array.from(root.querySelectorAll?.<HTMLElement>(CONVERSATION_SCREENSHOT_BOUNDARY_SELECTOR) ?? []);
    return {
        boundaryNodeCount: boundaries.length,
        protectedTurnCount: turns.filter((turn) => isChatGptConversationScreenshotBoundary(turn)).length,
    };
}

export function getChatGptConversationScreenshotBoundarySelectorForTests(): string {
    return CONVERSATION_SCREENSHOT_BOUNDARY_SELECTOR;
}
