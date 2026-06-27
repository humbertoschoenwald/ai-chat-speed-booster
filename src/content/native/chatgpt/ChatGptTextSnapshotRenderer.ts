// Large-file note: native ChatGPT snapshot rendering keeps role-aware restore logic together. Move shared DOM helpers if this grows further.
import {
    ChatGptTextSnapshotCache,
    type ChatGptTextSnapshotCacheSnapshot,
    renderChatGptTextSnapshot,
} from "./ChatGptTextSnapshotCache";
import {
    CHATGPT_ERROR_SELECTOR,
    CHATGPT_STREAMING_SELECTOR,
    CHATGPT_TOOL_SELECTOR,
    CHATGPT_TURN_SELECTOR,
} from "./ChatGptSelectors";
import { CHATGPT_ACCESSIBLE_STATUS_SELECTOR, containsChatGptAccessibleStatus } from "./ChatGptAccessibleStatusPreservation";
import { containsChatGptComposerScope } from "./ChatGptComposerScope";
import { readChatGptMessageIdentityKey } from "./ChatGptMessageMetadata";
import { ChatGptSegmentMarkerDeltaCache } from "./ChatGptSegmentMarkerDeltaCache";

export interface ChatGptTextSnapshotRenderOptions {
    readonly enabled: boolean;
    readonly liveWindowSize: number;
    readonly nearestWindow: number;
    readonly nowMs: number;
}

export interface ChatGptTextSnapshotRenderResult {
    readonly snapshotHosts: number;
    readonly hydratedHosts: number;
    readonly hostRevealLoops: number;
    readonly cache: ChatGptTextSnapshotCacheSnapshot;
}

const HOST_ATTR = "data-acsb-native-snapshot-host";
const SNAPSHOT_SELECTOR = '[data-acsb-native-snapshot="true"]';
const SNAPSHOT_POINTER_POLICY_SELECTOR = '[data-acsb-native-pointer-policy="restore-only"]';
const STYLE_ID = "acsb-native-text-snapshot-style";
const MAX_SNAPSHOT_WRITES_PER_SYNC = 8;
const COPY_CONTROL_SELECTOR = "[data-testid='copy-turn-action-button'],[aria-label*='copy' i]";
const INTERACTIVE_CONTROL_SELECTOR = "button,[role='button'],a[href],[aria-haspopup='menu']";
const MARKDOWN_PROSE_BODY_SELECTOR = ".markdown,.prose,[data-message-author-role]";
const TEXT_EXTRACTION_EXCLUSION_SELECTOR = [
    CHATGPT_TOOL_SELECTOR,
    "button",
    "[role='button']",
    "[aria-hidden='true']",
    "[data-acsb-native-copy-affordance='true']",
    CHATGPT_ACCESSIBLE_STATUS_SELECTOR,
    "[data-rtl-flip]",
    "textarea",
    "[contenteditable='true']",
    ".ProseMirror",
].join(",");

export class ChatGptTextSnapshotRenderer {
    static cleanupNativeArtifacts(root: Document = document): void {
        root.querySelectorAll<HTMLElement>(`[${HOST_ATTR}="true"]`).forEach((turn) => {
            turn.removeAttribute(HOST_ATTR);
            turn.removeAttribute("data-acsb-native-role");
            turn.querySelectorAll<HTMLElement>(SNAPSHOT_SELECTOR).forEach((node) => node.remove());
        });
        root.getElementById(STYLE_ID)?.remove();
    }

    private readonly cache = new ChatGptTextSnapshotCache();
    private readonly segmentMarkers = new ChatGptSegmentMarkerDeltaCache();
    private root: Document | null = null;

    start(root: Document = document): void {
        if (this.root) return;
        this.root = root;
        injectSnapshotStyle(root);
        root.addEventListener("pointerover", this.restoreTarget, true);
        root.addEventListener("pointerdown", this.restoreTarget, true);
        root.addEventListener("touchstart", this.restoreTarget, true);
        root.addEventListener("contextmenu", this.restoreTarget, true);
        root.addEventListener("keydown", this.restoreTarget, true);
        root.addEventListener("focusin", this.restoreTarget, true);
    }

    stop(): void {
        const root = this.root;
        if (!root) return;
        root.removeEventListener("pointerover", this.restoreTarget, true);
        root.removeEventListener("pointerdown", this.restoreTarget, true);
        root.removeEventListener("touchstart", this.restoreTarget, true);
        root.removeEventListener("contextmenu", this.restoreTarget, true);
        root.removeEventListener("keydown", this.restoreTarget, true);
        root.removeEventListener("focusin", this.restoreTarget, true);
        this.restoreAll(root);
        ChatGptTextSnapshotRenderer.cleanupNativeArtifacts(root);
        this.cache.clear();
        this.segmentMarkers.clear();
        this.root = null;
    }

    sync(turns: readonly HTMLElement[], options: ChatGptTextSnapshotRenderOptions): ChatGptTextSnapshotRenderResult {
        if (!options.enabled) {
            this.restoreAll(this.root ?? document);
            return { snapshotHosts: 0, hydratedHosts: turns.length, hostRevealLoops: 0, cache: this.cache.snapshot() };
        }

        const liveKeys = computeLiveKeys(turns, options.liveWindowSize, options.nearestWindow);
        let snapshotHosts = 0;
        let hydratedHosts = 0;
        let hostRevealLoops = 0;
        let snapshotWrites = 0;
        turns.forEach((turn, index) => {
            const key = getTurnKey(turn, index);
            const snapshotNodePresent = turn.querySelector(SNAPSHOT_SELECTOR) !== null;
            const hostMarked = turn.getAttribute(HOST_ATTR) === "true";
            if (snapshotNodePresent && !hostMarked) hostRevealLoops += 1;
            const shouldCheckPin = index >= Math.max(0, turns.length - options.liveWindowSize - options.nearestWindow - 2);
            if (liveKeys.has(key) || (shouldCheckPin && isPinnedTurn(turn))) {
                this.restore(turn);
                hydratedHosts += 1;
                return;
            }
            if (hostMarked) {
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
        return { snapshotHosts, hydratedHosts, hostRevealLoops, cache: this.cache.snapshot() };
    }

    restoreAll(root: ParentNode = document): void {
        root.querySelectorAll<HTMLElement>(`[${HOST_ATTR}="true"]`).forEach((turn) => this.restore(turn));
    }

    private snapshot(turn: HTMLElement, key: string, nowMs: number): boolean {
        if (turn.getAttribute(HOST_ATTR) === "true") return true;
        if (!isSafeSnapshotCandidate(turn)) return false;
        const cached = this.cache.get(key, nowMs);
        if (cached) return this.renderSnapshot(turn, cached);
        const { text } = this.segmentMarkers.readOrExtract(
            key,
            turn,
            () => readCompletedChatGptMarkdownProseText(turn),
        );
        if (!text) return false;
        this.cache.put(key, text, nowMs);
        const snapshot = this.cache.get(key, nowMs);
        if (!snapshot) return false;
        return this.renderSnapshot(turn, snapshot);
    }

    private renderSnapshot(turn: HTMLElement, snapshot: ReturnType<ChatGptTextSnapshotCache["get"]>): boolean {
        if (!snapshot) return false;
        turn.insertAdjacentHTML("beforeend", renderChatGptTextSnapshot(snapshot, {
            copyAvailable: hasCopyControl(turn),
        }));
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
        if (event instanceof KeyboardEvent && event.key === "Tab") {
            this.restoreAll(this.root ?? document);
            return;
        }
        const eventTarget = event.target instanceof Element ? event.target : null;
        const target = eventTarget?.closest<HTMLElement>(`[${HOST_ATTR}="true"]`) ?? null;
        if (target) this.restore(target);
    };
}

function injectSnapshotStyle(root: Document): void {
    if (root.getElementById(STYLE_ID)) return;
    const style = root.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `[${HOST_ATTR}="true"]>:not(${SNAPSHOT_SELECTOR}){display:none!important}` +
        `${SNAPSHOT_SELECTOR}{white-space:pre-wrap;contain:content;content-visibility:auto;}` +
        `${SNAPSHOT_POINTER_POLICY_SELECTOR}{pointer-events:auto;cursor:text;}` +
        `${SNAPSHOT_POINTER_POLICY_SELECTOR} *{pointer-events:none!important;}` +
        `${SNAPSHOT_SELECTOR} [data-acsb-native-copy-affordance="true"]{display:inline-block;margin-inline-start:0.5rem;font-size:0.75em;opacity:0.7;pointer-events:none;}`;
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
    return readChatGptMessageIdentityKey(turn) ?? `chatgpt-turn-${index}`;
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
    const currentTurn = centerElement?.closest<HTMLElement>(`[${HOST_ATTR}="true"],${CHATGPT_TURN_SELECTOR}`);
    if (currentTurn) {
        const index = turns.findIndex((turn) => turn === currentTurn || turn.contains(currentTurn));
        if (index >= 0) return index;
    }
    return turns.length - 1;
}

export function readCompletedChatGptMarkdownProseText(turn: HTMLElement): string {
    if (containsChatGptComposerScope(turn)) return "";
    const source = turn.querySelector<HTMLElement>(MARKDOWN_PROSE_BODY_SELECTOR) ?? turn;
    const clone = source.cloneNode(true) as HTMLElement;
    clone.querySelectorAll<HTMLElement>(TEXT_EXTRACTION_EXCLUSION_SELECTOR).forEach((node) => node.remove());
    const text = (clone.innerText || clone.textContent || "").replace(/\s+/g, " ").trim();
    const lower = text.toLowerCase();
    return lower.includes("calling tool") || lower.includes("working on it") ? "" : text;
}

function isSafeSnapshotCandidate(turn: HTMLElement): boolean {
    if (turn.contains(document.activeElement)) return false;
    if (containsChatGptComposerScope(turn)) return false;
    if (turn.querySelector(".loading-shimmer, .animate-spin, [data-is-streaming='true'], [aria-busy='true']")) return false;
    if (turn.querySelector(CHATGPT_ERROR_SELECTOR)) return false;
    if (turn.querySelector(CHATGPT_TOOL_SELECTOR)) return false;
    if (containsChatGptAccessibleStatus(turn)) return false;
    if (hasNonCopyInteractiveControl(turn)) return false;
    return true;
}

function hasCopyControl(turn: HTMLElement): boolean {
    return turn.querySelector(COPY_CONTROL_SELECTOR) !== null;
}

function hasNonCopyInteractiveControl(turn: HTMLElement): boolean {
    return Array.from(turn.querySelectorAll<HTMLElement>(INTERACTIVE_CONTROL_SELECTOR))
        .some((control) => !control.matches(COPY_CONTROL_SELECTOR));
}

function isPinnedTurn(turn: HTMLElement): boolean {
    return turn.contains(document.activeElement) ||
        !!turn.querySelector(CHATGPT_STREAMING_SELECTOR);
}
