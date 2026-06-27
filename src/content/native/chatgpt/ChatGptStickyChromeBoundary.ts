export interface ChatGptStickyChromeBoundarySnapshot {
    readonly stickyNodeCount: number;
    readonly fixedNodeCount: number;
    readonly headerNodeCount: number;
}

const STICKY_CHROME_SELECTOR = [
    "header",
    "[role='banner']",
    "[data-testid*='header' i]",
    "[style*='position: sticky' i]",
    "[style*='position:fixed' i]",
    "[style*='position: fixed' i]",
].join(",");
const STICKY_POSITION_SELECTOR = "[style*='position: sticky' i]";
const FIXED_POSITION_SELECTOR = "[style*='position: fixed' i],[style*='position:fixed' i]";
const HEADER_SELECTOR = "header,[role='banner'],[data-testid*='header' i]";

export function isChatGptStickyChromeNode(element: HTMLElement): boolean {
    return element.matches?.(STICKY_CHROME_SELECTOR) === true
        || (element.closest?.(STICKY_CHROME_SELECTOR) ?? null) !== null;
}

export function inspectChatGptStickyChromeBoundary(root: ParentNode): ChatGptStickyChromeBoundarySnapshot {
    return {
        stickyNodeCount: query(root, STICKY_POSITION_SELECTOR).length,
        fixedNodeCount: query(root, FIXED_POSITION_SELECTOR).length,
        headerNodeCount: query(root, HEADER_SELECTOR).length,
    };
}

export function getChatGptStickyChromeSelectorForTests(): string {
    return STICKY_CHROME_SELECTOR;
}

function query(root: ParentNode, selector: string): HTMLElement[] {
    return Array.from(root.querySelectorAll?.<HTMLElement>(selector) ?? []);
}
