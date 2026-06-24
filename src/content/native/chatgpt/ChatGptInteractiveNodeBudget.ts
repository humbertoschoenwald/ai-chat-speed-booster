import { CHATGPT_TOOL_SELECTOR } from "./ChatGptSelectors";
import { createChatGptComposerScopeSnapshot, filterChatGptComposerScopeElements } from "./ChatGptComposerScope";

export interface ChatGptInteractiveNodeBudgetSnapshot {
    readonly totalButtons: number;
    readonly totalSvgs: number;
    readonly threadButtons: number;
    readonly threadSvgs: number;
    readonly toolGroupButtons: number;
    readonly toolGroupSvgs: number;
    readonly composerButtons: number;
    readonly composerSvgs: number;
    readonly composerEditableNodes: number;
    readonly nonThreadButtons: number;
}

const BUTTON_SELECTOR = "button";
const SVG_SELECTOR = "svg";

export function createChatGptInteractiveNodeBudgetSnapshot(
    root: ParentNode,
    turns: readonly HTMLElement[],
): ChatGptInteractiveNodeBudgetSnapshot {
    const composer = createChatGptComposerScopeSnapshot(root);
    const allButtons = uniqueElements(query(root, BUTTON_SELECTOR));
    const allSvgs = uniqueElements(query(root, SVG_SELECTOR));
    const threadButtons = uniqueElements(filterChatGptComposerScopeElements(turns.flatMap((turn) => query(turn, BUTTON_SELECTOR))));
    const threadSvgs = uniqueElements(filterChatGptComposerScopeElements(turns.flatMap((turn) => query(turn, SVG_SELECTOR))));
    const toolGroups = uniqueElements(filterChatGptComposerScopeElements(turns.flatMap((turn) => query(turn, CHATGPT_TOOL_SELECTOR))));
    const toolGroupButtons = uniqueElements(toolGroups.flatMap((group) => query(group, BUTTON_SELECTOR)));
    const toolGroupSvgs = uniqueElements(toolGroups.flatMap((group) => query(group, SVG_SELECTOR)));
    const composerButtons = composer.composerButtons;

    return {
        totalButtons: allButtons.length,
        totalSvgs: allSvgs.length,
        threadButtons: threadButtons.length,
        threadSvgs: threadSvgs.length,
        toolGroupButtons: toolGroupButtons.length,
        toolGroupSvgs: toolGroupSvgs.length,
        composerButtons,
        composerSvgs: composer.composerSvgs,
        composerEditableNodes: composer.composerEditableNodes,
        nonThreadButtons: Math.max(0, allButtons.length - threadButtons.length),
    };
}

function query(root: ParentNode, selector: string): HTMLElement[] {
    return Array.from(root.querySelectorAll<HTMLElement>(selector));
}

function uniqueElements(elements: readonly HTMLElement[]): HTMLElement[] {
    return [...new Set(elements)];
}
