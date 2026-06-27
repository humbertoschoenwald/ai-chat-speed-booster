import { CHATGPT_TURN_SELECTOR } from "./ChatGptSelectors";

export interface ChatGptToastPortalBoundarySnapshot {
    readonly portalNodeCount: number;
    readonly toastNodeCount: number;
    readonly liveStatusNodeCount: number;
    readonly conversationOwnedStatusCount: number;
}

const PORTAL_SELECTOR = [
    "[data-radix-portal]",
    "[data-headlessui-portal]",
    "[data-reach-portal]",
    "[id*='portal' i]",
].join(",");
const TOAST_SELECTOR = [
    "[data-testid*='toast' i]",
    "[class*='toast' i]",
    "[aria-label*='notification' i]",
].join(",");
const LIVE_STATUS_SELECTOR = [
    "[role='alert']",
    "[role='status']",
    "[aria-live='polite']",
    "[aria-live='assertive']",
].join(",");
const TOAST_PORTAL_SELECTOR = [PORTAL_SELECTOR, TOAST_SELECTOR, LIVE_STATUS_SELECTOR].join(",");

export function isChatGptToastPortalNode(element: HTMLElement): boolean {
    if (element.closest(CHATGPT_TURN_SELECTOR)) return false;
    return element.matches?.(TOAST_PORTAL_SELECTOR) === true
        || (element.closest?.(PORTAL_SELECTOR) ?? null) !== null
        || (element.closest?.(TOAST_SELECTOR) ?? null) !== null;
}

export function inspectChatGptToastPortalBoundary(root: ParentNode): ChatGptToastPortalBoundarySnapshot {
    const portals = unique(query(root, PORTAL_SELECTOR));
    const toasts = unique(query(root, TOAST_SELECTOR));
    const liveStatuses = unique(query(root, LIVE_STATUS_SELECTOR));
    return {
        portalNodeCount: portals.filter((node) => !node.closest(CHATGPT_TURN_SELECTOR)).length,
        toastNodeCount: toasts.filter((node) => !node.closest(CHATGPT_TURN_SELECTOR)).length,
        liveStatusNodeCount: liveStatuses.filter((node) => !node.closest(CHATGPT_TURN_SELECTOR)).length,
        conversationOwnedStatusCount: liveStatuses.filter((node) => node.closest(CHATGPT_TURN_SELECTOR) !== null).length,
    };
}

export function getChatGptToastPortalSelectorForTests(): string {
    return TOAST_PORTAL_SELECTOR;
}

function query(root: ParentNode, selector: string): HTMLElement[] {
    return Array.from(root.querySelectorAll?.<HTMLElement>(selector) ?? []);
}

function unique(elements: readonly HTMLElement[]): HTMLElement[] {
    return [...new Set(elements)];
}
