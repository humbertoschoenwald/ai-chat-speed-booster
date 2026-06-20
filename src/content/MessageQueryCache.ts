import type { SiteSelectors } from "../shared/sites";
import { filterMessageTurns } from "../shared/messageTurnFilter";

export interface MessageQueryCacheSnapshot {
    readonly routeKey: string;
    readonly generation: number;
    readonly cachedTurnCount: number;
}

export class MessageQueryCache {
    private routeKey = "";
    private generation = 0;
    private turns: HTMLElement[] | null = null;

    queryTurns(selectors: SiteSelectors, routeKey = location.href): HTMLElement[] {
        if (this.routeKey !== routeKey) this.invalidate(routeKey);
        if (!this.turns) {
            const turns = dedupeNestedMessageTurns(
                filterMessageTurns(
                    Array.from(document.querySelectorAll<HTMLElement>(selectors.messageTurn)),
                    selectors,
                ),
            );
            if (turns.length === 0) return [];
            this.turns = turns;
        }
        return [...this.turns];
    }

    invalidate(routeKey = this.routeKey): void {
        this.routeKey = routeKey;
        this.turns = null;
        this.generation += 1;
    }

    snapshot(): MessageQueryCacheSnapshot {
        return {
            routeKey: this.routeKey,
            generation: this.generation,
            cachedTurnCount: this.turns?.length ?? 0,
        };
    }
}

function dedupeNestedMessageTurns(elements: HTMLElement[]): HTMLElement[] {
    return elements.filter((element) => !elements.some((candidate) => candidate !== element && candidate.contains(element)));
}
