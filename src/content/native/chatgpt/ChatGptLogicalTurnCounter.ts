/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: derive ChatGPT Stable Mode display counts from unique conversation turns.
 * Boundary: pure DOM read model; no mutation, storage, or content-script lifecycle orchestration.
 * ADR: docs/adr/architecture/message-management/stable-fast-logical-message-contract.md.
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
    const totalMessages = Math.min(status.totalMessages, logicalTurns.length);
    const visibleMessages = Math.min(status.visibleMessages, visibleTurns.length, totalMessages);
    return {
        ...status,
        totalMessages,
        visibleMessages,
        hiddenMessages: Math.max(0, totalMessages - visibleMessages),
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
