/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: resolve popup active-tab site context before rendering cached controls.
 * Boundary: active-tab site detection only; DOM rendering stays in popup.ts.
 * ADR: docs/adr/experience/popup/native-mode-controls.md.
 */
import { api } from "../shared/browser-api";
import { detectSiteFromUrl } from "../shared/siteDetection";
import type { ExtensionStatus } from "../shared/types";

export async function detectActivePopupSiteId(): Promise<string | undefined> {
    try {
        const [tab] = await api.tabs.query({ active: true, currentWindow: true });
        return detectSiteFromUrl(tab?.url)?.id;
    } catch {
        return undefined;
    }
}

export function shouldUsePopupCachedStatus(
    status: ExtensionStatus | undefined,
    activeSiteId: string | undefined,
): boolean {
    return Boolean(status?.siteId && status.siteId === activeSiteId);
}
