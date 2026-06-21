export interface NativeDiagnosticsSampleSnapshot<T> {
    readonly value: T | null;
    readonly sampledAt: number | null;
}

export interface NativeDiagnosticsSampleOptions {
    readonly force?: boolean;
    readonly now?: number;
}

export class NativeDiagnosticsSampler<T> {
    private cachedValue: T | null = null;
    private sampledAt: number | null = null;

    constructor(
        private readonly ttlMs: number,
        private readonly sample: () => T,
    ) {}

    read(options: NativeDiagnosticsSampleOptions = {}): T {
        const now = options.now ?? Date.now();
        const expired = this.sampledAt === null || now - this.sampledAt >= this.ttlMs;
        if (!options.force && !expired && this.cachedValue !== null) return this.cachedValue;
        this.cachedValue = this.sample();
        this.sampledAt = now;
        return this.cachedValue;
    }

    clear(): void {
        this.cachedValue = null;
        this.sampledAt = null;
    }

    snapshot(): NativeDiagnosticsSampleSnapshot<T> {
        return { value: this.cachedValue, sampledAt: this.sampledAt };
    }
}
