/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: resolve background message site context from sender or active tab.
 * Boundary: active-tab URL lookup only; config patch policy stays in configPolicy.ts.
 * ADR: docs/adr/architecture/native-mode/mode-boundary.md.
 */
import { api } from "../shared/browser-api";
import { detectSiteFromUrl } from "../shared/siteDetection";

export async function resolveMessageSiteId(sender: chrome.runtime.MessageSender): Promise<string | undefined> {
    const senderSiteId = detectSiteFromUrl(sender.tab?.url)?.id;
    if (senderSiteId) return senderSiteId;

    try {
        const [tab] = await api.tabs.query({ active: true, currentWindow: true });
        return detectSiteFromUrl(tab?.url)?.id;
    } catch {
        return undefined;
    }
}
