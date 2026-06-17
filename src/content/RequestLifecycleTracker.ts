import { MessageType } from "../shared/types";
import { sendMessage } from "../shared/browser-api";

const FAILURE_SELECTOR = [
    '[role="alert"]',
    '[data-testid*="error" i]',
    '[data-testid*="limit" i]',
    '[class*="error" i]',
    '[class*="danger" i]',
].join(",");

export class RequestLifecycleTracker {
    private readonly seenAttempts = new WeakSet<HTMLElement>();
    private readonly seenResponses = new WeakSet<HTMLElement>();
    private pendingAcceptedSlots = 0;

    constructor(
        private readonly siteId: string,
        private readonly userMessageSelector?: string,
    ) {}

    reset(): void {
        this.pendingAcceptedSlots = 0;
    }

    observeAddedTurns(elements: readonly HTMLElement[]): void {
        if (!this.userMessageSelector) return;
        let acceptedCount = 0;

        for (const element of elements) {
            if (this.isUserAttempt(element)) {
                this.seenAttempts.add(element);
                this.pendingAcceptedSlots += 1;
                continue;
            }

            if (this.pendingAcceptedSlots <= 0) continue;
            if (this.seenResponses.has(element)) continue;
            if (this.isFailureTurn(element)) {
                this.pendingAcceptedSlots = Math.max(0, this.pendingAcceptedSlots - 1);
                this.seenResponses.add(element);
                continue;
            }

            this.seenResponses.add(element);
            this.pendingAcceptedSlots -= 1;
            acceptedCount += 1;
        }

        if (acceptedCount > 0) {
            sendMessage({
                type: MessageType.INCREMENT_REQUEST_COUNT,
                payload: { siteId: this.siteId, count: acceptedCount },
            }).catch(() => {});
        }
    }

    private isUserAttempt(element: HTMLElement): boolean {
        if (this.seenAttempts.has(element)) return false;
        return element.matches(this.userMessageSelector!) || element.querySelector(this.userMessageSelector!) !== null;
    }

    private isFailureTurn(element: HTMLElement): boolean {
        return element.matches(FAILURE_SELECTOR) || element.querySelector(FAILURE_SELECTOR) !== null;
    }
}
