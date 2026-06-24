export interface ChatGptScrollRootState {
    readonly rootPresent: boolean;
    readonly streamActive: boolean;
    readonly scrollFromTop: number | null;
    readonly scrolledFromEnd: boolean | null;
    readonly openInteractionSurface: boolean;
    readonly shouldDeferOldTurnWork: boolean;
}

const CHATGPT_OPEN_INTERACTION_SELECTOR = "[data-state='open'],[role='dialog'],[role='menu'],[aria-expanded='true']";

export function readChatGptScrollRootState(root: HTMLElement | null, openInteractionSurfaceOverride?: boolean): ChatGptScrollRootState {
    if (!root) {
        return {
            rootPresent: false,
            streamActive: true,
            scrollFromTop: null,
            scrolledFromEnd: null,
            openInteractionSurface: false,
            shouldDeferOldTurnWork: true,
        };
    }
    const streamActive = readBooleanAttr(root, "data-stream-active") ?? false;
    const scrolledFromEnd = readBooleanAttr(root, "data-scrolled-from-end");
    const scrollFromTop = readNumberAttr(root, "data-scroll-from-top");
    const openInteractionSurface = openInteractionSurfaceOverride ?? hasOpenInteractionSurface(root);
    return {
        rootPresent: true,
        streamActive,
        scrollFromTop,
        scrolledFromEnd,
        openInteractionSurface,
        shouldDeferOldTurnWork: streamActive
            || openInteractionSurface
            || scrolledFromEnd === false
            || (scrolledFromEnd === null && scrollFromTop !== null && scrollFromTop > 0),
    };
}

function hasOpenInteractionSurface(root: HTMLElement): boolean {
    return root.matches?.(CHATGPT_OPEN_INTERACTION_SELECTOR) === true
        || (root.querySelector?.(CHATGPT_OPEN_INTERACTION_SELECTOR) ?? null) !== null;
}

function readBooleanAttr(root: HTMLElement, name: string): boolean | null {
    const value = root.getAttribute(name);
    if (value === null) return null;
    return value === "true" || value === "1";
}

function readNumberAttr(root: HTMLElement, name: string): number | null {
    const value = Number(root.getAttribute(name) ?? "");
    return Number.isFinite(value) ? value : null;
}
