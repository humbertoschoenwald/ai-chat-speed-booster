import { readUnambiguousChatGptTestId } from "./ChatGptAmbiguousTestIdAvoidance";

export const CHATGPT_SECTION_TURN_SELECTOR = "section[data-testid^='conversation-turn-']";
export const CHATGPT_TURN_SELECTOR = `${CHATGPT_SECTION_TURN_SELECTOR},[data-turn-id-container],article[data-testid^='conversation-turn-']`;
export const CHATGPT_ERROR_SELECTOR = ".text-token-text-error, [aria-label*='Regenerate'], [aria-label*='Retry']";
export const CHATGPT_TOOL_SELECTOR = "[data-message-author-role='tool'], [aria-label*='tool' i]";
export const CHATGPT_STREAMING_SELECTOR = '[aria-label*="Stop"], [data-is-streaming="true"], [aria-busy="true"]';

export function readChatGptTurnId(turn: HTMLElement): string | null {
    return turn.getAttribute("data-turn-id")
        ?? turn.getAttribute("data-turn-id-container")
        ?? readUnambiguousChatGptTestId(turn);
}

export function readChatGptLastKnownHeight(turn: HTMLElement): number | null {
    const wrapper = resolveChatGptTurnWrapper(turn);
    const styleValue = wrapper.style?.getPropertyValue?.("--last-known-height")?.trim() ?? "";
    const inlineValue = wrapper.getAttribute("style")?.match(/--last-known-height:\s*([0-9.]+)px/i)?.[1] ?? "";
    const parsed = parseFloat(styleValue.endsWith("px") ? styleValue.slice(0, -2) : styleValue || inlineValue);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return Math.max(120, Math.min(2400, Math.round(parsed)));
}

export function resolveChatGptTurnWrapper(turn: HTMLElement): HTMLElement {
    const id = readChatGptTurnId(turn);
    let wrapper = turn.closest<HTMLElement>("[data-turn-id-container]") ?? turn;
    let candidate = wrapper.parentElement?.closest<HTMLElement>("[data-turn-id-container]") ?? null;
    while (candidate && id && candidate.getAttribute("data-turn-id-container") === id) {
        wrapper = candidate;
        candidate = candidate.parentElement?.closest<HTMLElement>("[data-turn-id-container]") ?? null;
    }
    return wrapper;
}

export function dedupeChatGptTurnElements(turns: readonly HTMLElement[]): HTMLElement[] {
    const byId = new Map<string, HTMLElement>();
    const anonymous: HTMLElement[] = [];
    for (const turn of turns) {
        const id = readChatGptTurnId(turn);
        if (!id) {
            anonymous.push(turn);
            continue;
        }
        const existing = byId.get(id);
        if (!existing || prefersCanonicalTurn(turn, existing)) byId.set(id, turn);
    }
    return [...byId.values(), ...anonymous];
}

function prefersCanonicalTurn(candidate: HTMLElement, current: HTMLElement): boolean {
    const candidateIsSection = candidate.matches(CHATGPT_SECTION_TURN_SELECTOR);
    const currentIsSection = current.matches(CHATGPT_SECTION_TURN_SELECTOR);
    if (candidateIsSection !== currentIsSection) return candidateIsSection;
    return candidate.getAttribute("data-turn-id") !== null && current.getAttribute("data-turn-id") === null;
}
