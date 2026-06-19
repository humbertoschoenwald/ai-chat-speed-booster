/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: derive ChatGPT Stable Mode display counts from unique conversation turns.
 * Boundary: pure DOM read model; no mutation, storage, or content-script lifecycle orchestration.
 */
import type { ExtensionStatus } from "../../../shared/types";

const HIDDEN_TURN_SELECTOR = ".acsb-hidden";

export function createChatGptLogicalDisplayStatus(
    turns: readonly HTMLElement[],
    status: ExtensionStatus,
): ExtensionStatus {
    const logicalTurns = dedupeChatGptTurns(turns);
    if (logicalTurns.length === 0) return status;

    const visibleTurns = logicalTurns.filter(isVisibleTurn);
    return {
        ...status,
        totalMessages: logicalTurns.length,
        visibleMessages: visibleTurns.length,
        hiddenMessages: Math.max(0, logicalTurns.length - visibleTurns.length),
    };
}

function dedupeChatGptTurns(turns: readonly HTMLElement[]): HTMLElement[] {
    const seen = new Set<string>();
    const result: HTMLElement[] = [];

    turns.forEach((turn, index) => {
        const key = deriveTurnKey(turn, index);
        if (seen.has(key)) return;
        seen.add(key);
        result.push(turn);
    });

    return result;
}

function deriveTurnKey(turn: HTMLElement, index: number): string {
    return turn.getAttribute("data-turn-id")
        ?? turn.getAttribute("data-turn-id-container")
        ?? turn.getAttribute("data-testid")
        ?? turn.getAttribute("data-message-id")
        ?? `fallback:${index}`;
}

function isVisibleTurn(turn: HTMLElement): boolean {
    return turn.closest(HIDDEN_TURN_SELECTOR) === null;
}
