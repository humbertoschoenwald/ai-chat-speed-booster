export interface ContentBootstrapSnapshot {
    readonly bootstrapped: boolean;
    readonly heartbeatAt: number | null;
}

export interface ContentBootstrapDecision {
    readonly acquire: boolean;
    readonly reason: "empty" | "fresh-owner" | "stale-owner";
}

export function decideContentBootstrapOwnership(
    snapshot: ContentBootstrapSnapshot,
    nowMs: number,
    staleAfterMs: number,
): ContentBootstrapDecision {
    if (!snapshot.bootstrapped) return { acquire: true, reason: "empty" };
    if (snapshot.heartbeatAt !== null && nowMs - snapshot.heartbeatAt < staleAfterMs) {
        return { acquire: false, reason: "fresh-owner" };
    }
    return { acquire: true, reason: "stale-owner" };
}
