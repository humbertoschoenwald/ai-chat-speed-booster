export interface TelemetryContaminationMarkerSnapshot {
    readonly enabled: boolean;
    readonly marked: boolean;
    readonly markerVersion: number;
}

const MARKER_VERSION = 1;
const MARKER_ATTRIBUTE = "data-acsb-native-modified";
const MARKER_EVENT = "acsb:native-modified";

export class TelemetryContaminationMarker {
    private marked = false;

    mark(enabled: boolean, root: HTMLElement = document.documentElement): TelemetryContaminationMarkerSnapshot {
        if (!enabled) return this.clear(root);

        root.setAttribute(MARKER_ATTRIBUTE, String(MARKER_VERSION));
        window.dispatchEvent(new CustomEvent(MARKER_EVENT, {
            detail: { markerVersion: MARKER_VERSION },
        }));
        this.marked = true;
        return this.snapshot(true);
    }

    clear(root: HTMLElement = document.documentElement): TelemetryContaminationMarkerSnapshot {
        root.removeAttribute(MARKER_ATTRIBUTE);
        this.marked = false;
        return this.snapshot(false);
    }

    snapshot(enabled = this.marked): TelemetryContaminationMarkerSnapshot {
        return {
            enabled,
            marked: this.marked,
            markerVersion: MARKER_VERSION,
        };
    }
}
