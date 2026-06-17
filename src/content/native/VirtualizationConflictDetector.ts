import type { ScrollGeometryDelta } from "./ScrollGeometry";

export interface VirtualizationConflictSnapshot {
    readonly revealLoopCount: number;
    readonly scrollOscillationCount: number;
    readonly shouldDisableNativeVirtualization: boolean;
    readonly lastReason: string | null;
}

const DISABLE_THRESHOLD = 3;

export class VirtualizationConflictDetector {
    private revealLoopCount = 0;
    private scrollOscillationCount = 0;
    private lastReason: string | null = null;

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

    snapshot(): VirtualizationConflictSnapshot {
        return {
            revealLoopCount: this.revealLoopCount,
            scrollOscillationCount: this.scrollOscillationCount,
            shouldDisableNativeVirtualization:
                this.revealLoopCount >= DISABLE_THRESHOLD || this.scrollOscillationCount >= DISABLE_THRESHOLD,
            lastReason: this.lastReason,
        };
    }
}
