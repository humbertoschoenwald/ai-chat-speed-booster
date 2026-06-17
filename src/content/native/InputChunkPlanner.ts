export interface InputChunkPlan {
    readonly chunked: boolean;
    readonly chunkCount: number;
    readonly totalLength: number;
    readonly chunkSize: number;
}

const DEFAULT_THRESHOLD = 20000;
const DEFAULT_CHUNK_SIZE = 4000;

export class InputChunkPlanner {
    constructor(
        private readonly threshold = DEFAULT_THRESHOLD,
        private readonly chunkSize = DEFAULT_CHUNK_SIZE,
    ) {}

    plan(totalLength: number, composing: boolean): InputChunkPlan {
        const chunked = !composing && totalLength > this.threshold;
        return {
            chunked,
            chunkCount: chunked ? Math.ceil(totalLength / this.chunkSize) : 1,
            totalLength,
            chunkSize: this.chunkSize,
        };
    }
}
