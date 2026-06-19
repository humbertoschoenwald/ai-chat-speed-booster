export interface ChatGptTurnContentVisibilityOptions {
    readonly liveWindowSize: number;
    readonly nearestWindow: number;
}

export interface ChatGptTurnContentVisibilityResult {
    readonly containedTurns: number;
}

const CONTAINED_ATTR = "data-acsb-native-contained-turn";
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
            turn.style.removeProperty("--acsb-contained-turn-height");
        });
    }

    sync(turns: readonly HTMLElement[], options: ChatGptTurnContentVisibilityOptions): ChatGptTurnContentVisibilityResult {
        const live = computeLiveIndexes(turns, options.liveWindowSize, options.nearestWindow);
        const decisions = turns.map((turn, index) => {
            const shouldContain = !live.has(index) && isSafeCompletedTurn(turn);
            return {
                turn,
                shouldContain,
                height: shouldContain ? this.readCachedHeight(turn, index) : 0,
            };
        });
        let containedTurns = 0;
        decisions.forEach(({ turn, shouldContain, height }) => {
            if (!shouldContain) {
                turn.removeAttribute(CONTAINED_ATTR);
                turn.style.removeProperty("--acsb-contained-turn-height");
                return;
            }
            turn.style.setProperty("--acsb-contained-turn-height", `${height}px`);
            turn.setAttribute(CONTAINED_ATTR, "true");
            containedTurns += 1;
        });
        return { containedTurns };
    }

    private readCachedHeight(turn: HTMLElement, index: number): number {
        const key = getTurnKey(turn, index);
        const cached = this.heightCache.get(key);
        if (cached) return cached;
        const measured = Math.max(120, Math.min(2400, Math.round(turn.getBoundingClientRect().height || turn.offsetHeight || 320)));
        this.heightCache.set(key, measured);
        return measured;
    }
}

function injectStyle(root: Document): void {
    if (root.getElementById(STYLE_ID)) return;
    const style = root.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `[${CONTAINED_ATTR}="true"]{content-visibility:auto!important;contain-intrinsic-size:auto var(--acsb-contained-turn-height,320px)!important;}`;
    (root.head ?? root.documentElement).appendChild(style);
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
    const currentTurn = centerElement?.closest<HTMLElement>("[data-turn-id],[data-testid^='conversation-turn-']");
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
    if (turn.closest("form, [contenteditable='true']")) return false;
    if (turn.querySelector(".loading-shimmer, .animate-spin, [data-is-streaming='true'], [aria-busy='true']")) return false;
    if (turn.querySelector(".text-token-text-error, [data-testid*='error'], [aria-label*='Regenerate'], [aria-label*='Retry']")) return false;
    if (turn.querySelector("[data-testid*='tool'], [data-message-author-role='tool']")) return false;
    const lower = text.toLowerCase();
    if (lower.includes("calling tool") || lower.includes("working on it")) return false;
    return true;
}
