import {
    CHATGPT_ERROR_SELECTOR,
    CHATGPT_TOOL_SELECTOR,
    CHATGPT_TURN_SELECTOR,
    readChatGptLastKnownHeight,
} from "./ChatGptSelectors";
import { containsChatGptComposerScope } from "./ChatGptComposerScope";
import { containsChatGptConversationScreenshotBoundary } from "./ChatGptConversationScreenshotBoundary";

export interface ChatGptTurnContentVisibilityOptions {
    readonly liveWindowSize: number;
    readonly nearestWindow: number;
    readonly maxContainedTurns: number;
}

export interface ChatGptTurnContentVisibilityResult {
    readonly containedTurns: number;
    readonly budgetLimit: number;
    readonly budgetOverrun: number;
    readonly budgetAffectedTurnIds: readonly string[];
}

const CONTAINED_ATTR = "data-acsb-native-contained-turn";
const QUIET_ATTR = "data-acsb-native-quiet-turn";
const QUIET_RESTORE_BOUND_ATTR = "data-acsb-native-quiet-restore-bound";
const STYLE_ID = "acsb-native-turn-content-visibility-style";

export class ChatGptTurnContentVisibilityController {
    private readonly heightCache = new Map<string, number>();

    start(root: Document = document): void {
        injectStyle(root);
    }

    stop(root: ParentNode = document): void {
        this.restoreAll(root);
        this.invalidateAll();
        if (root instanceof Document) root.getElementById(STYLE_ID)?.remove();
    }

    invalidateAll(): void {
        this.heightCache.clear();
    }

    restoreAll(root: ParentNode = document): void {
        root.querySelectorAll<HTMLElement>(`[${CONTAINED_ATTR}="true"]`).forEach((turn) => {
            turn.removeAttribute(CONTAINED_ATTR);
            turn.removeAttribute(QUIET_ATTR);
            turn.style.removeProperty("--acsb-contained-turn-height");
        });
    }

    sync(turns: readonly HTMLElement[], options: ChatGptTurnContentVisibilityOptions): ChatGptTurnContentVisibilityResult {
        const live = computeLiveIndexes(turns, options.liveWindowSize, options.nearestWindow);
        const decisions = turns.map((turn, index) => {
            const shouldContain = !live.has(index) && isSafeCompletedTurn(turn);
            return {
                turn,
                index,
                key: getTurnKey(turn, index),
                shouldContain,
                height: shouldContain ? this.readCachedHeight(turn, index) : 0,
            };
        });
        const candidates = decisions.filter((decision) => decision.shouldContain);
        const budgetLimit = Math.max(0, Math.floor(options.maxContainedTurns));
        const allowedCandidates = new Set(candidates.slice(Math.max(0, candidates.length - budgetLimit)).map((decision) => decision.turn));
        const budgetAffectedTurnIds: string[] = [];
        let containedTurns = 0;
        decisions.forEach(({ turn, shouldContain, height, key }) => {
            if (!shouldContain || !allowedCandidates.has(turn)) {
                if (shouldContain) budgetAffectedTurnIds.push(key);
                turn.removeAttribute(CONTAINED_ATTR);
                turn.removeAttribute(QUIET_ATTR);
                turn.style.removeProperty("--acsb-contained-turn-height");
                return;
            }
            turn.style.setProperty("--acsb-contained-turn-height", `${height}px`);
            turn.setAttribute(CONTAINED_ATTR, "true");
            turn.setAttribute(QUIET_ATTR, "true");
            bindQuietRestore(turn);
            containedTurns += 1;
        });
        return {
            containedTurns,
            budgetLimit,
            budgetOverrun: Math.max(0, candidates.length - budgetLimit),
            budgetAffectedTurnIds,
        };
    }

    private readCachedHeight(turn: HTMLElement, index: number): number {
        const key = getTurnKey(turn, index);
        const cached = this.heightCache.get(key);
        if (cached) return cached;
        const hinted = readChatGptLastKnownHeight(turn);
        if (hinted) {
            this.heightCache.set(key, hinted);
            return hinted;
        }
        const measured = Math.max(120, Math.min(2400, Math.round(turn.getBoundingClientRect().height || turn.offsetHeight || 320)));
        this.heightCache.set(key, measured);
        return measured;
    }
}

function injectStyle(root: Document): void {
    if (root.getElementById(STYLE_ID)) return;
    const style = root.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `[${CONTAINED_ATTR}="true"]{content-visibility:auto!important;contain-intrinsic-size:auto var(--acsb-contained-turn-height,320px)!important;}[${CONTAINED_ATTR}="true"][${QUIET_ATTR}="true"] *{transition-duration:0s!important;animation-duration:0.001s!important;animation-iteration-count:1!important;}`;
    (root.head ?? root.documentElement).appendChild(style);
}

function bindQuietRestore(turn: HTMLElement): void {
    if (turn.getAttribute(QUIET_RESTORE_BOUND_ATTR) === "true") return;
    const restore = (): void => {
        turn.removeAttribute(QUIET_ATTR);
    };
    turn.addEventListener("pointerenter", restore, { passive: true });
    turn.addEventListener("pointerover", restore, { passive: true });
    turn.addEventListener("touchstart", restore, { passive: true });
    turn.addEventListener("contextmenu", restore);
    turn.addEventListener("keydown", restore);
    turn.addEventListener("focusin", restore);
    turn.setAttribute(QUIET_RESTORE_BOUND_ATTR, "true");
}

function computeLiveIndexes(turns: readonly HTMLElement[], liveWindowSize: number, nearestWindow: number): Set<number> {
    const live = new Set<number>();
    const activeIndex = findViewportTurnIndex(turns);
    for (let index = Math.max(0, activeIndex - nearestWindow); index <= Math.min(turns.length - 1, activeIndex + nearestWindow); index += 1) {
        live.add(index);
    }
    for (let index = Math.max(0, turns.length - liveWindowSize); index < turns.length; index += 1) {
        live.add(index);
    }
    return live;
}

function getTurnKey(turn: HTMLElement, index: number): string {
    return turn.getAttribute("data-turn-id") ?? turn.getAttribute("data-testid") ?? `chatgpt-turn-${index}`;
}

function findViewportTurnIndex(turns: readonly HTMLElement[]): number {
    if (turns.length === 0) return 0;
    const centerElement = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    const currentTurn = centerElement?.closest<HTMLElement>(CHATGPT_TURN_SELECTOR);
    if (currentTurn) {
        const index = turns.findIndex((turn) => turn === currentTurn || turn.contains(currentTurn));
        if (index >= 0) return index;
    }
    return turns.length - 1;
}

function isSafeCompletedTurn(turn: HTMLElement): boolean {
    const text = (turn.innerText || turn.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) return false;
    if (turn.contains(document.activeElement)) return false;
    if (containsChatGptComposerScope(turn)) return false;
    if (containsChatGptConversationScreenshotBoundary(turn)) return false;
    if (turn.querySelector(".loading-shimmer, .animate-spin, [data-is-streaming='true'], [aria-busy='true']")) return false;
    if (turn.querySelector(CHATGPT_ERROR_SELECTOR)) return false;
    if (turn.querySelector(CHATGPT_TOOL_SELECTOR)) return false;
    const lower = text.toLowerCase();
    if (lower.includes("calling tool") || lower.includes("working on it")) return false;
    return true;
}
