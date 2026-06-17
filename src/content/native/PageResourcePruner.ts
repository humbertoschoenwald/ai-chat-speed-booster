export interface PageResourcePrunerSnapshot {
    readonly candidateCount: number;
    readonly prunedCount: number;
    readonly blockedByInput: boolean;
}

const RESOURCE_CANDIDATE_SELECTOR = [
    'link[rel="modulepreload"]',
    'link[rel="preload"]',
].join(",");

export class PageResourcePruner {
    private prunedCount = 0;
    private blockedByInput = false;

    collectCandidates(root: ParentNode = document): readonly HTMLLinkElement[] {
        return [...root.querySelectorAll<HTMLLinkElement>(RESOURCE_CANDIDATE_SELECTOR)]
            .filter((element) => element.dataset.acsbPruned !== "true");
    }

    markConsumed(candidates: readonly HTMLLinkElement[], deferBecauseInputActive: boolean): PageResourcePrunerSnapshot {
        if (deferBecauseInputActive) {
            this.blockedByInput = true;
            return this.snapshot(candidates.length);
        }

        for (const element of candidates) {
            element.dataset.acsbPruned = "true";
            this.prunedCount += 1;
        }
        this.blockedByInput = false;
        return this.snapshot(candidates.length);
    }

    snapshot(candidateCount = 0): PageResourcePrunerSnapshot {
        return {
            candidateCount,
            prunedCount: this.prunedCount,
            blockedByInput: this.blockedByInput,
        };
    }
}
