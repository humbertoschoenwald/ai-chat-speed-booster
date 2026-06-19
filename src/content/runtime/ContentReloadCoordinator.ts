/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: coordinate page reload commands triggered by explicit content-runtime decisions.
 * Boundary: timers and reload callbacks only; provider detection and settings ownership stay outside.
 * ADR: docs/adr/architecture/lifecycle/lifecycle-recovery.md.
 */
export interface DeliveryTimeoutProbe {
    readonly detected: boolean;
    readonly reason: string | null;
}

export interface ContentReloadCoordinatorOptions {
    readonly reload: () => void;
    readonly modeSwitchDelayMs?: number;
    readonly deliveryTimeoutGraceMs?: number;
}

const DEFAULT_MODE_SWITCH_DELAY_MS = 150;
const DEFAULT_DELIVERY_TIMEOUT_GRACE_MS = 3_000;

export class ContentReloadCoordinator {
    private readonly reload: () => void;
    private readonly modeSwitchDelayMs: number;
    private readonly deliveryTimeoutGraceMs: number;
    private modeSwitchReloadTimer: ReturnType<typeof setTimeout> | null = null;
    private deliveryTimeoutRefreshTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(options: ContentReloadCoordinatorOptions) {
        this.reload = options.reload;
        this.modeSwitchDelayMs = options.modeSwitchDelayMs ?? DEFAULT_MODE_SWITCH_DELAY_MS;
        this.deliveryTimeoutGraceMs =
            options.deliveryTimeoutGraceMs ?? DEFAULT_DELIVERY_TIMEOUT_GRACE_MS;
    }

    scheduleModeSwitchReload(): void {
        if (this.modeSwitchReloadTimer) clearTimeout(this.modeSwitchReloadTimer);
        this.modeSwitchReloadTimer = setTimeout(() => {
            this.modeSwitchReloadTimer = null;
            this.reload();
        }, this.modeSwitchDelayMs);
    }

    scheduleDeliveryTimeoutRefresh(
        enabled: boolean,
        reason: string | null,
        probe: () => DeliveryTimeoutProbe,
    ): void {
        if (!enabled || this.deliveryTimeoutRefreshTimer) return;
        this.deliveryTimeoutRefreshTimer = setTimeout(() => {
            this.deliveryTimeoutRefreshTimer = null;
            if (!enabled) return;
            const snapshot = probe();
            if (!snapshot.detected || snapshot.reason !== reason) return;
            this.reload();
        }, this.deliveryTimeoutGraceMs);
    }

    cancelDeliveryTimeoutRefresh(): void {
        if (!this.deliveryTimeoutRefreshTimer) return;
        clearTimeout(this.deliveryTimeoutRefreshTimer);
        this.deliveryTimeoutRefreshTimer = null;
    }

    dispose(): void {
        if (this.modeSwitchReloadTimer) {
            clearTimeout(this.modeSwitchReloadTimer);
            this.modeSwitchReloadTimer = null;
        }
        this.cancelDeliveryTimeoutRefresh();
    }
}
