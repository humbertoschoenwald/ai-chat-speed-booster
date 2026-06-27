export interface ChatGptRtlIconMetadataSnapshot {
    readonly rtlFlipIconCount: number;
    readonly direction: string | null;
}

const RTL_FLIP_ICON_SELECTOR = "[data-rtl-flip]";

export function readChatGptRtlIconMetadata(root: ParentNode): ChatGptRtlIconMetadataSnapshot {
    const rtlFlipIconCount = root.querySelectorAll?.(RTL_FLIP_ICON_SELECTOR).length ?? 0;
    const isElement = typeof HTMLElement !== "undefined" && root instanceof HTMLElement;
    const direction = isElement
        ? root.closest<HTMLElement>("[dir]")?.getAttribute("dir") ?? root.getAttribute("dir")
        : readLooseDirection(root);
    return { rtlFlipIconCount, direction };
}

export function annotateGeneratedSummaryWithRtlMetadata(summary: HTMLElement, source: ParentNode): void {
    const metadata = readChatGptRtlIconMetadata(source);
    if (metadata.rtlFlipIconCount <= 0) return;
    summary.setAttribute("data-acsb-rtl-icon-metadata-preserved", "true");
    summary.setAttribute("data-acsb-rtl-flip-icon-count", String(metadata.rtlFlipIconCount));
    if (metadata.direction) summary.setAttribute("dir", metadata.direction);
}

export function getChatGptRtlFlipIconSelectorForTests(): string {
    return RTL_FLIP_ICON_SELECTOR;
}

function readLooseDirection(root: ParentNode): string | null {
    const candidate = root as ParentNode & {
        readonly getAttribute?: (name: string) => string | null;
        readonly closest?: (selector: string) => { readonly getAttribute?: (name: string) => string | null } | null;
    };
    return candidate.closest?.("[dir]")?.getAttribute?.("dir") ?? candidate.getAttribute?.("dir") ?? null;
}
