/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: centralize named content-script timeout lifecycle.
 * Boundary: timeout bookkeeping only; callbacks own domain behavior.
 * ADR: docs/adr/architecture/lifecycle/lifecycle-recovery.md.
 */
export type ContentTimerKey = "conversation-retry" | "resume-health-check" | "viewport-resize";

export class ContentTimerRegistry {
    private readonly timers = new Map<ContentTimerKey, ReturnType<typeof setTimeout>>();

    set(key: ContentTimerKey, callback: () => void, delayMs: number): void {
        this.clear(key);
        const timer = setTimeout(() => {
            this.timers.delete(key);
            callback();
        }, delayMs);
        this.timers.set(key, timer);
    }

    clear(key: ContentTimerKey): void {
        const timer = this.timers.get(key);
        if (!timer) return;
        clearTimeout(timer);
        this.timers.delete(key);
    }

    clearAll(): void {
        for (const key of this.timers.keys()) this.clear(key);
    }
}
