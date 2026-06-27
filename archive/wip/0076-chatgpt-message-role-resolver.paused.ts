import type { NativeTurnRole } from "../TurnRegistry";
import type { ChatGptMessageMetadata } from "./ChatGptMessageMetadata";

export type ChatGptMessageRoleSource = "section" | "message" | "cached" | "unknown";
export type ChatGptMessageRoleConfidence = "high" | "medium" | "low";

export interface ChatGptMessageRoleResolution {
    readonly role: NativeTurnRole;
    readonly source: ChatGptMessageRoleSource;
    readonly confidence: ChatGptMessageRoleConfidence;
}

export function resolveChatGptMessageRole(
    turn: HTMLElement,
    metadata: ChatGptMessageMetadata,
    cachedRole: NativeTurnRole | null = null,
): ChatGptMessageRoleResolution {
    const sectionRole = normalizeRole(firstAttr(turn, ["data-turn-role", "data-message-author-role", "data-author"]));
    if (sectionRole) return { role: sectionRole, source: "section", confidence: "high" };

    const messageRole = normalizeRole(metadata.authorRole ?? readNearestMessageRole(turn));
    if (messageRole) return { role: messageRole, source: "message", confidence: "high" };

    if (cachedRole && cachedRole !== "unknown") return { role: cachedRole, source: "cached", confidence: "medium" };
    return { role: "unknown", source: "unknown", confidence: "low" };
}

function readNearestMessageRole(turn: HTMLElement): string | null {
    const messageRoot = turn.querySelector<HTMLElement>("[data-message-author-role],[data-author]");
    return messageRoot ? firstAttr(messageRoot, ["data-message-author-role", "data-author", "aria-label"]) : null;
}

function firstAttr(element: HTMLElement, names: readonly string[]): string | null {
    for (const name of names) {
        const value = element.getAttribute(name)?.trim();
        if (value) return value;
    }
    return null;
}

function normalizeRole(value: string | null): NativeTurnRole | null {
    const text = value?.toLowerCase() ?? "";
    if (text.includes("user")) return "user";
    if (text.includes("assistant")) return "assistant";
    if (text.includes("system")) return "system";
    return null;
}
