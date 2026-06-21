export interface ChatGptThreadCssMetrics {
    readonly responseHeightPx: number | null;
    readonly contentMaxWidthPx: number | null;
    readonly scrollToBottomBannerOffsetPx: number | null;
    readonly showContextPct: number | null;
}

const THREAD_RESPONSE_HEIGHT_VAR = "--thread-response-height";
const THREAD_CONTENT_MAX_WIDTH_VAR = "--thread-content-max-width";
const THREAD_SCROLL_TO_BOTTOM_BANNER_OFFSET_VAR = "--thread-scroll-to-bottom-banner-offset";
const THREAD_SHOW_CONTEXT_PCT_VAR = "--thread-show-context-pct";

export function readChatGptThreadCssMetrics(
    target: Element,
    win: Pick<Window, "getComputedStyle">,
): ChatGptThreadCssMetrics {
    const style = win.getComputedStyle(target);
    return {
        responseHeightPx: parseCssMetric(style.getPropertyValue(THREAD_RESPONSE_HEIGHT_VAR)),
        contentMaxWidthPx: parseCssMetric(style.getPropertyValue(THREAD_CONTENT_MAX_WIDTH_VAR)),
        scrollToBottomBannerOffsetPx: parseCssMetric(style.getPropertyValue(THREAD_SCROLL_TO_BOTTOM_BANNER_OFFSET_VAR)),
        showContextPct: parseCssMetric(style.getPropertyValue(THREAD_SHOW_CONTEXT_PCT_VAR)),
    };
}

export function parseCssMetric(raw: string): number | null {
    const value = raw.trim();
    if (!value) return null;
    const parsed = parseFloat(value.endsWith("px") || value.endsWith("%") ? value.slice(0, -1 * (value.endsWith("px") ? 2 : 1)) : value);
    return Number.isFinite(parsed) ? parsed : null;
}
