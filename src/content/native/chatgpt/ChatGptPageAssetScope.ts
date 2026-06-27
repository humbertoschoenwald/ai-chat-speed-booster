export interface ChatGptPageAssetScopeSnapshot {
    readonly assetNodeCount: number;
    readonly nonAssetNodeCount: number;
}

const CHATGPT_PAGE_ASSET_SELECTOR = [
    "style",
    "link[rel='stylesheet']",
    "link[rel='modulepreload']",
    "link[rel='preload']",
    "script",
    "template",
    "noscript",
    "svg defs",
].join(",");

export function isChatGptPageAssetNode(element: HTMLElement): boolean {
    return element.matches?.(CHATGPT_PAGE_ASSET_SELECTOR) === true
        || (element.closest?.(CHATGPT_PAGE_ASSET_SELECTOR) ?? null) !== null;
}

export function filterChatGptPageAssetNodes(elements: readonly HTMLElement[]): HTMLElement[] {
    return elements.filter((element) => !isChatGptPageAssetNode(element));
}

export function summarizeChatGptPageAssetScope(elements: readonly HTMLElement[]): ChatGptPageAssetScopeSnapshot {
    let assetNodeCount = 0;
    let nonAssetNodeCount = 0;
    for (const element of elements) {
        if (isChatGptPageAssetNode(element)) {
            assetNodeCount += 1;
        } else {
            nonAssetNodeCount += 1;
        }
    }
    return { assetNodeCount, nonAssetNodeCount };
}

export function getChatGptPageAssetSelectorForTests(): string {
    return CHATGPT_PAGE_ASSET_SELECTOR;
}
