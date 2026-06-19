import type { NativeTurnRecord } from "../TurnRegistry";

export type ChatGptTurnPriority = "live" | "near" | "far" | "uncertain";

const PRIORITY_WEIGHT: Record<ChatGptTurnPriority, number> = {
    live: 0,
    near: 1,
    uncertain: 2,
    far: 3,
};

export class ChatGptVisibleTurnPriorityController {
    prioritize(records: readonly NativeTurnRecord[]): readonly NativeTurnRecord[] {
        return [...records].sort((left, right) => {
            const leftPriority = classifyTurnPriority(left.element);
            const rightPriority = classifyTurnPriority(right.element);
            return PRIORITY_WEIGHT[leftPriority] - PRIORITY_WEIGHT[rightPriority];
        });
    }
}

export function classifyTurnPriority(element: HTMLElement): ChatGptTurnPriority {
    const intersecting = element.getAttribute("data-is-intersecting");
    if (intersecting === "true") return "live";
    if (intersecting === "false") return "far";

    const rect = element.getBoundingClientRect?.();
    if (!rect) return "uncertain";
    const viewportHeight = element.ownerDocument.defaultView?.innerHeight ?? 0;
    if (viewportHeight <= 0) return "uncertain";
    const nearDistance = viewportHeight * 1.5;
    if (rect.bottom >= -nearDistance && rect.top <= viewportHeight + nearDistance) return "near";
    return "far";
}
