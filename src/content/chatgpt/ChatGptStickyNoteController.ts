export interface ChatGptStickyNoteControllerOptions {
    readonly documentRoot?: Document;
    readonly locationRef?: Location;
    readonly storage?: Storage;
    readonly clipboard?: Pick<Clipboard, "writeText">;
}

interface StickyNoteRecord {
    readonly url: string;
    readonly text: string;
    readonly updatedAt: number;
}

interface StickyNoteStore {
    readonly version: 1;
    readonly notesByUrl: Record<string, StickyNoteRecord>;
}

const STORE_KEY = "acsb.chatgpt.stickyNotes.v1";
const ROOT_ID = "acsb-chatgpt-sticky-note-root";
const STYLE_ID = "acsb-chatgpt-sticky-note-style";
const URL_POLL_MS = 1_000;
const COMPOSER_SELECTOR = "#prompt-textarea,[data-testid='prompt-textarea'],textarea,[contenteditable='true']";
const SEND_BUTTON_SELECTOR = [
    "button[data-testid='send-button']",
    "button[aria-label*='send' i]",
    "button[aria-label*='enviar' i]",
].join(",");

export class ChatGptStickyNoteController {
    private readonly documentRoot: Document;
    private readonly locationRef: Location;
    private readonly storage: Storage | null;
    private readonly clipboard: Pick<Clipboard, "writeText"> | null;
    private root: HTMLElement | null = null;
    private noteBody: HTMLElement | null = null;
    private textarea: HTMLTextAreaElement | null = null;
    private urlTimer: ReturnType<typeof setInterval> | null = null;
    private currentUrl = "";
    private editing = false;

    constructor(options: ChatGptStickyNoteControllerOptions = {}) {
        this.documentRoot = options.documentRoot ?? document;
        this.locationRef = options.locationRef ?? window.location;
        this.storage = options.storage ?? safeLocalStorage();
        this.clipboard = options.clipboard ?? navigator.clipboard ?? null;
    }

    start(): void {
        if (!isChatGptLocation(this.locationRef)) return;
        this.currentUrl = canonicalStickyNoteUrl(this.locationRef);
        this.ensureStyle();
        this.ensureRoot();
        this.renderNote();
        this.urlTimer ??= setInterval(() => this.syncUrl(), URL_POLL_MS);
    }

    stop(): void {
        if (this.urlTimer) clearInterval(this.urlTimer);
        this.urlTimer = null;
        this.root?.remove();
        this.root = null;
        this.noteBody = null;
        this.textarea = null;
    }

    private syncUrl(): void {
        const nextUrl = canonicalStickyNoteUrl(this.locationRef);
        if (nextUrl === this.currentUrl) return;
        this.currentUrl = nextUrl;
        this.editing = false;
        this.renderNote();
    }

    private ensureRoot(): void {
        const existing = this.documentRoot.getElementById(ROOT_ID);
        if (existing) {
            this.root = existing;
            this.noteBody = existing.querySelector<HTMLElement>("[data-acsb-sticky-note-body='true']");
            this.textarea = existing.querySelector<HTMLTextAreaElement>("textarea");
            return;
        }

        const root = this.documentRoot.createElement("aside");
        root.id = ROOT_ID;
        root.setAttribute("aria-label", "ChatGPT sticky note");
        root.innerHTML = [
            `<button type="button" data-acsb-sticky-note-toggle="true">Sticky note</button>`,
            `<div data-acsb-sticky-note-panel="true">`,
            `<div data-acsb-sticky-note-body="true" title="Click to send or copy. Shift+click to edit."></div>`,
            `<textarea data-acsb-sticky-note-editor="true" aria-label="Sticky note text"></textarea>`,
            `<div data-acsb-sticky-note-actions="true">`,
            `<button type="button" data-acsb-sticky-note-save="true">Save</button>`,
            `<button type="button" data-acsb-sticky-note-clear="true">Delete sticky notes</button>`,
            `</div>`,
            `<div data-acsb-sticky-note-status="true" aria-live="polite"></div>`,
            `</div>`,
        ].join("");

        this.documentRoot.body.append(root);
        this.root = root;
        this.noteBody = root.querySelector<HTMLElement>("[data-acsb-sticky-note-body='true']");
        this.textarea = root.querySelector<HTMLTextAreaElement>("textarea");

        root.querySelector<HTMLElement>("[data-acsb-sticky-note-toggle='true']")?.addEventListener("click", () => {
            root.toggleAttribute("data-acsb-sticky-note-open");
        });
        this.noteBody?.addEventListener("click", (event) => {
            if (event.shiftKey) {
                this.openEditor();
                return;
            }
            void this.useCurrentNote();
        });
        this.textarea?.addEventListener("input", () => this.saveText(this.textarea?.value ?? ""));
        root.querySelector<HTMLElement>("[data-acsb-sticky-note-save='true']")?.addEventListener("click", () => {
            this.saveText(this.textarea?.value ?? "");
            this.editing = false;
            this.renderNote();
        });
        root.querySelector<HTMLElement>("[data-acsb-sticky-note-clear='true']")?.addEventListener("click", () => {
            this.clearAllNotes();
            this.editing = false;
            this.renderNote();
            this.setStatus("Sticky notes cleared.");
        });
    }

    private ensureStyle(): void {
        if (this.documentRoot.getElementById(STYLE_ID)) return;
        const style = this.documentRoot.createElement("style");
        style.id = STYLE_ID;
        style.textContent = `
#${ROOT_ID}{position:fixed;top:1rem;right:1rem;z-index:2147483646;font:13px/1.4 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#111;max-width:20rem;}
#${ROOT_ID} button{font:inherit;border:1px solid rgba(0,0,0,.2);border-radius:.5rem;background:#fff;color:#111;padding:.35rem .55rem;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.12);}
#${ROOT_ID} [data-acsb-sticky-note-panel]{display:none;margin-top:.35rem;border:1px solid rgba(0,0,0,.18);border-radius:.75rem;background:#fff8bf;color:#111;box-shadow:0 8px 24px rgba(0,0,0,.18);padding:.6rem;}
#${ROOT_ID}[data-acsb-sticky-note-open] [data-acsb-sticky-note-panel]{display:block;}
#${ROOT_ID} [data-acsb-sticky-note-body]{min-height:3rem;white-space:pre-wrap;overflow-wrap:anywhere;cursor:pointer;}
#${ROOT_ID} [data-acsb-sticky-note-body][data-empty='true']{opacity:.7;font-style:italic;}
#${ROOT_ID} textarea{display:none;width:18rem;min-height:7rem;resize:vertical;border:1px solid rgba(0,0,0,.22);border-radius:.5rem;background:#fff;color:#111;padding:.45rem;font:inherit;}
#${ROOT_ID}[data-acsb-sticky-note-editing] [data-acsb-sticky-note-body]{display:none;}
#${ROOT_ID}[data-acsb-sticky-note-editing] textarea{display:block;}
#${ROOT_ID} [data-acsb-sticky-note-actions]{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.5rem;}
#${ROOT_ID} [data-acsb-sticky-note-status]{min-height:1.2em;margin-top:.4rem;font-size:.85em;opacity:.72;}
        `.trim();
        this.documentRoot.head.append(style);
    }

    private renderNote(): void {
        const record = this.readCurrentRecord();
        const text = record?.text ?? "";
        if (this.root) {
            this.root.setAttribute("data-acsb-sticky-note-url", this.currentUrl);
            this.root.toggleAttribute("data-acsb-sticky-note-editing", this.editing);
        }
        if (this.noteBody) {
            this.noteBody.textContent = text || "Shift+click to write a sticky note for this ChatGPT URL.";
            this.noteBody.setAttribute("data-empty", text ? "false" : "true");
        }
        if (this.textarea && this.textarea.value !== text) this.textarea.value = text;
    }

    private openEditor(): void {
        this.editing = true;
        this.root?.setAttribute("data-acsb-sticky-note-open", "true");
        this.renderNote();
        this.textarea?.focus();
    }

    private async useCurrentNote(): Promise<void> {
        const text = this.readCurrentRecord()?.text.trim() ?? "";
        if (!text) {
            this.openEditor();
            return;
        }
        const sent = await this.trySendToChatGpt(text);
        if (sent) {
            this.setStatus("Sent to ChatGPT.");
            return;
        }
        await this.copyText(text);
        this.setStatus("Copied to clipboard.");
    }

    private async trySendToChatGpt(text: string): Promise<boolean> {
        const composer = this.documentRoot.querySelector<HTMLElement>(COMPOSER_SELECTOR);
        if (!composer) return false;
        setComposerText(composer, text);
        await waitFrame();
        const button = this.documentRoot.querySelector<HTMLButtonElement>(SEND_BUTTON_SELECTOR);
        if (!button || button.disabled || button.getAttribute("aria-disabled") === "true") return false;
        button.click();
        return true;
    }

    private async copyText(text: string): Promise<void> {
        try {
            await this.clipboard?.writeText(text);
            return;
        } catch {
            // Fall back below.
        }
        const textarea = this.documentRoot.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        this.documentRoot.body.append(textarea);
        textarea.select();
        this.documentRoot.execCommand?.("copy");
        textarea.remove();
    }

    private saveText(text: string): void {
        const store = this.readStore();
        store.notesByUrl[this.currentUrl] = {
            url: this.currentUrl,
            text,
            updatedAt: Date.now(),
        };
        this.writeStore(store);
    }

    private clearAllNotes(): void {
        this.writeStore({ version: 1, notesByUrl: {} });
    }

    private readCurrentRecord(): StickyNoteRecord | null {
        return this.readStore().notesByUrl[this.currentUrl] ?? null;
    }

    private readStore(): StickyNoteStore {
        if (!this.storage) return { version: 1, notesByUrl: {} };
        try {
            const parsed = JSON.parse(this.storage.getItem(STORE_KEY) ?? "null") as Partial<StickyNoteStore> | null;
            return parsed?.version === 1 && parsed.notesByUrl && typeof parsed.notesByUrl === "object"
                ? { version: 1, notesByUrl: parsed.notesByUrl as Record<string, StickyNoteRecord> }
                : { version: 1, notesByUrl: {} };
        } catch {
            return { version: 1, notesByUrl: {} };
        }
    }

    private writeStore(store: StickyNoteStore): void {
        try {
            this.storage?.setItem(STORE_KEY, JSON.stringify(store));
        } catch {
            // Storage can be unavailable or full; the visible editor still works for the current page.
        }
    }

    private setStatus(text: string): void {
        const status = this.root?.querySelector<HTMLElement>("[data-acsb-sticky-note-status='true']");
        if (status) status.textContent = text;
    }
}

export function canonicalStickyNoteUrl(locationRef: Pick<Location, "origin" | "pathname" | "search">): string {
    return `${locationRef.origin}${locationRef.pathname}${locationRef.search}`;
}

export function isChatGptLocation(locationRef: Pick<Location, "hostname">): boolean {
    return /(^|\.)chatgpt\.com$/i.test(locationRef.hostname);
}

function setComposerText(composer: HTMLElement, text: string): void {
    composer.focus();
    if (composer instanceof HTMLTextAreaElement || composer instanceof HTMLInputElement) {
        composer.value = text;
    } else {
        composer.textContent = text;
    }
    composer.dispatchEvent(new InputEvent("beforeinput", { bubbles: true, inputType: "insertText", data: text }));
    composer.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
    composer.dispatchEvent(new Event("change", { bubbles: true }));
}

function waitFrame(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function safeLocalStorage(): Storage | null {
    try {
        return window.localStorage;
    } catch {
        return null;
    }
}
