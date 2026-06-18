// SCHOENWALD-LARGE-FILE owner=ai-chat-speed-booster reason="Native ChatGPT snapshot rendering keeps role-aware restore logic together" split="Move shared DOM helpers if this grows further" validation="pnpm validate" review="Native Mode only; no persistent content storage"
import {
    ChatGptTextSnapshotCache,
    type ChatGptTextSnapshotCacheSnapshot,
    renderChatGptTextSnapshot,
} from "./ChatGptTextSnapshotCache";

export interface ChatGptTextSnapshotRenderOptions {
    readonly enabled: boolean;
    readonly liveWindowSize: number;
    readonly nearestWindow: number;
    readonly nowMs: number;
}

export interface ChatGptTextSnapshotRenderResult {
    readonly snapshotHosts: number;
    readonly hydratedHosts: number;
    readonly cache: ChatGptTextSnapshotCacheSnapshot;
}

const HOST_ATTR = "data-acsb-native-snapshot-host";
const SNAPSHOT_SELECTOR = '[data-acsb-native-snapshot="true"]';
const STYLE_ID = "acsb-native-text-snapshot-style";
const MAX_SNAPSHOT_WRITES_PER_SYNC = 8;

export class ChatGptTextSnapshotRenderer {
    private readonly cache = new ChatGptTextSnapshotCache();
    private root: Document | null = null;

    start(root: Document = document): void {
        if (this.root) return;
        this.root = root;
        injectSnapshotStyle(root);
        root.addEventListener("pointerdown", this.restoreTarget, true);
        root.addEventListener("focusin", this.restoreTarget, true);
    }

    stop(): void {
        const root = this.root;
        if (!root) return;
        root.removeEventListener("pointerdown", this.restoreTarget, true);
        root.removeEventListener("focusin", this.restoreTarget, true);
        this.restoreAll(root);
        this.cache.clear();
        this.root = null;
    }

    sync(turns: readonly HTMLElement[], options: ChatGptTextSnapshotRenderOptions): ChatGptTextSnapshotRenderResult {
        if (!options.enabled) {
            this.restoreAll(this.root ?? document);
            return { snapshotHosts: 0, hydratedHosts: turns.length, cache: this.cache.snapshot() };
        }

        const liveKeys = computeLiveKeys(turns, options.liveWindowSize, options.nearestWindow);
        let snapshotHosts = 0;
        let hydratedHosts = 0;
        let snapshotWrites = 0;
        turns.forEach((turn, index) => {
            const key = getTurnKey(turn, index);
            const shouldCheckPin = index >= Math.max(0, turns.length - options.liveWindowSize - options.nearestWindow - 2);
            if (liveKeys.has(key) || (shouldCheckPin && isPinnedTurn(turn))) {
                this.restore(turn);
                hydratedHosts += 1;
                return;
            }
            if (turn.getAttribute(HOST_ATTR) === "true") {
                snapshotHosts += 1;
                return;
            }
            if (snapshotWrites >= MAX_SNAPSHOT_WRITES_PER_SYNC) {
                hydratedHosts += 1;
                return;
            }
            if (this.snapshot(turn, key, options.nowMs)) {
                snapshotHosts += 1;
                snapshotWrites += 1;
            } else {
                hydratedHosts += 1;
            }
        });
        return { snapshotHosts, hydratedHosts, cache: this.cache.snapshot() };
    }

    restoreAll(root: ParentNode = document): void {
        root.querySelectorAll<HTMLElement>(`[${HOST_ATTR}="true"]`).forEach((turn) => this.restore(turn));
    }

    private snapshot(turn: HTMLElement, key: string, nowMs: number): boolean {
        if (turn.getAttribute(HOST_ATTR) === "true") return true;
        const text = (turn.innerText || turn.textContent || "").replace(/\s+/g, " ").trim();
        if (!text) return false;
        this.cache.put(key, text, nowMs);
        const snapshot = this.cache.get(key, nowMs);
        if (!snapshot) return false;
        turn.insertAdjacentHTML("beforeend", renderChatGptTextSnapshot(snapshot));
        turn.setAttribute(HOST_ATTR, "true");
        turn.setAttribute("data-acsb-native-role", getTurnRole(turn));
        return true;
    }

    private restore(turn: HTMLElement): void {
        if (turn.getAttribute(HOST_ATTR) !== "true") return;
        turn.removeAttribute(HOST_ATTR);
        turn.querySelectorAll<HTMLElement>(SNAPSHOT_SELECTOR).forEach((node) => node.remove());
    }

    private readonly restoreTarget = (event: Event): void => {
        const target = event.target instanceof Element ? event.target.closest<HTMLElement>(`[${HOST_ATTR}="true"]`) : null;
        if (target) this.restore(target);
    };
}

function injectSnapshotStyle(root: Document): void {
    if (root.getElementById(STYLE_ID)) return;
    const style = root.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `[${HOST_ATTR}="true"]>:not(${SNAPSHOT_SELECTOR}){display:none!important}` +
        `${SNAPSHOT_SELECTOR}{white-space:pre-wrap;contain:content;content-visibility:auto;}`;
    (root.head ?? root.documentElement).appendChild(style);
}

function computeLiveKeys(turns: readonly HTMLElement[], liveWindowSize: number, nearestWindow: number): Set<string> {
    const live = new Set<string>();
    const activeIndex = findViewportTurnIndex(turns);
    for (let i = Math.max(0, activeIndex - nearestWindow); i <= Math.min(turns.length - 1, activeIndex + nearestWindow); i++) live.add(getTurnKey(turns[i], i));
    turns.slice(Math.max(0, turns.length - liveWindowSize)).forEach((turn, offset) => live.add(getTurnKey(turn, turns.length - liveWindowSize + offset)));
    addLatestRole(turns, live, "user");
    addLatestRole(turns, live, "assistant");
    return live;
}

function getTurnKey(turn: HTMLElement, index: number): string {
    return turn.getAttribute("data-turn-id") ?? turn.getAttribute("data-testid") ?? `chatgpt-turn-${index}`;
}

function getTurnRole(turn: HTMLElement): string {
    return turn.querySelector<HTMLElement>("[data-message-author-role]")?.dataset.messageAuthorRole ?? "unknown";
}

function addLatestRole(turns: readonly HTMLElement[], live: Set<string>, role: string): void {
    for (let index = turns.length - 1; index >= 0; index--) {
        if (getTurnRole(turns[index]) === role) { live.add(getTurnKey(turns[index], index)); return; }
    }
}

function findViewportTurnIndex(turns: readonly HTMLElement[]): number {
    if (turns.length === 0) return 0;
    const root = turns[0].ownerDocument;
    const centerElement = root.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    const currentTurn = centerElement?.closest<HTMLElement>(`[${HOST_ATTR}="true"],[data-turn-id],[data-testid^="conversation-turn-"]`);
    if (currentTurn) {
        const index = turns.findIndex((turn) => turn === currentTurn || turn.contains(currentTurn));
        if (index >= 0) return index;
    }
    return turns.length - 1;
}

function isPinnedTurn(turn: HTMLElement): boolean {
    return turn.contains(document.activeElement) ||
        !!turn.querySelector('[aria-label*="Stop"], [data-testid*="stop"], [data-is-streaming="true"], [aria-busy="true"]');
}
