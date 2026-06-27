import { inspectChatGptAmbiguousTestIds, type ChatGptAmbiguousTestIdSnapshot } from "./ChatGptAmbiguousTestIdAvoidance";
import { containsChatGptComposerScope } from "./ChatGptComposerScope";
import { CHATGPT_TURN_SELECTOR, CHATGPT_TOOL_SELECTOR, dedupeChatGptTurnElements } from "./ChatGptSelectors";
import { classifyChatGptToolCardLabel } from "./ChatGptToolCardLabelTaxonomy";

export type ChatGptSelectorDriftConfidence = "high" | "medium" | "low";

export interface ChatGptSelectorDriftSentinelSnapshot {
    readonly confidence: ChatGptSelectorDriftConfidence;
    readonly failedContracts: readonly string[];
    readonly turnCount: number;
    readonly dedupedTurnCount: number;
    readonly composerPresent: boolean;
    readonly scrollRootPresent: boolean;
    readonly toolCardCount: number;
    readonly knownToolLabelCount: number;
    readonly ambiguousTestIds: ChatGptAmbiguousTestIdSnapshot;
    readonly riskyOptimizationAllowed: boolean;
}

export interface ChatGptSelectorDriftSentinelInput {
    readonly root: ParentNode;
    readonly scrollRoot: HTMLElement | null;
    readonly turns: readonly HTMLElement[];
}

const KNOWN_TOOL_LABEL_KINDS = new Set(["completed", "active", "lookup-status", "collapsed-control", "expanded-control"]);
const COMPOSER_CANDIDATE_SELECTOR = "#prompt-textarea,[data-testid='prompt-textarea'],textarea,[contenteditable='true'],.ProseMirror";

export function inspectChatGptSelectorDrift(input: ChatGptSelectorDriftSentinelInput): ChatGptSelectorDriftSentinelSnapshot {
    const failedContracts: string[] = [];
    const root = input.root;
    const turnCandidates = root.querySelectorAll?.<HTMLElement>(CHATGPT_TURN_SELECTOR) ?? [];
    const dedupedTurns = dedupeChatGptTurnElements([...turnCandidates, ...input.turns]);
    const composer = root.querySelector?.<HTMLElement>(COMPOSER_CANDIDATE_SELECTOR) ?? null;
    const toolCards = Array.from(root.querySelectorAll?.<HTMLElement>(CHATGPT_TOOL_SELECTOR) ?? []);
    const knownToolLabelCount = countKnownToolLabels(toolCards);
    const ambiguousTestIds = inspectChatGptAmbiguousTestIds(root);

    if (!input.scrollRoot) failedContracts.push("chatgpt-scroll-root-missing");
    if (input.turns.length > 0 && dedupedTurns.length === 0) failedContracts.push("chatgpt-turn-selector-empty");
    if (dedupedTurns.length > 0 && dedupedTurns.length > input.turns.length + 3) failedContracts.push("chatgpt-turn-selector-overbroad");
    if (!composer || !containsChatGptComposerScope(composer)) failedContracts.push("chatgpt-composer-scope-missing");
    if (toolCards.length > 0 && knownToolLabelCount === 0) failedContracts.push("chatgpt-tool-labels-unknown");

    const confidence = classifyConfidence(failedContracts);
    return {
        confidence,
        failedContracts,
        turnCount: input.turns.length,
        dedupedTurnCount: dedupedTurns.length,
        composerPresent: composer !== null,
        scrollRootPresent: input.scrollRoot !== null,
        toolCardCount: toolCards.length,
        knownToolLabelCount,
        ambiguousTestIds,
        riskyOptimizationAllowed: confidence !== "low",
    };
}

function countKnownToolLabels(toolCards: readonly HTMLElement[]): number {
    let knownCount = 0;
    for (const card of toolCards) {
        const label = readToolCardLabel(card);
        if (KNOWN_TOOL_LABEL_KINDS.has(classifyChatGptToolCardLabel(label).kind)) knownCount += 1;
    }
    return knownCount;
}

function readToolCardLabel(card: HTMLElement): string {
    const labelHost = card.querySelector<HTMLElement>("[aria-label],button,[role='button']") ?? card;
    return (labelHost.getAttribute("aria-label") ?? labelHost.innerText ?? labelHost.textContent ?? "").replace(/\s+/g, " ").trim();
}

function classifyConfidence(failedContracts: readonly string[]): ChatGptSelectorDriftConfidence {
    if (failedContracts.includes("chatgpt-turn-selector-empty") || failedContracts.includes("chatgpt-turn-selector-overbroad")) return "low";
    if (failedContracts.includes("chatgpt-scroll-root-missing") && failedContracts.includes("chatgpt-composer-scope-missing")) return "low";
    return failedContracts.length > 0 ? "medium" : "high";
}
