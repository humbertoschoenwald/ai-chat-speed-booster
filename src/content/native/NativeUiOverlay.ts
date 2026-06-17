export type NativeOverlayCommand = "restore-all" | "open-panel" | "close-panel";

export interface NativeOverlayCommandEvent {
    readonly command: NativeOverlayCommand;
    readonly timestamp: number;
}

export interface NativeOverlaySnapshot {
    readonly visible: boolean;
    readonly commandCount: number;
    readonly lastCommand: NativeOverlayCommandEvent | null;
}

export class NativeUiOverlay {
    private visible = false;
    private readonly commands: NativeOverlayCommandEvent[] = [];

    show(): NativeOverlaySnapshot {
        this.visible = true;
        return this.snapshot();
    }

    hide(): NativeOverlaySnapshot {
        this.visible = false;
        return this.snapshot();
    }

    recordCommand(command: NativeOverlayCommand, timestamp = Date.now()): NativeOverlaySnapshot {
        this.commands.push({ command, timestamp });
        if (this.commands.length > 20) this.commands.shift();
        return this.snapshot();
    }

    snapshot(): NativeOverlaySnapshot {
        return {
            visible: this.visible,
            commandCount: this.commands.length,
            lastCommand: this.commands.at(-1) ?? null,
        };
    }
}
