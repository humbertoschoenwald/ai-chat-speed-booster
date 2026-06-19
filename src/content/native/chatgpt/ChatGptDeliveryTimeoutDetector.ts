/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: detect ChatGPT delivery-timeout UI signatures without storing chat content.
 * Boundary: structural DOM and saved-HTML signature checks only; no automatic retry or reload.
 * ADR: docs/adr/architecture/lifecycle/chatgpt-delivery-timeout-detection.md.
 */
export const CHATGPT_DELIVERY_TIMEOUT_RETRY_BUTTON_SELECTOR =
    '[data-testid="regenerate-thread-error-button"]';
export const CHATGPT_DELIVERY_TIMEOUT_ERROR_CONTAINER_SELECTOR =
    '.text-token-text-error, [class*="text-token-text-error"]';
export const CHATGPT_DELIVERY_TIMEOUT_ASSISTANT_SELECTOR =
    '[data-message-author-role="assistant"]';
export const CHATGPT_DELIVERY_TIMEOUT_TEXT = "Message delivery timed out. Please try again.";

export type ChatGptDeliveryTimeoutConfidence = "none" | "structural" | "text-fallback";

export interface ChatGptDeliveryTimeoutSnapshot {
    readonly detected: boolean;
    readonly confidence: ChatGptDeliveryTimeoutConfidence;
    readonly retryButtonCount: number;
    readonly assistantErrorCount: number;
    readonly firstMessageId: string | null;
    readonly reason: string | null;
}

const EMPTY_DELIVERY_TIMEOUT_SNAPSHOT: ChatGptDeliveryTimeoutSnapshot = {
    detected: false,
    confidence: "none",
    retryButtonCount: 0,
    assistantErrorCount: 0,
    firstMessageId: null,
    reason: null,
};

function countLiteral(haystack: string, needle: string): number {
    if (needle.length === 0) {
        return 0;
    }
    let count = 0;
    let offset = 0;
    while (offset < haystack.length) {
        const index = haystack.indexOf(needle, offset);
        if (index === -1) {
            break;
        }
        count += 1;
        offset = index + needle.length;
    }
    return count;
}

function snapshot(
    confidence: ChatGptDeliveryTimeoutConfidence,
    retryButtonCount: number,
    assistantErrorCount: number,
    firstMessageId: string | null,
    reason: string,
): ChatGptDeliveryTimeoutSnapshot {
    return {
        detected: confidence !== "none",
        confidence,
        retryButtonCount,
        assistantErrorCount,
        firstMessageId,
        reason,
    };
}

export function detectChatGptDeliveryTimeout(root: ParentNode = document): ChatGptDeliveryTimeoutSnapshot {
    const retryButtons = Array.from(
        root.querySelectorAll<HTMLElement>(CHATGPT_DELIVERY_TIMEOUT_RETRY_BUTTON_SELECTOR),
    );
    if (retryButtons.length === 0) {
        return EMPTY_DELIVERY_TIMEOUT_SNAPSHOT;
    }

    let assistantErrorCount = 0;
    let firstMessageId: string | null = null;
    for (const button of retryButtons) {
        const assistant = button.closest<HTMLElement>(CHATGPT_DELIVERY_TIMEOUT_ASSISTANT_SELECTOR);
        const errorContainer = button.closest<HTMLElement>(CHATGPT_DELIVERY_TIMEOUT_ERROR_CONTAINER_SELECTOR)
            ?? assistant?.querySelector<HTMLElement>(CHATGPT_DELIVERY_TIMEOUT_ERROR_CONTAINER_SELECTOR)
            ?? null;
        if (assistant && errorContainer) {
            assistantErrorCount += 1;
            firstMessageId ??= assistant.getAttribute("data-message-id");
        }
    }

    if (assistantErrorCount > 0) {
        return snapshot(
            "structural",
            retryButtons.length,
            assistantErrorCount,
            firstMessageId,
            "chatgpt-retry-button-near-assistant-error-container",
        );
    }

    const hasTimeoutText = retryButtons.some((button) => {
        const assistant = button.closest<HTMLElement>(CHATGPT_DELIVERY_TIMEOUT_ASSISTANT_SELECTOR);
        return assistant?.textContent?.includes(CHATGPT_DELIVERY_TIMEOUT_TEXT) === true;
    });

    if (hasTimeoutText) {
        return snapshot(
            "text-fallback",
            retryButtons.length,
            0,
            firstMessageId,
            "chatgpt-retry-button-near-timeout-text",
        );
    }

    return {
        ...EMPTY_DELIVERY_TIMEOUT_SNAPSHOT,
        retryButtonCount: retryButtons.length,
    };
}

export function detectChatGptDeliveryTimeoutHtml(html: string): ChatGptDeliveryTimeoutSnapshot {
    const retryButtonCount = countLiteral(html, 'data-testid="regenerate-thread-error-button"')
        + countLiteral(html, "data-testid='regenerate-thread-error-button'");
    const assistantCount = countLiteral(html, 'data-message-author-role="assistant"')
        + countLiteral(html, "data-message-author-role='assistant'");
    const errorClassCount = countLiteral(html, "text-token-text-error");
    const timeoutTextCount = countLiteral(html, CHATGPT_DELIVERY_TIMEOUT_TEXT);

    if (retryButtonCount > 0 && assistantCount > 0 && errorClassCount > 0) {
        return snapshot(
            "structural",
            retryButtonCount,
            Math.min(retryButtonCount, errorClassCount),
            null,
            "chatgpt-html-retry-button-assistant-error-signature",
        );
    }

    if (retryButtonCount > 0 && timeoutTextCount > 0) {
        return snapshot(
            "text-fallback",
            retryButtonCount,
            0,
            null,
            "chatgpt-html-retry-button-timeout-text-signature",
        );
    }

    return EMPTY_DELIVERY_TIMEOUT_SNAPSHOT;
}
