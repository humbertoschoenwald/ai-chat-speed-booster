import { test, expect } from "@playwright/test";
import {
    getChatGptTailwindLayerOrderSelectorsForTests,
    inspectChatGptTailwindLayerOrder,
    markAcsbOwnedNativeStyle,
    removeAcsbOwnedNativeStyles,
} from "../src/content/native/chatgpt/ChatGptTailwindLayerOrderGuard";

test("ChatGPT Tailwind layer order metadata is read only", () => {
    const selectors = getChatGptTailwindLayerOrderSelectorsForTests();

    expect(selectors[0]).toBe("style[data-tailwind-layer-order]");
    expect(selectors[1]).toContain("data-acsb-owned-style");
    expect(inspectChatGptTailwindLayerOrder(rootWith({ tailwind: 1, acsb: 2 }))).toEqual({
        tailwindLayerStyleCount: 1,
        acsbOwnedStyleCount: 2,
    });
});

test("ACSB Native styles are explicitly owned and removable", () => {
    const style = attributeStyle();
    markAcsbOwnedNativeStyle(style, "test-owner");

    expect(style.getAttribute("data-acsb-owned-style")).toBe("true");
    expect(style.getAttribute("data-acsb-style-owner")).toBe("test-owner");

    const removed: string[] = [];
    removeAcsbOwnedNativeStyles(rootWith({ acsb: 2, removed }));
    expect(removed).toEqual(["acsb", "acsb"]);
});

test("ChatGPT Native style injectors mark ACSB styles without touching Tailwind layers", async () => {
    const fs = await import("node:fs/promises");
    const toolbarSource = await fs.readFile("src/content/native/chatgpt/ChatGptActionToolbarHoverGate.ts", "utf8");
    const codeSource = await fs.readFile("src/content/native/chatgpt/ChatGptCodeBlockContainmentController.ts", "utf8");
    const turnSource = await fs.readFile("src/content/native/chatgpt/ChatGptTurnContainmentController.ts", "utf8");

    expect(toolbarSource).toContain("markAcsbOwnedNativeStyle(style");
    expect(codeSource).toContain("markAcsbOwnedNativeStyle(style");
    expect(turnSource).toContain("markAcsbOwnedNativeStyle(style");
    expect(toolbarSource).not.toContain("data-tailwind-layer-order");
    expect(codeSource).not.toContain("data-tailwind-layer-order");
    expect(turnSource).not.toContain("data-tailwind-layer-order");
});

function attributeStyle(): HTMLStyleElement {
    const attrs = new Map<string, string>();
    return {
        setAttribute: (name: string, value: string) => attrs.set(name, value),
        getAttribute: (name: string) => attrs.get(name) ?? null,
    } as unknown as HTMLStyleElement;
}

function rootWith(options: { readonly tailwind?: number; readonly acsb?: number; readonly removed?: string[] }): ParentNode {
    return {
        querySelectorAll: (selector: string) => {
            if (selector.includes("tailwind")) return Array.from({ length: options.tailwind ?? 0 }, () => ({}));
            if (selector.includes("acsb-owned")) {
                return Array.from({ length: options.acsb ?? 0 }, () => ({
                    remove: () => options.removed?.push("acsb"),
                }));
            }
            return [];
        },
    } as unknown as ParentNode;
}
