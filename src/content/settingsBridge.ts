/**
 * Settings Bridge — runs in the default ISOLATED content-script world at
 * document_start.  Its only job is to copy the relevant subset of extension
 * configuration from chrome.storage.local into localStorage so that the
 * MAIN-world fetchInterceptor (which cannot access chrome.* APIs) can read it.
 *
 * It also keeps localStorage in sync whenever the config changes.
 */

const STORAGE_KEY = "ai_chat_speed_booster_config";
const BRIDGE_KEY = "acsb_bridge_config";

interface BridgePayload {
    schemaVersion: 1;
    enabled: boolean;
    performanceMode: "legacy" | "native" | "extreme";
    fetchInterceptEnabled: boolean;
    visibleMessageLimit: number;
    loadMoreBatchSize: number;
}

function nativeModeAllowedHere(): boolean {
    return location.hostname === "chatgpt.com" || location.hostname.endsWith(".chatgpt.com");
}

function writeBridge(raw: Record<string, unknown> | undefined): void {
    const requestedNative = raw?.performanceMode === "native";
    const requestedExtreme = raw?.performanceMode === "extreme";
    const performanceMode = requestedExtreme
        ? "extreme"
        : requestedNative && nativeModeAllowedHere() ? "native" : "legacy";
    const payload: BridgePayload = {
        schemaVersion: 1,
        enabled: typeof raw?.enabled === "boolean" ? raw.enabled : true,
        performanceMode,
        fetchInterceptEnabled: performanceMode === "extreme",
        visibleMessageLimit: performanceMode === "extreme"
            ? 1
            : typeof raw?.visibleMessageLimit === "number"
                ? raw.visibleMessageLimit
                : 3,
        loadMoreBatchSize: performanceMode === "extreme"
            ? 0
            : typeof raw?.loadMoreBatchSize === "number"
                ? raw.loadMoreBatchSize
                : 3,
    };
    try {
        localStorage.setItem(BRIDGE_KEY, JSON.stringify(payload));
    } catch {
        // localStorage might be unavailable (private browsing, quota, etc.)
    }
}

// --- Initial read -----------------------------------------------------------
chrome.storage.local.get(STORAGE_KEY, (result: Record<string, unknown>) => {
    writeBridge(result[STORAGE_KEY] as Record<string, unknown> | undefined);
});

// --- Live updates ------------------------------------------------------------
chrome.storage.onChanged.addListener(
    (
        changes: Record<string, chrome.storage.StorageChange>,
        area: string,
    ) => {
        if (area === "local" && STORAGE_KEY in changes) {
            writeBridge(
                changes[STORAGE_KEY].newValue as
                | Record<string, unknown>
                | undefined,
            );
        }
    },
);
