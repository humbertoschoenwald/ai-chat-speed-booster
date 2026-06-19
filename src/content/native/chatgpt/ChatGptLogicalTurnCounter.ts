/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: derive ChatGPT Stable Mode display counts from logical conversation turns.
 * Boundary: pure DOM read model; no mutation, storage, or content-script lifecycle orchestration.
 * ADR: docs/adr/architecture/message-management/tracked-message-index.md.
 */
import type { ExtensionStatus } from "../../../shared/types";

const CHATGPT_RENDERED_MESSAGE_SELECTOR = "[data-message-author-role][data-message-id]";
const HIDDEN_TURN_SELECTOR = ".acsb-hidden";

type ChatGptTurnRole = "user" | "assistant" | "unknown";

interface LogicalTurnCounts {
    readonly userTurns: number;
    readonly assistantTurns: number;
}

export function createChatGptLogicalDisplayStatus(
    turns: readonly HTMLElement[],
    status: ExtensionStatus,
): ExtensionStatus {
    const total = countLogicalTurns(turns);
    if (total.userTurns + total.assistantTurns === 0) return status;

    const visible = countLogicalTurns(turns.filter(isVisibleTurn));
    const totalMessages = collapseConversationTurns(total);
    const visibleMessages = collapseConversationTurns(visible);

    return {
        ...status,
        totalMessages,
        visibleMessages,
        hiddenMessages: Math.max(0, totalMessages - visibleMessages),
    };
}

function countLogicalTurns(turns: readonly HTMLElement[]): LogicalTurnCounts {
    let userTurns = 0;
    let assistantTurns = 0;

    for (const turn of turns) {
        const role = classifyTurnRole(turn);
        if (role === "user") userTurns++;
        if (role === "assistant") assistantTurns++;
    }

    return { userTurns, assistantTurns };
}

function classifyTurnRole(turn: HTMLElement): ChatGptTurnRole {
    const roleNodes = Array.from(
        turn.querySelectorAll<HTMLElement>(CHATGPT_RENDERED_MESSAGE_SELECTOR),
    );
    if (roleNodes.some((node) => node.dataset.messageAuthorRole === "user")) return "user";
    if (roleNodes.some((node) => node.dataset.messageAuthorRole === "assistant")) return "assistant";
    return "unknown";
}

function collapseConversationTurns(counts: LogicalTurnCounts): number {
    if (counts.userTurns > 0 && counts.assistantTurns > 0) {
        return Math.max(counts.userTurns, counts.assistantTurns);
    }
    return counts.userTurns + counts.assistantTurns;
}

function isVisibleTurn(turn: HTMLElement): boolean {
    return turn.closest(HIDDEN_TURN_SELECTOR) === null;
}
