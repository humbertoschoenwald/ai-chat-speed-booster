export type NativeFeature =
    | "turn-freeze"
    | "turn-restore"
    | "tool-grouping"
    | "large-input-plan"
    | "resource-cleanup"
    | "telemetry-marker";

export interface NativeFeatureDecision {
    readonly feature: NativeFeature;
    readonly enabled: boolean;
    readonly reason: string;
}

export class NativeFeatureGate {
    decide(feature: NativeFeature, nativeActive: boolean, selectorHealthy: boolean, inputProtected: boolean): NativeFeatureDecision {
        if (!nativeActive) return { feature, enabled: false, reason: "native-inactive" };
        if (!selectorHealthy) return { feature, enabled: false, reason: "selector-unhealthy" };
        if (inputProtected && feature !== "large-input-plan") {
            return { feature, enabled: false, reason: "input-protected" };
        }
        return { feature, enabled: true, reason: "allowed" };
    }
}
