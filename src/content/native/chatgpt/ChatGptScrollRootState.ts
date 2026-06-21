export interface ChatGptScrollRootState {
    readonly rootPresent: boolean;
    readonly streamActive: boolean;
    readonly scrollFromTop: number | null;
    readonly scrolledFromEnd: boolean | null;
    readonly shouldDeferOldTurnWork: boolean;
}

export function readChatGptScrollRootState(root: HTMLElement | null): ChatGptScrollRootState {
    if (!root) {
        return {
            rootPresent: false,
            streamActive: true,
            scrollFromTop: null,
            scrolledFromEnd: null,
            shouldDeferOldTurnWork: true,
        };
    }
    const streamActive = readBooleanAttr(root, "data-stream-active") ?? false;
    const scrolledFromEnd = readBooleanAttr(root, "data-scrolled-from-end");
    const scrollFromTop = readNumberAttr(root, "data-scroll-from-top");
    return {
        rootPresent: true,
        streamActive,
        scrollFromTop,
        scrolledFromEnd,
        shouldDeferOldTurnWork: streamActive || scrolledFromEnd === false,
    };
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
