import type { ScrollGeometryDelta } from "./ScrollGeometry";

export interface VirtualizationConflictSnapshot {
    readonly revealLoopCount: number;
    readonly scrollOscillationCount: number;
    readonly shouldDisableNativeVirtualization: boolean;
    readonly lastReason: string | null;
}

const DISABLE_THRESHOLD = 3;
const SCROLL_OSCILLATION_WINDOW_MS = 1_500;
const SCROLL_OSCILLATION_MIN_DELTA_PX = 48;

export class VirtualizationConflictDetector {
    private revealLoopCount = 0;
    private scrollOscillationCount = 0;
    private lastReason: string | null = null;
    private lastScrollHeight: number | null = null;
    private lastScrollDirection: -1 | 0 | 1 = 0;
    private lastScrollSampleAt: number | null = null;

    recordHostReveal(hiddenBefore: boolean, hiddenAfter: boolean): void {
        if (hiddenBefore && !hiddenAfter) {
            this.revealLoopCount += 1;
            this.lastReason = "host-revealed-hidden-turn";
        }
    }

    recordScrollDelta(delta: ScrollGeometryDelta): void {
        if (delta.oscillating) {
            this.scrollOscillationCount += 1;
            this.lastReason = "scroll-height-oscillation";
        }
    }

    recordScrollHeight(scrollHeight: number, nowMs = Date.now()): void {
        if (this.lastScrollHeight === null) {
            this.lastScrollHeight = scrollHeight;
            this.lastScrollSampleAt = nowMs;
            return;
        }

        const delta = scrollHeight - this.lastScrollHeight;
        const direction = delta === 0 ? 0 : delta > 0 ? 1 : -1;
        const recent = this.lastScrollSampleAt !== null && nowMs - this.lastScrollSampleAt <= SCROLL_OSCILLATION_WINDOW_MS;
        if (recent && direction !== 0 && this.lastScrollDirection !== 0 && direction !== this.lastScrollDirection && Math.abs(delta) >= SCROLL_OSCILLATION_MIN_DELTA_PX) {
            this.scrollOscillationCount += 1;
            this.lastReason = "scroll-height-oscillation";
        }

        this.lastScrollHeight = scrollHeight;
        this.lastScrollDirection = direction || this.lastScrollDirection;
        this.lastScrollSampleAt = nowMs;
    }

    snapshot(): VirtualizationConflictSnapshot {
        return {
            revealLoopCount: this.revealLoopCount,
            scrollOscillationCount: this.scrollOscillationCount,
            shouldDisableNativeVirtualization:
                this.revealLoopCount + this.scrollOscillationCount >= DISABLE_THRESHOLD,
            lastReason: this.lastReason,
        };
    }
}
