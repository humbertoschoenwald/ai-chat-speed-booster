export type ChatGptTerminalMarkdownFastPathStatus = "simple" | "missing-marker" | "inconsistent" | "active";

export interface ChatGptTerminalMarkdownFastPathResult {
    readonly status: ChatGptTerminalMarkdownFastPathStatus;
    readonly text: string;
}

const TERMINAL_ONLY_NODE_SELECTOR = "[data-is-only-node='true']";
const TERMINAL_LAST_NODE_SELECTOR = "[data-is-last-node='true']";
const ACTIVE_MARKER_SELECTOR = ".loading-shimmer,.animate-spin,[data-is-streaming='true'],[aria-busy='true']";

export function readChatGptTerminalMarkdownNodeText(turn: HTMLElement): ChatGptTerminalMarkdownFastPathResult {
    if (turn.querySelector(ACTIVE_MARKER_SELECTOR)) return { status: "active", text: "" };
    const onlyNodes = Array.from(turn.querySelectorAll<HTMLElement>(TERMINAL_ONLY_NODE_SELECTOR));
    const lastNodes = Array.from(turn.querySelectorAll<HTMLElement>(TERMINAL_LAST_NODE_SELECTOR));
    if (onlyNodes.length === 0 && lastNodes.length === 0) return { status: "missing-marker", text: "" };
    if (onlyNodes.length === 1 && lastNodes.length <= 1) return readSimpleNodeText(onlyNodes[0]);
    if (onlyNodes.length === 0 && lastNodes.length === 1) return readSimpleNodeText(lastNodes[0]);
    return { status: "inconsistent", text: "" };
}

export function hasInconsistentChatGptTerminalMarkdownMarkers(turn: HTMLElement): boolean {
    return readChatGptTerminalMarkdownNodeText(turn).status === "inconsistent";
}

export function getChatGptTerminalMarkdownSelectorsForTests(): readonly string[] {
    return [TERMINAL_ONLY_NODE_SELECTOR, TERMINAL_LAST_NODE_SELECTOR];
}

function readSimpleNodeText(node: HTMLElement): ChatGptTerminalMarkdownFastPathResult {
    const text = (node.innerText || node.textContent || "").replace(/\s+/g, " ").trim();
    return text ? { status: "simple", text } : { status: "inconsistent", text: "" };
}
