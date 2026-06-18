import { MessageType } from "../shared/types";
import { sendMessage } from "../shared/browser-api";

const FAILURE_SELECTOR = [
    '[role="alert"]',
    '[data-testid*="error" i]',
    '[data-testid*="limit" i]',
    '[class*="error" i]',
    '[class*="danger" i]',
].join(",");
const DEFAULT_ACCEPTANCE_DELAY_MS = 1_500;

type AcceptedRequestReporter = (siteId: string, count: number) => void | Promise<void>;

const defaultAcceptedRequestReporter: AcceptedRequestReporter = (siteId, count) => {
    void sendMessage({
        type: MessageType.INCREMENT_REQUEST_COUNT,
        payload: { siteId, count },
    }).catch(() => {});
};

export class RequestLifecycleTracker {
    private readonly seenAttempts = new WeakSet<HTMLElement>();
    private readonly seenResponses = new WeakSet<HTMLElement>();
    private readonly pendingAcceptanceTimers = new Map<HTMLElement, ReturnType<typeof setTimeout>>();
    private pendingAcceptedSlots = 0;

    constructor(
        private readonly siteId: string,
        private readonly userMessageSelector?: string,
        private readonly reporter: AcceptedRequestReporter = defaultAcceptedRequestReporter,
        private readonly acceptanceDelayMs = DEFAULT_ACCEPTANCE_DELAY_MS,
    ) {}

    reset(): void {
        this.pendingAcceptedSlots = 0;
        for (const timer of this.pendingAcceptanceTimers.values()) clearTimeout(timer);
        this.pendingAcceptanceTimers.clear();
    }

    observeAddedTurns(elements: readonly HTMLElement[]): void {
        if (!this.userMessageSelector) return;

        for (const element of elements) {
            if (this.isUserAttempt(element)) {
                this.seenAttempts.add(element);
                this.pendingAcceptedSlots += 1;
                continue;
            }

            if (this.seenResponses.has(element)) continue;
            if (this.isFailureTurn(element)) {
                this.cancelLatestPendingAcceptance();
                this.pendingAcceptedSlots = Math.max(0, this.pendingAcceptedSlots - 1);
                this.seenResponses.add(element);
                continue;
            }

            if (this.pendingAcceptedSlots <= 0) continue;
            this.seenResponses.add(element);
            this.pendingAcceptedSlots -= 1;
            this.scheduleAcceptedReport(element);
        }
    }

    private scheduleAcceptedReport(element: HTMLElement): void {
        if (this.acceptanceDelayMs <= 0) {
            void this.reporter(this.siteId, 1);
            return;
        }
        const timer = setTimeout(() => {
            this.pendingAcceptanceTimers.delete(element);
            void this.reporter(this.siteId, 1);
        }, this.acceptanceDelayMs);
        this.pendingAcceptanceTimers.set(element, timer);
    }

    private cancelLatestPendingAcceptance(): void {
        const latest = [...this.pendingAcceptanceTimers.entries()].at(-1);
        if (!latest) return;
        const [element, timer] = latest;
        clearTimeout(timer);
        this.pendingAcceptanceTimers.delete(element);
    }

    private isUserAttempt(element: HTMLElement): boolean {
        if (this.seenAttempts.has(element)) return false;
        return element.matches(this.userMessageSelector!) || element.querySelector(this.userMessageSelector!) !== null;
    }

    private isFailureTurn(element: HTMLElement): boolean {
        return element.matches(FAILURE_SELECTOR) || element.querySelector(FAILURE_SELECTOR) !== null;
    }
}
