export interface EditorInputSnapshot {
    readonly active: boolean;
    readonly composing: boolean;
    readonly deferredTaskCount: number;
    readonly lastEventType: string | null;
    readonly lastEventAt: number | null;
}

const QUIET_WINDOW_MS = 120;

export class EditorInputOptimizer {
    private composing = false;
    private lastEventType: string | null = null;
    private lastEventAt: number | null = null;
    private deferredTaskCount = 0;

    markEvent(type: string): void {
        this.lastEventType = type;
        this.lastEventAt = Date.now();
        if (type === "compositionstart") this.composing = true;
        if (type === "compositionend") this.composing = false;
    }

    shouldDeferBackgroundWork(now = Date.now()): boolean {
        if (this.composing) return true;
        if (this.lastEventAt === null) return false;
        return now - this.lastEventAt < QUIET_WINDOW_MS;
    }

    deferTask(): void {
        this.deferredTaskCount += 1;
    }

    snapshot(): EditorInputSnapshot {
        return {
            active: this.shouldDeferBackgroundWork(),
            composing: this.composing,
            deferredTaskCount: this.deferredTaskCount,
            lastEventType: this.lastEventType,
            lastEventAt: this.lastEventAt,
        };
    }
}
