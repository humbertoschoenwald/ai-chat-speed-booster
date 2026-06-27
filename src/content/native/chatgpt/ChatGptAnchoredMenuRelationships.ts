import { containsChatGptComposerScope } from "./ChatGptComposerScope";
import { CHATGPT_SIDEBAR_SCOPE_SELECTOR } from "./ChatGptSidebarScope";

export interface ChatGptAnchoredMenuRelationshipSnapshot {
    readonly documentRelationshipCount: number;
    readonly composerRelationshipCount: number;
    readonly sidebarRelationshipCount: number;
    readonly turnRelationshipCount: number;
}

const ANCHORED_MENU_RELATIONSHIP_SELECTOR = [
    "[aria-controls]",
    "[aria-describedby]",
    "[aria-expanded]",
    "[interestfor]",
    "[anchor-name]",
    "[style*='anchor-name' i]",
].join(",");

export function hasChatGptAnchoredMenuRelationship(root: ParentNode): boolean {
    const isElement = typeof HTMLElement !== "undefined" && root instanceof HTMLElement;
    return (isElement && root.matches(ANCHORED_MENU_RELATIONSHIP_SELECTOR))
        || root.querySelector?.(ANCHORED_MENU_RELATIONSHIP_SELECTOR) !== null;
}

export function inspectChatGptAnchoredMenuRelationships(options: {
    readonly documentRoot: Document;
    readonly turns: readonly HTMLElement[];
}): ChatGptAnchoredMenuRelationshipSnapshot {
    const related = query(options.documentRoot, ANCHORED_MENU_RELATIONSHIP_SELECTOR);
    return {
        documentRelationshipCount: related.length,
        composerRelationshipCount: related.filter((element) => containsChatGptComposerScope(element)).length,
        sidebarRelationshipCount: related.filter((element) => element.closest(CHATGPT_SIDEBAR_SCOPE_SELECTOR) !== null).length,
        turnRelationshipCount: options.turns.reduce((total, turn) => total + query(turn, ANCHORED_MENU_RELATIONSHIP_SELECTOR).length, 0),
    };
}

export function getChatGptAnchoredMenuRelationshipSelectorForTests(): string {
    return ANCHORED_MENU_RELATIONSHIP_SELECTOR;
}

function query(root: ParentNode, selector: string): HTMLElement[] {
    return Array.from(root.querySelectorAll?.<HTMLElement>(selector) ?? []);
}
