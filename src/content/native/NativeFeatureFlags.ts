export type NativeFeatureFlagId =
    | "selector-guard"
    | "editor-input-protection"
    | "sanitized-diagnostics"
    | "historical-turn-containment"
    | "old-turn-hover-quiet"
    | "static-tool-icon-paint"
    | "long-task-throttle"
    | "work-scheduler-lanes";

export interface NativeFeatureFlagDefinition {
    readonly id: NativeFeatureFlagId;
    readonly enabledByDefault: boolean;
}

export interface NativeAutoDisableRecord {
    readonly feature: NativeFeatureFlagId;
    readonly reason: string;
    readonly disabledAt: number;
}

export interface NativeFeatureFlagResolution {
    readonly activeFeatures: readonly NativeFeatureFlagId[];
    readonly disabledFeatures: readonly string[];
    readonly autoDisabledFeatures: readonly NativeAutoDisableRecord[];
}

export const NATIVE_FEATURE_FLAGS: readonly NativeFeatureFlagDefinition[] = [
    { id: "selector-guard", enabledByDefault: true },
    { id: "editor-input-protection", enabledByDefault: true },
    { id: "sanitized-diagnostics", enabledByDefault: true },
    { id: "historical-turn-containment", enabledByDefault: true },
    { id: "old-turn-hover-quiet", enabledByDefault: true },
    { id: "static-tool-icon-paint", enabledByDefault: true },
    { id: "long-task-throttle", enabledByDefault: true },
    { id: "work-scheduler-lanes", enabledByDefault: true },
];

const DEFAULTS = new Map(NATIVE_FEATURE_FLAGS.map((flag) => [flag.id, flag.enabledByDefault]));

export function resolveNativeFeatureFlags(
    requestedFeatures: readonly string[],
    autoDisabled: readonly NativeAutoDisableRecord[] = [],
): NativeFeatureFlagResolution {
    const autoDisabledByFeature = new Map(autoDisabled.map((record) => [record.feature, record]));
    const activeFeatures: NativeFeatureFlagId[] = [];
    const disabledFeatures: string[] = [];

    for (const feature of requestedFeatures) {
        if (!isNativeFeatureFlagId(feature)) {
            disabledFeatures.push(`${feature}: unknown native feature`);
            continue;
        }
        if (DEFAULTS.get(feature) !== true) {
            disabledFeatures.push(`${feature}: disabled by default`);
            continue;
        }
        const disabled = autoDisabledByFeature.get(feature);
        if (disabled) {
            disabledFeatures.push(`${feature}: ${disabled.reason}`);
            continue;
        }
        activeFeatures.push(feature);
    }

    return { activeFeatures, disabledFeatures, autoDisabledFeatures: autoDisabled };
}

export function createNativeAutoDisableRecord(
    feature: NativeFeatureFlagId,
    reason: string,
    disabledAt = Date.now(),
): NativeAutoDisableRecord {
    return { feature, reason, disabledAt };
}

function isNativeFeatureFlagId(value: string): value is NativeFeatureFlagId {
    return DEFAULTS.has(value as NativeFeatureFlagId);
}
