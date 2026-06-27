export interface ChatGptTailwindLayerOrderSnapshot {
    readonly tailwindLayerStyleCount: number;
    readonly acsbOwnedStyleCount: number;
}

const TAILWIND_LAYER_ORDER_SELECTOR = "style[data-tailwind-layer-order]";
const ACSB_OWNED_STYLE_SELECTOR = "style[data-acsb-owned-style='true']";

export function markAcsbOwnedNativeStyle(style: HTMLStyleElement, owner: string): HTMLStyleElement {
    style.setAttribute("data-acsb-owned-style", "true");
    style.setAttribute("data-acsb-style-owner", owner);
    return style;
}

export function inspectChatGptTailwindLayerOrder(root: ParentNode): ChatGptTailwindLayerOrderSnapshot {
    return {
        tailwindLayerStyleCount: root.querySelectorAll?.(TAILWIND_LAYER_ORDER_SELECTOR).length ?? 0,
        acsbOwnedStyleCount: root.querySelectorAll?.(ACSB_OWNED_STYLE_SELECTOR).length ?? 0,
    };
}

export function removeAcsbOwnedNativeStyles(root: ParentNode): void {
    root.querySelectorAll?.<HTMLElement>(ACSB_OWNED_STYLE_SELECTOR).forEach((style) => style.remove());
}

export function getChatGptTailwindLayerOrderSelectorsForTests(): readonly string[] {
    return [TAILWIND_LAYER_ORDER_SELECTOR, ACSB_OWNED_STYLE_SELECTOR];
}
