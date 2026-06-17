export interface RuntimeBudgetSnapshot {
    readonly budgetMs: number;
    readonly observedMs: number;
    readonly overBudget: boolean;
    readonly overBudgetCount: number;
}

export class RuntimeBudget {
    private overBudgetCount = 0;
    private observedMs = 0;

    constructor(private readonly budgetMs = 8) {}

    record(observedMs: number): RuntimeBudgetSnapshot {
        this.observedMs = observedMs;
        if (observedMs > this.budgetMs) this.overBudgetCount += 1;
        return this.snapshot();
    }

    snapshot(): RuntimeBudgetSnapshot {
        return {
            budgetMs: this.budgetMs,
            observedMs: this.observedMs,
            overBudget: this.observedMs > this.budgetMs,
            overBudgetCount: this.overBudgetCount,
        };
    }
}
