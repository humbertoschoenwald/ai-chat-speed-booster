export type ChatGptThreadStatusKind = "none" | "readonly" | "transient" | "unknown";

export interface ChatGptThreadStatusSnapshot {
    readonly detected: boolean;
    readonly kind: ChatGptThreadStatusKind;
    readonly reason: string | null;
    readonly controlCount: number;
}

const THREAD_STATUS_SELECTOR = [
    "[role='status']",
    "[aria-live='polite']",
    "[aria-live='assertive']",
    "[data-testid*='conversation-error' i]",
    "[data-testid*='thread-error' i]",
].join(",");
const READONLY_STATUS_PATTERNS = [
    /maximum conversation length/i,
    /conversation.*maximum length/i,
    /conversation.*too long/i,
    /maximum.*context/i,
    /start a new chat/i,
];
const TRANSIENT_STATUS_PATTERNS = [
    /reconnecting/i,
    /trying again/i,
    /working on it/i,
];
const STATUS_CONTROL_SELECTOR = "button,[role='button'],a[href]";

export function classifyChatGptThreadStatus(root: ParentNode = document): ChatGptThreadStatusSnapshot {
    const statusNodes = Array.from(root.querySelectorAll?.<HTMLElement>(THREAD_STATUS_SELECTOR) ?? []);
    const scopedText = statusNodes.map((node) => node.textContent ?? "").join(" ").trim();
    const text = scopedText || readRootText(root);
    const readonlyReason = findPattern(text, READONLY_STATUS_PATTERNS);
    if (readonlyReason) {
        return {
            detected: true,
            kind: "readonly",
            reason: readonlyReason,
            controlCount: countControls(statusNodes),
        };
    }
    const transientReason = findPattern(text, TRANSIENT_STATUS_PATTERNS);
    if (transientReason) {
        return {
            detected: true,
            kind: "transient",
            reason: transientReason,
            controlCount: countControls(statusNodes),
        };
    }
    if (statusNodes.length > 0) {
        return {
            detected: true,
            kind: "unknown",
            reason: "chatgpt-thread-status-surface",
            controlCount: countControls(statusNodes),
        };
    }
    return {
        detected: false,
        kind: "none",
        reason: null,
        controlCount: 0,
    };
}

function findPattern(text: string, patterns: readonly RegExp[]): string | null {
    return patterns.find((pattern) => pattern.test(text))?.source ?? null;
}

function countControls(nodes: readonly HTMLElement[]): number {
    return nodes.reduce((total, node) => total + node.querySelectorAll(STATUS_CONTROL_SELECTOR).length, 0);
}

function readRootText(root: ParentNode): string {
    const isDocument = typeof Document !== "undefined" && root instanceof Document;
    return ((isDocument ? root.body?.innerText : root.textContent) ?? "").trim();
}
