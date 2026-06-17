import { NativeFeatureGate, type NativeFeature, type NativeFeatureDecision } from "../NativeFeatureGate";

const CHATGPT_BLOCKED_LIVE_FEATURES: ReadonlySet<NativeFeature> = new Set([
    "turn-freeze",
    "turn-restore",
    "tool-grouping",
    "resource-cleanup",
    "telemetry-marker",
]);

export class ChatGptNativeSafety {
    private readonly gate = new NativeFeatureGate();

    decide(
        feature: NativeFeature,
        nativeActive: boolean,
        selectorHealthy: boolean,
        inputProtected: boolean,
    ): NativeFeatureDecision {
        const decision = this.gate.decide(feature, nativeActive, selectorHealthy, inputProtected);
        if (!decision.enabled) return decision;

        if (CHATGPT_BLOCKED_LIVE_FEATURES.has(feature)) {
            return { feature, enabled: false, reason: "chatgpt-live-feature-blocked" };
        }

        return decision;
    }
}

export function createChatGptNativeSafety(): ChatGptNativeSafety {
    return new ChatGptNativeSafety();
}
