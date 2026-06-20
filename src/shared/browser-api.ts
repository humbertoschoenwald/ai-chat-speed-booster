type ChromeGlobal = typeof globalThis & { chrome?: typeof chrome };

const EXTENSION_CONTEXT_INVALIDATED = "Extension context invalidated";

export function isExtensionContextInvalidatedError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes(EXTENSION_CONTEXT_INVALIDATED)
        || message.toLowerCase().includes("context invalidated");
}

function getChromeApi(): typeof chrome {
    const chromeApi = (globalThis as ChromeGlobal).chrome;
    if (!chromeApi) throw new ReferenceError("chrome is not defined");
    return chromeApi;
}

export const api: typeof chrome = new Proxy({} as typeof chrome, {
    get(_target, property: string | symbol): unknown {
        return getChromeApi()[property as keyof typeof chrome];
    },
}) as typeof chrome;

export async function storageGet<T>(key: string): Promise<T | undefined> {
    try {
        const result = await api.storage.local.get(key);
        return result[key] as T | undefined;
    } catch (error) {
        if (isExtensionContextInvalidatedError(error)) return undefined;
        throw error;
    }
}

export async function storageSet<T>(key: string, value: T): Promise<void> {
    try {
        await api.storage.local.set({ [key]: value });
    } catch (error) {
        if (isExtensionContextInvalidatedError(error)) return;
        throw error;
    }
}

export async function storageGetSync<T>(key: string): Promise<T | undefined> {
    try {
        if (!api.storage.sync) return undefined;
        const result = await api.storage.sync.get(key);
        return result[key] as T | undefined;
    } catch (error) {
        if (isExtensionContextInvalidatedError(error)) return undefined;
        throw error;
    }
}

export async function storageSetSync<T>(key: string, value: T): Promise<void> {
    try {
        if (!api.storage.sync) return;
        await api.storage.sync.set({ [key]: value });
    } catch (error) {
        if (isExtensionContextInvalidatedError(error)) return;
        throw error;
    }
}

export async function sendMessage<T>(message: unknown): Promise<T | undefined> {
    try {
        return api.runtime.sendMessage(message) as Promise<T>;
    } catch (error) {
        if (isExtensionContextInvalidatedError(error)) return undefined;
        throw error;
    }
}

export function onMessage(
    callback: (
        message: unknown,
        sender: chrome.runtime.MessageSender,
    ) => Promise<unknown> | unknown,
): void {
    try {
        api.runtime.onMessage.addListener(
            (
                message: unknown,
                sender: chrome.runtime.MessageSender,
                sendResponse: (response?: unknown) => void,
            ) => {
                try {
                    const result = callback(message, sender);

                    if (result instanceof Promise) {
                        result.then(sendResponse).catch((err: unknown) => {
                            if (!isExtensionContextInvalidatedError(err)) {
                                console.error("[AI Chat Speed Booster] message handler error:", err);
                            }
                            sendResponse(undefined);
                        });
                        return true;
                    }

                    if (result !== undefined) {
                        sendResponse(result);
                    }
                } catch (error) {
                    if (!isExtensionContextInvalidatedError(error)) {
                        console.error("[AI Chat Speed Booster] message handler error:", error);
                    }
                    sendResponse(undefined);
                }

                return false;
            },
        );
    } catch (error) {
        if (isExtensionContextInvalidatedError(error)) return;
        throw error;
    }
}

export function onStorageChanged(
    callback: (
        changes: Record<string, chrome.storage.StorageChange>,
        areaName: string,
    ) => void,
): void {
    try {
        api.storage.onChanged.addListener(callback);
    } catch (error) {
        if (isExtensionContextInvalidatedError(error)) return;
        throw error;
    }
}

export function getURL(path: string): string {
    try {
        return api.runtime.getURL(path);
    } catch (error) {
        if (isExtensionContextInvalidatedError(error)) return path;
        throw error;
    }
}
