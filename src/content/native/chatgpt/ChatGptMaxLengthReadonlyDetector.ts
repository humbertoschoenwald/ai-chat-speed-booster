export interface ChatGptMaxLengthReadonlySnapshot {
    readonly detected: boolean;
    readonly reason: string | null;
}

const MAX_LENGTH_TEXT_PATTERNS = [
    /maximum conversation length/i,
    /conversation.*maximum length/i,
    /conversation.*too long/i,
    /maximum.*context/i,
    /start a new chat/i,
];

export function detectChatGptMaxLengthReadonly(root: ParentNode = document): ChatGptMaxLengthReadonlySnapshot {
    const text = (root instanceof Document ? root.body?.innerText : root.textContent) ?? "";
    const reason = MAX_LENGTH_TEXT_PATTERNS.find((pattern) => pattern.test(text))?.source ?? null;
    if (!reason) {
        return { detected: false, reason: null };
    }
    return { detected: true, reason };
}
