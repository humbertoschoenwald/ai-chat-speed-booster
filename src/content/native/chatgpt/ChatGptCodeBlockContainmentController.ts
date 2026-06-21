import type { NativeTurnRecord } from "../TurnRegistry";

export interface ChatGptCodeBlockContainmentSnapshot {
    readonly codeBlockCount: number;
    readonly containedCodeBlockCount: number;
    readonly skippedEditableCount: number;
}

const CONTAINED_ATTR = "data-acsb-native-contained-code-block";
const STYLE_ID = "acsb-native-code-block-containment-style";
const CODE_BLOCK_SELECTOR = [
    "pre",
    "pre code",
    ".cm-editor",
    ".cm-content",
].join(",");
const EDITABLE_SELECTOR = [
    "textarea",
    "input",
    "[contenteditable='true']",
    ".ProseMirror",
    "form",
].join(",");
const ACTIVE_SELECTOR = [
    "[aria-busy='true']",
    "[data-is-streaming='true']",
    ".loading-shimmer",
    ".animate-spin",
].join(",");

export class ChatGptCodeBlockContainmentController {
    start(root: Document = document): void {
        injectStyle(root);
    }

    stop(root: ParentNode = document): void {
        this.restoreAll(root);
        if (root instanceof Document) root.getElementById(STYLE_ID)?.remove();
    }

    sync(records: readonly NativeTurnRecord[], protectedTailSize: number): ChatGptCodeBlockContainmentSnapshot {
        let codeBlockCount = 0;
        let containedCodeBlockCount = 0;
        let skippedEditableCount = 0;
        const protectFrom = Math.max(0, records.length - protectedTailSize);

        records.forEach((record, index) => {
            const protect = index >= protectFrom || record.pinReasons.size > 0;
            for (const block of readCodeBlocks(record.element)) {
                codeBlockCount += 1;
                if (isEditableOrActive(block)) {
                    skippedEditableCount += 1;
                    block.removeAttribute(CONTAINED_ATTR);
                    continue;
                }
                if (protect) {
                    block.removeAttribute(CONTAINED_ATTR);
                    continue;
                }
                block.setAttribute(CONTAINED_ATTR, "true");
                containedCodeBlockCount += 1;
            }
        });

        return { codeBlockCount, containedCodeBlockCount, skippedEditableCount };
    }

    restoreAll(root: ParentNode = document): void {
        root.querySelectorAll<HTMLElement>(`[${CONTAINED_ATTR}='true']`).forEach((block) => {
            block.removeAttribute(CONTAINED_ATTR);
        });
    }
}

function readCodeBlocks(turn: HTMLElement): HTMLElement[] {
    return Array.from(turn.querySelectorAll<HTMLElement>(CODE_BLOCK_SELECTOR));
}

function isEditableOrActive(block: HTMLElement): boolean {
    return block.matches(EDITABLE_SELECTOR)
        || block.closest(EDITABLE_SELECTOR) !== null
        || block.matches(ACTIVE_SELECTOR)
        || block.querySelector(ACTIVE_SELECTOR) !== null;
}

function injectStyle(root: Document): void {
    if (root.getElementById(STYLE_ID)) return;
    const style = root.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `[${CONTAINED_ATTR}='true']{content-visibility:auto!important;contain:content!important;contain-intrinsic-size:auto 240px!important;}`;
    (root.head ?? root.documentElement).appendChild(style);
}
