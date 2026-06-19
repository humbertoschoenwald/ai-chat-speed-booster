/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: sanitize background config patches against site capability boundaries.
 * Boundary: pure config patch policy only; storage and message routing stay in background/index.ts.
 * ADR: docs/adr/architecture/native-mode/mode-boundary.md.
 */
import { isNativeModeAllowedForSite } from "../shared/native-runtime-policy";
import type { ExtensionConfig } from "../shared/types";

export function coerceConfigPatchForSite(
    patch: Partial<ExtensionConfig>,
    siteId: string | undefined,
): Partial<ExtensionConfig> {
    if (patch.performanceMode !== "native" || isNativeModeAllowedForSite(siteId)) {
        return patch;
    }

    return { ...patch, performanceMode: "legacy" };
}
