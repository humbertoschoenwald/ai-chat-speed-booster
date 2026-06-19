/**
 * License: MIT. Provenance: AI Chat Speed Booster extension tests.
 * Responsibility: cover ChatGPT delivery-timeout structural detection.
 * Boundary: deterministic fixture snippets only; no private ChatGPT HTML or live account state.
 * ADR: docs/adr/architecture/lifecycle/chatgpt-delivery-timeout-detection.md.
 */
import { test, expect } from "@playwright/test";
import {
    detectChatGptDeliveryTimeoutHtml,
    CHATGPT_DELIVERY_TIMEOUT_TEXT,
} from "../src/content/native/chatgpt/ChatGptDeliveryTimeoutDetector";

test.describe("ChatGPT delivery timeout detector", () => {
    test("detects retryable assistant error structure from saved ChatGPT HTML shape", () => {
        const html = `
            <div data-message-author-role="assistant" data-message-id="message-1">
                <div class="text-token-text-error border-token-surface-error/15">
                    <div class="markdown"><p>${CHATGPT_DELIVERY_TIMEOUT_TEXT}</p></div>
                    <button data-testid="regenerate-thread-error-button">Retry</button>
                </div>
            </div>
        `;

        const snapshot = detectChatGptDeliveryTimeoutHtml(html);

        expect(snapshot.detected).toBe(true);
        expect(snapshot.confidence).toBe("structural");
        expect(snapshot.retryButtonCount).toBe(1);
        expect(snapshot.assistantErrorCount).toBe(1);
        expect(snapshot.reason).toBe("chatgpt-html-retry-button-assistant-error-signature");
    });

    test("does not treat visible timeout text alone as a retryable delivery failure", () => {
        const html = `<p>${CHATGPT_DELIVERY_TIMEOUT_TEXT}</p>`;

        const snapshot = detectChatGptDeliveryTimeoutHtml(html);

        expect(snapshot.detected).toBe(false);
        expect(snapshot.confidence).toBe("none");
        expect(snapshot.retryButtonCount).toBe(0);
    });
});
