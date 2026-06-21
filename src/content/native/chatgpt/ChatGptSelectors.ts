export const CHATGPT_SECTION_TURN_SELECTOR = "section[data-testid^='conversation-turn-']";
export const CHATGPT_TURN_SELECTOR = `${CHATGPT_SECTION_TURN_SELECTOR},[data-turn-id-container],article[data-testid^='conversation-turn-']`;
export const CHATGPT_ERROR_SELECTOR = ".text-token-text-error, [data-testid*='error'], [aria-label*='Regenerate'], [aria-label*='Retry']";
export const CHATGPT_TOOL_SELECTOR = "[data-testid*='tool'], [data-message-author-role='tool']";
export const CHATGPT_STREAMING_SELECTOR = '[aria-label*="Stop"], [data-testid*="stop"], [data-is-streaming="true"], [aria-busy="true"]';

export function readChatGptTurnId(turn: HTMLElement): string | null {
    return turn.getAttribute("data-turn-id")
        ?? turn.getAttribute("data-turn-id-container")
        ?? turn.getAttribute("data-testid");
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
