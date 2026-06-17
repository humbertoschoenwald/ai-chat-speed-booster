export type ChatGptTokenWarningLevel = "ok" | "warn" | "critical";

export interface ChatGptTokenEstimate {
    readonly approxTokens: number;
    readonly limitTokens: number;
    readonly ratio: number;
    readonly warningLevel: ChatGptTokenWarningLevel;
}

const DEFAULT_CHATGPT_PROMPT_LIMIT_TOKENS = 32000;
const TOKEN_WARN_RATIO = 0.8;
const TOKEN_CRITICAL_RATIO = 0.95;

export function estimateChatGptPromptTokens(
    text: string,
    limitTokens = DEFAULT_CHATGPT_PROMPT_LIMIT_TOKENS,
): ChatGptTokenEstimate {
    const normalized = text.replace(/\s+/g, " ").trim();
    const chars = normalized.length;
    const words = normalized === "" ? 0 : normalized.split(" ").length;
    const punctuation = (normalized.match(/[{}()[\]<>/\\.,;:!?=+*_`|~-]/g) ?? []).length;
    const estimatedByChars = chars / 4;
    const estimatedByWords = words * 1.35;
    const estimatedByPunctuation = punctuation * 0.35;
    const approxTokens = Math.ceil(Math.max(estimatedByChars, estimatedByWords) + estimatedByPunctuation);
    const safeLimit = Math.max(1, limitTokens);
    const ratio = approxTokens / safeLimit;

    return {
        approxTokens,
        limitTokens: safeLimit,
        ratio,
        warningLevel: ratio >= TOKEN_CRITICAL_RATIO ? "critical" : ratio >= TOKEN_WARN_RATIO ? "warn" : "ok",
    };
}

export function readChatGptComposerText(root: Document = document): string {
    const editor = root.querySelector<HTMLElement>(
        '#prompt-textarea, [data-testid="prompt-textarea"], textarea, [contenteditable="true"]',
    );
    if (!editor) return "";
    if (editor instanceof HTMLTextAreaElement || editor instanceof HTMLInputElement) return editor.value;
    return editor.innerText || editor.textContent || "";
}
