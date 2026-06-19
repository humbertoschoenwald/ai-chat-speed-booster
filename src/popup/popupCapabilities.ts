/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: expose popup feature-availability decisions.
 * Boundary: capability predicates only; DOM rendering stays in popup.ts.
 * ADR: docs/adr/experience/popup/native-mode-controls.md.
 */
import { isNativeModeAllowedForSite } from "../shared/native-runtime-policy";

export function shouldShowNativeModeControl(siteId: string | undefined): boolean {
    return isNativeModeAllowedForSite(siteId);
}
