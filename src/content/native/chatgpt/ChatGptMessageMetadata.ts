import type { NativeTurnRecord } from "../TurnRegistry";

export interface ChatGptMessageMetadata {
    readonly messageId: string | null;
    readonly turnId: string | null;
    readonly testId: string | null;
    readonly authorRole: string | null;
    readonly modelLabel: string | null;
}

export interface ChatGptMessageMetadataSummary {
    readonly totalTurns: number;
    readonly messageIdCount: number;
    readonly missingMessageIdCount: number;
    readonly repeatedMessageIdCount: number;
    readonly currentAssistant: ChatGptMessageMetadata | null;
    readonly roleSourceCounts: Record<string, number>;
    readonly roleConfidenceCounts: Record<string, number>;
    readonly unknownRoleCount: number;
}

const MESSAGE_ID_ATTRS = ["data-message-id", "data-testid", "data-turn-id", "data-turn-id-container"] as const;
const MODEL_LABEL_ATTRS = ["data-message-model-slug", "data-message-model", "data-model-slug", "data-model"] as const;

export function readChatGptMessageMetadata(turn: HTMLElement): ChatGptMessageMetadata {
    const messageRoot = turn.matches?.("[data-message-id],[data-message-author-role]") === true
        ? turn
        : turn.querySelector<HTMLElement>("[data-message-id],[data-message-author-role]") ?? turn;
    return {
        messageId: firstAttr(messageRoot, ["data-message-id", "data-turn-id", "data-turn-id-container"]),
        turnId: firstAttr(turn, ["data-turn-id", "data-turn-id-container"]),
        testId: turn.getAttribute("data-testid"),
        authorRole: firstAttr(messageRoot, ["data-message-author-role", "data-author"]),
        modelLabel: firstAttr(messageRoot, MODEL_LABEL_ATTRS),
    };
}

export function readChatGptMessageIdentityKey(turn: HTMLElement): string | null {
    const metadata = readChatGptMessageMetadata(turn);
    for (const value of [metadata.messageId, metadata.turnId, metadata.testId]) {
        if (value) return value;
    }
    return firstAttr(turn, MESSAGE_ID_ATTRS);
}

export function createChatGptMessageMetadataSummary(records: readonly NativeTurnRecord[]): ChatGptMessageMetadataSummary {
    const countsByMessageId = new Map<string, number>();
    let messageIdCount = 0;
    let currentAssistant: ChatGptMessageMetadata | null = null;
    let unknownRoleCount = 0;
    const roleSourceCounts: Record<string, number> = {};
    const roleConfidenceCounts: Record<string, number> = {};

    for (const record of records) {
        const metadata = record.metadata;
        if (metadata?.messageId) {
            messageIdCount += 1;
            countsByMessageId.set(metadata.messageId, (countsByMessageId.get(metadata.messageId) ?? 0) + 1);
        }
        const roleSource = record.roleSource ?? "unknown";
        const roleConfidence = record.roleConfidence ?? "low";
        roleSourceCounts[roleSource] = (roleSourceCounts[roleSource] ?? 0) + 1;
        roleConfidenceCounts[roleConfidence] = (roleConfidenceCounts[roleConfidence] ?? 0) + 1;
        if (record.role === "unknown") unknownRoleCount += 1;
        if (metadata?.authorRole === "assistant") currentAssistant = metadata;
    }

    let repeatedMessageIdCount = 0;
    for (const count of countsByMessageId.values()) {
        if (count > 1) repeatedMessageIdCount += count;
    }

    return {
        totalTurns: records.length,
        messageIdCount,
        missingMessageIdCount: Math.max(0, records.length - messageIdCount),
        repeatedMessageIdCount,
        currentAssistant,
        roleSourceCounts,
        roleConfidenceCounts,
        unknownRoleCount,
    };
}

function firstAttr(element: HTMLElement, names: readonly string[]): string | null {
    for (const name of names) {
        const value = element.getAttribute(name)?.trim();
        if (value) return value;
    }
    return null;
}
