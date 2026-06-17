export interface ScrollOffsetDecision {
    readonly apply: boolean;
    readonly offsetPx: number;
    readonly reason: "stable" | "height-changed" | "too-small" | "oscillating";
}

export class ScrollOffsetPolicy {
    constructor(private readonly minOffsetPx = 2) {}

    decide(heightDeltaPx: number, oscillating: boolean): ScrollOffsetDecision {
        if (oscillating) return { apply: false, offsetPx: 0, reason: "oscillating" };
        if (Math.abs(heightDeltaPx) < this.minOffsetPx) {
            return { apply: false, offsetPx: 0, reason: "too-small" };
        }
        return { apply: true, offsetPx: heightDeltaPx, reason: "height-changed" };
    }
}
