export type NativeDiagnosticLevel = "info" | "warn" | "error";

export interface NativeDiagnosticEvent {
    readonly level: NativeDiagnosticLevel;
    readonly code: string;
    readonly detail: string;
    readonly timestamp: number;
}

export interface NativeDiagnosticSnapshot {
    readonly selectorHealthy: boolean;
    readonly nativeEnabled: boolean;
    readonly events: readonly NativeDiagnosticEvent[];
}

const MAX_EVENTS = 50;
const MAX_DETAIL_LENGTH = 160;

export class NativeDiagnostics {
    private readonly events: NativeDiagnosticEvent[] = [];
    private selectorHealthy = false;
    private nativeEnabled = false;

    setSelectorHealthy(value: boolean): void {
        this.selectorHealthy = value;
    }

    setNativeEnabled(value: boolean): void {
        this.nativeEnabled = value;
    }

    info(code: string, detail: string): void {
        this.record("info", code, detail);
    }

    warn(code: string, detail: string): void {
        this.record("warn", code, detail);
    }

    error(code: string, detail: string): void {
        this.record("error", code, detail);
    }

    snapshot(): NativeDiagnosticSnapshot {
        return {
            selectorHealthy: this.selectorHealthy,
            nativeEnabled: this.nativeEnabled,
            events: [...this.events],
        };
    }

    private record(level: NativeDiagnosticLevel, code: string, detail: string): void {
        this.events.push({
            level,
            code: this.sanitize(code),
            detail: this.sanitize(detail),
            timestamp: Date.now(),
        });
        if (this.events.length > MAX_EVENTS) this.events.shift();
    }

    private sanitize(value: string): string {
        return value
            .replace(/[\r\n\t]+/g, " ")
            .replace(/https?:\/\/\S+/gi, "[url]")
            .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
            .slice(0, MAX_DETAIL_LENGTH);
    }
}
