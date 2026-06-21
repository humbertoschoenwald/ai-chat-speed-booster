interface ToolCallLabelCacheEntry {
    readonly state: string | null;
    readonly label: string;
}

const labelCache = new WeakMap<HTMLElement, ToolCallLabelCacheEntry>();

const LABEL_SELECTOR = [
    "[aria-label='Open tool call list']",
    "[aria-label*='tool call' i]",
    "button",
    "[role='button']",
].join(",");

export function readCachedCollapsedToolCallLabel(host: HTMLElement): string {
    const state = readToolCallStateKey(host);
    if (state !== "closed") return readVisibleToolCallLabel(host);

    const cached = labelCache.get(host);
    if (cached?.state === state) return cached.label;

    const label = readVisibleToolCallLabel(host);
    labelCache.set(host, { state, label });
    return label;
}

export function clearToolCallLabelCache(host: HTMLElement): void {
    labelCache.delete(host);
}

function readToolCallStateKey(host: HTMLElement): string | null {
    return host.getAttribute("data-state")
        ?? host.querySelector<HTMLElement>("[data-state]")?.getAttribute("data-state")
        ?? host.getAttribute("aria-expanded");
}

function readVisibleToolCallLabel(host: HTMLElement): string {
    const labelHost = host.querySelector<HTMLElement>(LABEL_SELECTOR) ?? host;
    const text = labelHost.getAttribute("aria-label")
        ?? labelHost.innerText
        ?? labelHost.textContent
        ?? "";
    return text.replace(/\s+/g, " ").trim();
}
