export interface StaleGenerationSignals {
    readonly lastAssistantMutationAt: number | null;
    readonly lastToolMutationAt: number | null;
    readonly activeStream: boolean;
    readonly stopControlPresent: boolean;
    readonly composerEnabled: boolean;
    readonly bottomGapPx: number;
    readonly now: number;
}

export interface StaleGenerationSnapshot {
    readonly staleStopDetected: boolean;
    readonly staleBottomGapDetected: boolean;
    readonly bottomGapPx: number;
    readonly quietForMs: number | null;
}

const QUIET_WINDOW_MS = 12_000;
const STALE_BOTTOM_GAP_PX = 180;

export class StaleGenerationRecovery {
    evaluate(signals: StaleGenerationSignals): StaleGenerationSnapshot {
        const lastMutationAt = Math.max(
            signals.lastAssistantMutationAt ?? 0,
            signals.lastToolMutationAt ?? 0,
        );
        const quietForMs = lastMutationAt > 0 ? signals.now - lastMutationAt : null;
        const quiet = quietForMs !== null && quietForMs >= QUIET_WINDOW_MS;
        const staleStopDetected = !signals.activeStream && signals.stopControlPresent && quiet;
        const staleBottomGapDetected = !signals.activeStream &&
            signals.composerEnabled &&
            signals.bottomGapPx >= STALE_BOTTOM_GAP_PX &&
            quiet;

        return {
            staleStopDetected,
            staleBottomGapDetected,
            bottomGapPx: signals.bottomGapPx,
            quietForMs,
        };
    }
}
