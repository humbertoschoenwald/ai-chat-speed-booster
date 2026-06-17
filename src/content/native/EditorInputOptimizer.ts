export interface EditorInputSnapshot {
    readonly active: boolean;
    readonly composing: boolean;
    readonly deferredTaskCount: number;
    readonly lastEventType: string | null;
    readonly lastEventAt: number | null;
}

export interface EditorInputOptimizerOptions {
    readonly quietWindowMs?: number;
    readonly root?: Document;
}

const DEFAULT_QUIET_WINDOW_MS = 120;
const INPUT_EVENTS = [
    "beforeinput",
    "input",
    "paste",
    "copy",
    "cut",
    "compositionstart",
    "compositionupdate",
    "compositionend",
    "selectionchange",
    "focusin",
    "focusout",
] as const;

export class EditorInputOptimizer {
    private readonly root: Document;
    private readonly quietWindowMs: number;
    private readonly cleanupCallbacks: Array<() => void> = [];
    private composing = false;
    private lastEventType: string | null = null;
    private lastEventAt: number | null = null;
    private deferredTaskCount = 0;
    private listening = false;

    constructor(options: EditorInputOptimizerOptions = {}) {
        this.root = options.root ?? document;
        this.quietWindowMs = options.quietWindowMs ?? DEFAULT_QUIET_WINDOW_MS;
    }

    start(): void {
        if (this.listening) return;
        this.listening = true;
        for (const type of INPUT_EVENTS) {
            const listener = (event: Event): void => this.markDomEvent(event);
            this.root.addEventListener(type, listener, true);
            this.cleanupCallbacks.push(() => this.root.removeEventListener(type, listener, true));
        }
    }

    stop(): void {
        while (this.cleanupCallbacks.length > 0) {
            this.cleanupCallbacks.pop()?.();
        }
        this.listening = false;
        this.composing = false;
        this.lastEventType = null;
        this.lastEventAt = null;
    }

    markEvent(type: string): void {
        this.lastEventType = type;
        this.lastEventAt = Date.now();
        if (type === "compositionstart") this.composing = true;
        if (type === "compositionend") this.composing = false;
    }

    shouldDeferBackgroundWork(now = Date.now()): boolean {
        if (this.composing) return true;
        if (this.lastEventAt === null) return false;
        return now - this.lastEventAt < this.quietWindowMs;
    }

    deferTask(): void {
        this.deferredTaskCount += 1;
    }

    snapshot(): EditorInputSnapshot {
        return {
            active: this.shouldDeferBackgroundWork(),
            composing: this.composing,
            deferredTaskCount: this.deferredTaskCount,
            lastEventType: this.lastEventType,
            lastEventAt: this.lastEventAt,
        };
    }

    private markDomEvent(event: Event): void {
        if (!this.isEditorEvent(event)) return;
        this.markEvent(event.type);
    }

    private isEditorEvent(event: Event): boolean {
        if (event.type === "selectionchange") return this.hasEditorSelection();
        const target = event.target;
        return target instanceof Element && this.isEditableElement(target);
    }

    private hasEditorSelection(): boolean {
        const selection = this.root.getSelection();
        const node = selection?.anchorNode;
        const element = node instanceof Element ? node : node?.parentElement;
        return element ? this.isEditableElement(element) : false;
    }

    private isEditableElement(element: Element): boolean {
        return element.closest("textarea,input,[contenteditable='true'],[contenteditable='plaintext-only']") !== null;
    }
}
