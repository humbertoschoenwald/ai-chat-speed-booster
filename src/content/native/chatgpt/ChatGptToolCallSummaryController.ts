import type { ToolCallGroupRecord } from "../ToolCallGroupController";
import { canApplyStaticToolCallSummary } from "./ChatGptToolCallStateGuard";

const HOST_ATTR = "data-acsb-tool-call-summary-host";
const SUMMARY_ATTR = "data-acsb-tool-call-summary";
const STYLE_ID = "acsb-tool-call-summary-style";
const RESTORE_SPIKE_LIMIT = 50;
const ACTIVE_SELECTOR = [
    ".loading-shimmer",
    ".animate-spin",
    "[aria-busy='true']",
    "[data-is-streaming='true']",
].join(",");

export class ChatGptToolCallSummaryController {
    private root: Document | null = null;
    private restoreCount = 0;
    private restoreDisabled = false;

    start(root: Document = document): void {
        if (this.root) return;
        this.root = root;
        injectStyle(root);
        root.addEventListener("pointerdown", this.restoreTarget, true);
        root.addEventListener("focusin", this.restoreTarget, true);
        root.addEventListener("keydown", this.restoreTarget, true);
    }

    stop(root: ParentNode = this.root ?? document): void {
        const activeRoot = this.root;
        if (activeRoot) {
            activeRoot.removeEventListener("pointerdown", this.restoreTarget, true);
            activeRoot.removeEventListener("focusin", this.restoreTarget, true);
            activeRoot.removeEventListener("keydown", this.restoreTarget, true);
        }
        this.restoreAll(root);
        this.root?.getElementById(STYLE_ID)?.remove();
        this.root = null;
        this.restoreCount = 0;
        this.restoreDisabled = false;
    }

    sync(groups: readonly ToolCallGroupRecord[]): number {
        if (this.restoreDisabled) {
            this.restoreAll(this.root ?? document);
            return 0;
        }
        let summarized = 0;
        const activeHosts = new Set<HTMLElement>();

        for (const group of groups) {
            const host = group.element;
            activeHosts.add(host);
            if (!isStaticSummaryCandidate(group)) {
                restore(host);
                continue;
            }
            if (ensureSummary(host)) summarized++;
        }

        this.root?.querySelectorAll<HTMLElement>(`[${HOST_ATTR}='true']`).forEach((host) => {
            if (!activeHosts.has(host)) restore(host);
        });
        return summarized;
    }

    restoreAll(root: ParentNode = this.root ?? document): void {
        root.querySelectorAll<HTMLElement>(`[${HOST_ATTR}='true']`).forEach(restore);
    }

    private readonly restoreTarget = (event: Event): void => {
        const node = event.target instanceof Element ? event.target.closest<HTMLElement>(`[${HOST_ATTR}='true']`) : null;
        if (!node) return;
        restore(node);
        this.restoreCount += 1;
        if (this.restoreCount > RESTORE_SPIKE_LIMIT) this.restoreDisabled = true;
    };
}

export function isStaticSummaryCandidate(group: ToolCallGroupRecord): boolean {
    const host = group.element;
    if (group.state !== "completed") return false;
    if (host.closest("[data-message-author-role='user']")) return false;
    if (!canApplyStaticToolCallSummary(host)) return false;
    if (host.matches(ACTIVE_SELECTOR) || host.querySelector(ACTIVE_SELECTOR)) return false;
    const text = (host.innerText || host.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    if (!text) return false;
    if (text.includes("calling tool") || text.includes("working on it")) return false;
    return host.getAttribute("data-state") === "closed" || host.querySelector("[data-state='closed']") !== null;
}

function ensureSummary(host: HTMLElement): boolean {
    host.setAttribute(HOST_ATTR, "true");
    if (host.querySelector(`[${SUMMARY_ATTR}='true']`)) return true;

    const summary = host.ownerDocument.createElement("div");
    summary.setAttribute(SUMMARY_ATTR, "true");
    summary.setAttribute("aria-hidden", "true");
    summary.textContent = "Completed tool call";
    host.insertBefore(summary, host.firstChild);
    return true;
}

function restore(host: HTMLElement): void {
    host.removeAttribute(HOST_ATTR);
    host.querySelectorAll<HTMLElement>(`[${SUMMARY_ATTR}='true']`).forEach((node) => node.remove());
}

function injectStyle(root: Document): void {
    if (root.getElementById(STYLE_ID)) return;
    const style = root.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
        `[${HOST_ATTR}='true']{content-visibility:auto!important;contain:content!important;` +
        `contain-intrinsic-size:48px 220px!important}` +
        `[${HOST_ATTR}='true'] svg{transition-duration:0s!important;filter:none!important;` +
        `will-change:auto!important}` +
        `[${SUMMARY_ATTR}='true']{font:12px/1.4 system-ui,sans-serif;opacity:.72;` +
        `padding:2px 0 6px 0;pointer-events:none}`;
    (root.head ?? root.documentElement).appendChild(style);
}
