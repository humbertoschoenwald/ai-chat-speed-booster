// SCHOENWALD-LARGE-FILE owner=ai-chat-speed-booster reason="Native editor latency guard keeps event capture, paste planning, and defer diagnostics together" split="Move DOM event policy into a separate model if this grows further" validation="pnpm validate" review="No clipboard text is stored; only event type, timestamps, counters, and paste length are retained"
import { InputChunkPlanner } from "./InputChunkPlanner";

export interface EditorInputSnapshot {
    readonly active: boolean;
    readonly composing: boolean;
    readonly deferredTaskCount: number;
    readonly eventCount: number;
    readonly lastEventType: string | null;
    readonly lastEventAt: number | null;
    readonly protectedUntilMs: number | null;
    readonly lastPasteLength: number | null;
    readonly lastPasteChunkCount: number | null;
}

export interface EditorInputOptimizerOptions {
    readonly quietWindowMs?: number;
    readonly root?: Document;
}

const DEFAULT_QUIET_WINDOW_MS = 120;
const INPUT_EVENTS = [
    "beforeinput",
    "input",
    "keydown",
    "keyup",
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

const EVENT_PROTECTION_MS: Record<string, number> = {
    beforeinput: 180,
    input: 180,
    keydown: 120,
    keyup: 120,
    paste: 500,
    copy: 350,
    cut: 350,
    selectionchange: 250,
    focusin: 120,
    focusout: 120,
    compositionstart: 2_000,
    compositionupdate: 2_000,
    compositionend: 250,
};

export class EditorInputOptimizer {
    private readonly root: Document | undefined;
    private readonly quietWindowMs: number;
    private readonly pastePlanner = new InputChunkPlanner();
    private readonly cleanupCallbacks: Array<() => void> = [];
    private composing = false;
    private lastEventType: string | null = null;
    private lastEventAt: number | null = null;
    private lastPasteLength: number | null = null;
    private lastPasteChunkCount: number | null = null;
    private protectedUntilMs = 0;
    private deferredTaskCount = 0;
    private eventCount = 0;
    private listening = false;

    constructor(options: EditorInputOptimizerOptions = {}) {
        this.root = options.root ?? (typeof document === "undefined" ? undefined : document);
        this.quietWindowMs = options.quietWindowMs ?? DEFAULT_QUIET_WINDOW_MS;
    }

    start(): void {
        const root = this.root;
        if (!root) return;
        if (this.listening) return;
        this.listening = true;
        for (const type of INPUT_EVENTS) {
            const listener = (event: Event): void => this.markDomEvent(event);
            root.addEventListener(type, listener, true);
            this.cleanupCallbacks.push(() => root.removeEventListener(type, listener, true));
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
        this.lastPasteLength = null;
        this.lastPasteChunkCount = null;
        this.protectedUntilMs = 0;
        this.eventCount = 0;
    }

    markEvent(type: string, now = Date.now()): void {
        this.eventCount += 1;
        this.lastEventType = type;
        this.lastEventAt = now;
        if (type === "compositionstart") this.composing = true;
        if (type === "compositionend") this.composing = false;
        const duration = EVENT_PROTECTION_MS[type] ?? this.quietWindowMs;
        this.protectedUntilMs = Math.max(this.protectedUntilMs, now + duration);
    }

    markProtectedActivity(type: string, durationMs: number, now = Date.now()): void {
        this.eventCount += 1;
        this.lastEventType = type;
        this.lastEventAt = now;
        this.protectedUntilMs = Math.max(this.protectedUntilMs, now + Math.max(0, durationMs));
    }

    recordPasteLength(totalLength: number): void {
        const plan = this.pastePlanner.plan(totalLength, this.composing);
        this.lastPasteLength = totalLength;
        this.lastPasteChunkCount = plan.chunkCount;
        if (plan.chunked) {
            this.markProtectedActivity("large-paste", Math.min(2_000, plan.chunkCount * 50));
        } else {
            this.markEvent("paste");
        }
    }

    shouldDeferBackgroundWork(now = Date.now()): boolean {
        if (this.composing) return true;
        if (now < this.protectedUntilMs) return true;
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
            eventCount: this.eventCount,
            lastEventType: this.lastEventType,
            lastEventAt: this.lastEventAt,
            protectedUntilMs: this.protectedUntilMs > 0 ? this.protectedUntilMs : null,
            lastPasteLength: this.lastPasteLength,
            lastPasteChunkCount: this.lastPasteChunkCount,
        };
    }

    private markDomEvent(event: Event): void {
        if (!this.isEditorEvent(event)) return;
        if (event.type === "paste" && typeof ClipboardEvent !== "undefined" && event instanceof ClipboardEvent) {
            const length = event.clipboardData?.getData("text")?.length ?? 0;
            this.recordPasteLength(length);
            return;
        }
        this.markEvent(event.type);
    }

    private isEditorEvent(event: Event): boolean {
        if (event.type === "selectionchange") return this.hasEditorSelection();
        const target = event.target;
        return target instanceof Element && this.isEditableElement(target);
    }

    private hasEditorSelection(): boolean {
        if (!this.root) return false;
        const selection = this.root.getSelection();
        const node = selection?.anchorNode;
        const element = node instanceof Element ? node : node?.parentElement;
        return element ? this.isEditableElement(element) : false;
    }

    private isEditableElement(element: Element): boolean {
        return element.closest("textarea,input,[contenteditable='true'],[contenteditable='plaintext-only']") !== null;
    }
}
