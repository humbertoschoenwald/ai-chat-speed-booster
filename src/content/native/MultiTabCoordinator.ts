export interface MultiTabCoordinatorSnapshot {
    readonly active: boolean;
    readonly inactiveSince: number | null;
    readonly skippedWorkCount: number;
    readonly resumeCheckCount: number;
}

export class MultiTabCoordinator {
    private inactiveSince: number | null = null;
    private skippedWorkCount = 0;
    private resumeCheckCount = 0;

    markVisibility(visible: boolean, now = Date.now()): void {
        if (visible) {
            if (this.inactiveSince !== null) this.resumeCheckCount += 1;
            this.inactiveSince = null;
            return;
        }
        if (this.inactiveSince === null) this.inactiveSince = now;
    }

    shouldSkipNonessentialWork(): boolean {
        const skip = this.inactiveSince !== null;
        if (skip) this.skippedWorkCount += 1;
        return skip;
    }

    snapshot(): MultiTabCoordinatorSnapshot {
        return {
            active: this.inactiveSince === null,
            inactiveSince: this.inactiveSince,
            skippedWorkCount: this.skippedWorkCount,
            resumeCheckCount: this.resumeCheckCount,
        };
    }
}
