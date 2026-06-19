/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: decide when top-of-thread Auto Load may reveal one older turn.
 * Boundary: pure scroll decision model; never mutates DOM or scroll position.
 * ADR: docs/adr/experience/autoload-top-scroll-gate.md.
 */
export interface AutoLoadScrollState {
    readonly scrollTop: number;
    readonly scrollHeight: number;
    readonly clientHeight: number;
    readonly totalMessages: number;
    readonly visibleMessages: number;
}

export interface AutoLoadScrollGateOptions {
    readonly topThresholdPercent?: number;
    readonly cooldownMs?: number;
    readonly now?: () => number;
}

export class AutoLoadScrollGate {
    private readonly topThresholdPercent: number;
    private readonly cooldownMs: number;
    private readonly now: () => number;
    private lastRevealAtMs = Number.NEGATIVE_INFINITY;

    constructor(options: AutoLoadScrollGateOptions = {}) {
        this.topThresholdPercent = options.topThresholdPercent ?? 10;
        this.cooldownMs = options.cooldownMs ?? 900;
        this.now = options.now ?? (() => Date.now());
    }

    shouldRevealOlderTurn(state: AutoLoadScrollState): boolean {
        if (state.visibleMessages >= state.totalMessages) return false;
        const maxScroll = state.scrollHeight - state.clientHeight;
        const topPercent = maxScroll > 0 ? (state.scrollTop / maxScroll) * 100 : 100;
        if (topPercent > this.topThresholdPercent) return false;

        const now = this.now();
        if (now - this.lastRevealAtMs < this.cooldownMs) return false;
        this.lastRevealAtMs = now;
        return true;
    }

    reset(): void {
        this.lastRevealAtMs = Number.NEGATIVE_INFINITY;
    }
}
