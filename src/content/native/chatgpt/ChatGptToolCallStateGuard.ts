export type ChatGptToolCallState =
    | "active"
    | "loading"
    | "completed-collapsed"
    | "completed-expanded"
    | "error"
    | "unknown";

const LOADING_SELECTOR = [
    ".loading-shimmer",
    ".animate-spin",
    "[aria-busy='true']",
    "[data-is-streaming='true']",
].join(",");

const ERROR_SELECTOR = [
    ".text-token-text-error",
    "[role='alert']",
    "[data-testid*='error' i]",
    "[class*='error' i]",
].join(",");

export function classifyChatGptToolCallState(element: HTMLElement): ChatGptToolCallState {
    if (matchesOrContains(element, ERROR_SELECTOR)) return "error";
    if (matchesOrContains(element, LOADING_SELECTOR)) return "loading";

    const text = readNormalizedText(element).toLowerCase();
    if (text.includes("calling tool") || text.includes("working on it")) return "active";
    if (element.getAttribute("aria-expanded") === "true") return "completed-expanded";
    if (element.getAttribute("data-state") === "open") return "completed-expanded";
    if (element.getAttribute("data-state") === "closed") return "completed-collapsed";
    if (element.querySelector("[data-state='open']")) return "completed-expanded";
    if (element.querySelector("[data-state='closed']")) return "completed-collapsed";

    return "unknown";
}

export function isUnsafeChatGptToolCallState(state: ChatGptToolCallState): boolean {
    return state !== "completed-collapsed";
}

export function canApplyStaticToolCallSummary(element: HTMLElement): boolean {
    return classifyChatGptToolCallState(element) === "completed-collapsed";
}

function matchesOrContains(element: HTMLElement, selector: string): boolean {
    return element.matches(selector) || element.querySelector(selector) !== null;
}

function readNormalizedText(element: HTMLElement): string {
    return (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim();
}
