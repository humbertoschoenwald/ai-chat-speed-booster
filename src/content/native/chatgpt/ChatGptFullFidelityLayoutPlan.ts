export interface ChatGptTurnLayoutInput {
    readonly key: string;
    readonly heightPx: number;
    readonly pinned?: boolean;
}

export interface ChatGptTurnLayoutRecord {
    readonly key: string;
    readonly topPx: number;
    readonly heightPx: number;
    readonly bottomPx: number;
    readonly pinned: boolean;
}

export interface ChatGptFullFidelityLayoutPlan {
    readonly totalHeightPx: number;
    readonly records: readonly ChatGptTurnLayoutRecord[];
    readonly visibleKeys: readonly string[];
    readonly cacheableKeys: readonly string[];
}

export interface ChatGptViewportWindow {
    readonly scrollTopPx: number;
    readonly viewportHeightPx: number;
    readonly overscanPx: number;
}

export function createChatGptFullFidelityLayoutPlan(
    turns: readonly ChatGptTurnLayoutInput[],
    viewport: ChatGptViewportWindow,
): ChatGptFullFidelityLayoutPlan {
    let cursor = 0;
    const records = turns.map((turn) => {
        const heightPx = Math.max(1, Math.round(turn.heightPx));
        const topPx = cursor;
        const bottomPx = topPx + heightPx;
        cursor = bottomPx;
        return {
            key: turn.key,
            topPx,
            heightPx,
            bottomPx,
            pinned: turn.pinned === true,
        };
    });

    const windowTop = Math.max(0, viewport.scrollTopPx - viewport.overscanPx);
    const windowBottom = viewport.scrollTopPx + viewport.viewportHeightPx + viewport.overscanPx;
    const visibleKeys = records
        .filter((record) => record.pinned || rangesIntersect(record.topPx, record.bottomPx, windowTop, windowBottom))
        .map((record) => record.key);
    const visibleKeySet = new Set(visibleKeys);
    const cacheableKeys = records
        .filter((record) => !record.pinned && !visibleKeySet.has(record.key))
        .map((record) => record.key);

    return {
        totalHeightPx: cursor,
        records,
        visibleKeys,
        cacheableKeys,
    };
}

export function findChatGptTurnAtOffset(
    plan: ChatGptFullFidelityLayoutPlan,
    offsetPx: number,
): ChatGptTurnLayoutRecord | null {
    const offset = Math.max(0, offsetPx);
    return plan.records.find((record) => offset >= record.topPx && offset < record.bottomPx) ?? null;
}

function rangesIntersect(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
    return aStart < bEnd && bStart < aEnd;
}
