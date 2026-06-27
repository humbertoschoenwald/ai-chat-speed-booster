import { CHATGPT_TURN_SELECTOR } from "./ChatGptSelectors";

export interface ChatGptAccessibleStatusPreservationSnapshot {
    readonly statusNodeCount: number;
    readonly turnScopedStatusNodeCount: number;
    readonly globalStatusNodeCount: number;
}

export const CHATGPT_ACCESSIBLE_STATUS_SELECTOR = [
    "[role='status']",
    "[role='alert']",
    "[aria-live='polite']",
    "[aria-live='assertive']",
].join(",");

export function isChatGptAccessibleStatusNode(element: HTMLElement): boolean {
    return element.matches?.(CHATGPT_ACCESSIBLE_STATUS_SELECTOR) === true
        || (element.closest?.(CHATGPT_ACCESSIBLE_STATUS_SELECTOR) ?? null) !== null;
}

export function containsChatGptAccessibleStatus(root: ParentNode): boolean {
    return root.querySelector?.(CHATGPT_ACCESSIBLE_STATUS_SELECTOR) !== null;
}

export function inspectChatGptAccessibleStatusPreservation(root: ParentNode): ChatGptAccessibleStatusPreservationSnapshot {
    const nodes = Array.from(root.querySelectorAll?.<HTMLElement>(CHATGPT_ACCESSIBLE_STATUS_SELECTOR) ?? []);
    const turnScopedStatusNodeCount = nodes.filter((node) => node.closest(CHATGPT_TURN_SELECTOR) !== null).length;
    return {
        statusNodeCount: nodes.length,
        turnScopedStatusNodeCount,
        globalStatusNodeCount: nodes.length - turnScopedStatusNodeCount,
    };
}
