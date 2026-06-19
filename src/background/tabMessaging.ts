/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: route background messages to supported content-script tabs.
 * Boundary: tab broadcast/forward only; command handling stays in background/index.ts.
 * ADR: docs/adr/architecture/native-mode/mode-boundary.md.
 */
import { api } from "../shared/browser-api";
import { logger } from "../shared/logger";
import { getAllUrlPatterns } from "../shared/sites";
import type { ExtensionMessageUnion, ExtensionStatus } from "../shared/types";

const allUrlPatterns = getAllUrlPatterns();

export async function broadcastToContentScripts(message: ExtensionMessageUnion): Promise<void> {
    try {
        const tabs = await api.tabs.query({ url: allUrlPatterns as string[] });
        for (const tab of tabs) {
            if (tab.id == null) continue;
            try { await api.tabs.sendMessage(tab.id, message); } catch { /* not injected */ }
        }
    } catch (error) {
        logger.error("failed to broadcast to content scripts", error);
    }
}

export async function forwardToActiveTab(message: ExtensionMessageUnion): Promise<ExtensionStatus | undefined> {
    try {
        const [tab] = await api.tabs.query({ active: true, currentWindow: true, url: allUrlPatterns as string[] });
        if (!tab?.id) return undefined;
        return (await api.tabs.sendMessage(tab.id, message)) as ExtensionStatus | undefined;
    } catch {
        return undefined;
    }
}
