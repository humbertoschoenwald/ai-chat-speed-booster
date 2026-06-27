import type { NativeTurnRecord } from "../TurnRegistry";

export interface ChatGptActionToolbarHoverGateSnapshot {
    readonly gatedTurnCount: number;
    readonly restoredTurnCount: number;
    readonly protectedTailSize: number;
}

const GATED_ATTR = "data-acsb-native-toolbar-hover-gated";
const STYLE_ID = "acsb-native-toolbar-hover-gate-style";
const RESTORE_EVENT_OPTIONS: AddEventListenerOptions = { capture: true, passive: true };

export class ChatGptActionToolbarHoverGate {
    private root: Document | null = null;
    private restoredTurnCount = 0;
    private readonly restoreTarget = (event: Event): void => {
        const target = event.target instanceof Element
            ? event.target.closest<HTMLElement>(`[${GATED_ATTR}='true']`)
            : null;
        if (!target) return;
        target.removeAttribute(GATED_ATTR);
        this.restoredTurnCount += 1;
    };

    start(root: Document = document): void {
        if (this.root === root) return;
        this.stop();
        this.root = root;
        injectStyle(root);
        root.addEventListener("pointerover", this.restoreTarget, RESTORE_EVENT_OPTIONS);
        root.addEventListener("focusin", this.restoreTarget, RESTORE_EVENT_OPTIONS);
        root.addEventListener("pointerdown", this.restoreTarget, RESTORE_EVENT_OPTIONS);
    }

    stop(root: ParentNode = this.root ?? document): void {
        if (this.root) {
            this.root.removeEventListener("pointerover", this.restoreTarget, true);
            this.root.removeEventListener("focusin", this.restoreTarget, true);
            this.root.removeEventListener("pointerdown", this.restoreTarget, true);
        }
        this.restoreAll(root);
        if (root instanceof Document) root.getElementById(STYLE_ID)?.remove();
        this.root = null;
        this.restoredTurnCount = 0;
    }

    sync(records: readonly NativeTurnRecord[], protectedTailSize: number): ChatGptActionToolbarHoverGateSnapshot {
        let gatedTurnCount = 0;
        const protectFrom = Math.max(0, records.length - protectedTailSize);
        records.forEach((record, index) => {
            if (index >= protectFrom || record.pinReasons.size > 0) {
                record.element.removeAttribute(GATED_ATTR);
                return;
            }
            record.element.setAttribute(GATED_ATTR, "true");
            gatedTurnCount += 1;
        });
        return {
            gatedTurnCount,
            restoredTurnCount: this.restoredTurnCount,
            protectedTailSize,
        };
    }

    restoreAll(root: ParentNode = document): void {
        root.querySelectorAll<HTMLElement>(`[${GATED_ATTR}='true']`).forEach((turn) => {
            turn.removeAttribute(GATED_ATTR);
        });
    }
}

function injectStyle(root: Document): void {
    if (root.getElementById(STYLE_ID)) return;
    const style = root.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
        `[${GATED_ATTR}='true']:not(:hover):not(:focus-within) [class*='group-hover']{transition:none!important;animation:none!important;will-change:auto!important;}`,
        `[${GATED_ATTR}='true']:not(:hover):not(:focus-within) [class*='transition']{transition:none!important;will-change:auto!important;}`,
    ].join("");
    (root.head ?? root.documentElement).appendChild(style);
}
