export interface ScrollGeometrySample {
    readonly scrollTop: number;
    readonly scrollHeight: number;
    readonly clientHeight: number;
    readonly timestamp: number;
}

export interface ScrollGeometryDelta {
    readonly before: ScrollGeometrySample;
    readonly after: ScrollGeometrySample;
    readonly scrollTopDelta: number;
    readonly scrollHeightDelta: number;
    readonly compensationRequired: boolean;
    readonly oscillating: boolean;
}

export interface ScrollGeometrySnapshot {
    readonly sampleCount: number;
    readonly oscillationCount: number;
    readonly lastDelta: ScrollGeometryDelta | null;
}

const MAX_SAMPLES = 8;
const OSCILLATION_DELTA_PX = 24;

export class ScrollGeometry {
    private readonly samples: ScrollGeometrySample[] = [];
    private lastDelta: ScrollGeometryDelta | null = null;
    private oscillationCount = 0;

    sample(scroller: Element | Window = window, timestamp = Date.now()): ScrollGeometrySample {
        const sample = this.read(scroller, timestamp);
        this.samples.push(sample);
        if (this.samples.length > MAX_SAMPLES) this.samples.shift();
        return sample;
    }

    compare(before: ScrollGeometrySample, after: ScrollGeometrySample): ScrollGeometryDelta {
        const scrollTopDelta = after.scrollTop - before.scrollTop;
        const scrollHeightDelta = after.scrollHeight - before.scrollHeight;
        const oscillating = this.detectOscillation(scrollHeightDelta);
        if (oscillating) this.oscillationCount += 1;

        this.lastDelta = {
            before,
            after,
            scrollTopDelta,
            scrollHeightDelta,
            compensationRequired: Math.abs(scrollTopDelta) > 0 || Math.abs(scrollHeightDelta) > 0,
            oscillating,
        };
        return this.lastDelta;
    }

    snapshot(): ScrollGeometrySnapshot {
        return {
            sampleCount: this.samples.length,
            oscillationCount: this.oscillationCount,
            lastDelta: this.lastDelta,
        };
    }

    private read(scroller: Element | Window, timestamp: number): ScrollGeometrySample {
        if (scroller instanceof Window) {
            const documentElement = document.documentElement;
            return {
                scrollTop: scroller.scrollY,
                scrollHeight: documentElement.scrollHeight,
                clientHeight: scroller.innerHeight,
                timestamp,
            };
        }

        return {
            scrollTop: scroller.scrollTop,
            scrollHeight: scroller.scrollHeight,
            clientHeight: scroller.clientHeight,
            timestamp,
        };
    }

    private detectOscillation(scrollHeightDelta: number): boolean {
        if (Math.abs(scrollHeightDelta) < OSCILLATION_DELTA_PX) return false;
        const previous = this.lastDelta?.scrollHeightDelta ?? 0;
        if (Math.abs(previous) < OSCILLATION_DELTA_PX) return false;
        return Math.sign(previous) !== Math.sign(scrollHeightDelta);
    }
}
