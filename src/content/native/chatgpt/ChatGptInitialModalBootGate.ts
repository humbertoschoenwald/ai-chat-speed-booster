export interface ChatGptInitialModalBootGateSnapshot {
    readonly ready: boolean;
    readonly markerPresent: boolean;
    readonly fallbackElapsed: boolean;
    readonly elapsedMs: number;
}

export interface ChatGptInitialModalBootGateOptions {
    readonly fallbackMs?: number;
}

const INITIAL_MODAL_DONE_SELECTOR = [
    "[data-testid='blocking-initial-modals-done']",
    "[data-acsb-blocking-initial-modals-done='true']",
].join(",");
const DEFAULT_INITIAL_MODAL_FALLBACK_MS = 2_500;

export class ChatGptInitialModalBootGate {
    private readonly fallbackMs: number;
    private firstObservedAtMs: number | null = null;

    constructor(options: ChatGptInitialModalBootGateOptions = {}) {
        this.fallbackMs = options.fallbackMs ?? DEFAULT_INITIAL_MODAL_FALLBACK_MS;
    }

    reset(): void {
        this.firstObservedAtMs = null;
    }

    read(root: ParentNode, nowMs = Date.now()): ChatGptInitialModalBootGateSnapshot {
        this.firstObservedAtMs ??= nowMs;
        const markerPresent = (root.querySelector?.(INITIAL_MODAL_DONE_SELECTOR) ?? null) !== null;
        const elapsedMs = Math.max(0, nowMs - this.firstObservedAtMs);
        const fallbackElapsed = elapsedMs >= this.fallbackMs;
        return {
            ready: markerPresent || fallbackElapsed,
            markerPresent,
            fallbackElapsed,
            elapsedMs,
        };
    }
}

export function getChatGptInitialModalDoneSelector(): string {
    return INITIAL_MODAL_DONE_SELECTOR;
}
