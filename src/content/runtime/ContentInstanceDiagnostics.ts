export interface ContentInstanceDiagnostics {
    readonly ownsBootstrap: boolean;
    readonly instanceId: string | null;
    readonly observedInstanceId: string | null;
    readonly lastBeatAt: number | null;
    readonly beatAgeMs: number | null;
}

const INSTANCE_ATTR = "data-acsb-content-instance";
const BEAT_ATTR = "data-acsb-content-heartbeat-at";

export function readContentInstanceDiagnostics(root: Document, ownsBootstrap: boolean, instanceId: string | null, nowMs = Date.now()): ContentInstanceDiagnostics {
    const element = root.documentElement;
    const observedInstanceId = element.getAttribute(INSTANCE_ATTR);
    const beatValue = Number(element.getAttribute(BEAT_ATTR));
    const lastBeatAt = Number.isFinite(beatValue) && beatValue > 0 ? beatValue : null;
    return {
        ownsBootstrap,
        instanceId,
        observedInstanceId,
        lastBeatAt,
        beatAgeMs: lastBeatAt === null ? null : Math.max(0, nowMs - lastBeatAt),
    };
}
