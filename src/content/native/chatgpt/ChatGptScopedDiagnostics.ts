import { containsChatGptComposerScope } from "./ChatGptComposerScope";
import { dedupeChatGptTurnElements } from "./ChatGptSelectors";
import { CHATGPT_SIDEBAR_SCOPE_SELECTOR } from "./ChatGptSidebarScope";
import { inspectChatGptStickyChromeBoundary, type ChatGptStickyChromeBoundarySnapshot } from "./ChatGptStickyChromeBoundary";

export interface ChatGptScopedDiagnosticsSnapshot {
    readonly documentNodeCount: number;
    readonly conversationNodeCount: number;
    readonly canonicalTurnCount: number;
    readonly canonicalTurnNodeCount: number;
    readonly composerNodeCount: number;
    readonly sidebarNodeCount: number;
    readonly stickyChrome: ChatGptStickyChromeBoundarySnapshot;
}

const COMPOSER_SCOPE_SELECTOR = "#prompt-textarea,[data-testid='prompt-textarea'],textarea,[contenteditable='true'],.ProseMirror";

export function inspectChatGptScopedDiagnostics(options: {
    readonly documentRoot: Document;
    readonly conversationRoot: ParentNode;
    readonly turns: readonly HTMLElement[];
}): ChatGptScopedDiagnosticsSnapshot {
    const canonicalTurns = dedupeChatGptTurnElements(options.turns);
    return {
        documentNodeCount: countNodes(options.documentRoot),
        conversationNodeCount: countNodes(options.conversationRoot),
        canonicalTurnCount: canonicalTurns.length,
        canonicalTurnNodeCount: canonicalTurns.reduce((total, turn) => total + countNodes(turn), 0),
        composerNodeCount: countComposerNodes(options.documentRoot),
        sidebarNodeCount: countNodesInScopes(options.documentRoot, CHATGPT_SIDEBAR_SCOPE_SELECTOR),
        stickyChrome: inspectChatGptStickyChromeBoundary(options.documentRoot),
    };
}

export function getChatGptScopedDiagnosticsSelectorsForTests(): {
    readonly composer: string;
    readonly sidebar: string;
} {
    return {
        composer: COMPOSER_SCOPE_SELECTOR,
        sidebar: CHATGPT_SIDEBAR_SCOPE_SELECTOR,
    };
}

function countComposerNodes(root: ParentNode): number {
    const candidates = Array.from(root.querySelectorAll?.<HTMLElement>(COMPOSER_SCOPE_SELECTOR) ?? []);
    const composerRoots = candidates.filter((candidate) => containsChatGptComposerScope(candidate));
    return countUniqueScopes(composerRoots);
}

function countNodesInScopes(root: ParentNode, selector: string): number {
    return countUniqueScopes(Array.from(root.querySelectorAll?.<HTMLElement>(selector) ?? []));
}

function countUniqueScopes(scopes: readonly HTMLElement[]): number {
    const roots = scopes.filter((scope) => !scopes.some((candidate) => candidate !== scope && candidate.contains(scope)));
    return roots.reduce((total, scope) => total + countNodes(scope), 0);
}

function countNodes(root: ParentNode): number {
    return 1 + (root.querySelectorAll?.("*").length ?? 0);
}
