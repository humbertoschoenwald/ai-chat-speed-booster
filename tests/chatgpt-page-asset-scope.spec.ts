import { test, expect } from "@playwright/test";
import {
    filterChatGptPageAssetNodes,
    getChatGptPageAssetSelectorForTests,
    summarizeChatGptPageAssetScope,
} from "../src/content/native/chatgpt/ChatGptPageAssetScope";
import { getChatGptConversationScopeSelectorForTests } from "../src/content/native/chatgpt/ChatGptConversationScope";

test("ChatGPT page asset scope filters asset-heavy nodes", () => {
    const assetNode = fakeElement(true);
    const styleNode = fakeElement(true);
    const turnNode = fakeElement(false);

    expect(filterChatGptPageAssetNodes([assetNode, styleNode, turnNode])).toEqual([turnNode]);
    expect(summarizeChatGptPageAssetScope([assetNode, styleNode, turnNode])).toEqual({
        assetNodeCount: 2,
        nonAssetNodeCount: 1,
    });
});

test("ChatGPT page asset and conversation selectors stay explicit", () => {
    expect(getChatGptPageAssetSelectorForTests()).toContain("modulepreload");
    expect(getChatGptPageAssetSelectorForTests()).toContain("stylesheet");
    expect(getChatGptConversationScopeSelectorForTests()).toContain("main");
});

function fakeElement(asset: boolean): HTMLElement {
    return {
        matches: () => asset,
        closest: () => null,
    } as unknown as HTMLElement;
}
