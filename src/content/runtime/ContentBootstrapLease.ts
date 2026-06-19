/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: own content-script bootstrap attributes and heartbeat leasing.
 * Boundary: leasing only; no site detection, message state, popup status, or UI rendering.
 * ADR: docs/adr/architecture/lifecycle/content-bootstrap-ownership.md.
 */
import {
    decideContentBootstrapOwnership,
    type ContentBootstrapDecision,
} from "../ContentBootstrapOwnership";

const CONTENT_BOOTSTRAP_ATTR = "data-acsb-content-bootstrapped";
const CONTENT_INSTANCE_ATTR = "data-acsb-content-instance";
const CONTENT_HEARTBEAT_ATTR = "data-acsb-content-heartbeat-at";
const CONTENT_HEARTBEAT_MS = 1_000;
const STALE_CONTENT_HEARTBEAT_MS = 5_000;

export interface ContentBootstrapLeaseOptions {
    readonly document: Document;
    readonly now?: () => number;
    readonly instanceId?: string;
}

export class ContentBootstrapLease {
    private readonly document: Document;
    private readonly now: () => number;
    private readonly instanceId: string;
    private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    private owns = false;

    constructor(options: ContentBootstrapLeaseOptions) {
        this.document = options.document;
        this.now = options.now ?? (() => Date.now());
        this.instanceId = options.instanceId ?? `${this.now()}-${Math.random().toString(36).slice(2)}`;
    }

    acquire(): ContentBootstrapDecision {
        const root = this.document.documentElement;
        const heartbeatAt = Number(root.getAttribute(CONTENT_HEARTBEAT_ATTR));
        const ownership = decideContentBootstrapOwnership({
            bootstrapped: root.getAttribute(CONTENT_BOOTSTRAP_ATTR) === "true",
            heartbeatAt: Number.isFinite(heartbeatAt) && heartbeatAt > 0 ? heartbeatAt : null,
        }, this.now(), STALE_CONTENT_HEARTBEAT_MS);

        if (!ownership.acquire) return ownership;
        root.setAttribute(CONTENT_BOOTSTRAP_ATTR, "true");
        root.setAttribute(CONTENT_INSTANCE_ATTR, this.instanceId);
        this.owns = true;
        this.startHeartbeat();
        return ownership;
    }

    ownsBootstrap(): boolean {
        return this.owns;
    }

    release(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
        const root = this.document.documentElement;
        if (root.getAttribute(CONTENT_INSTANCE_ATTR) === this.instanceId) {
            root.removeAttribute(CONTENT_BOOTSTRAP_ATTR);
            root.removeAttribute(CONTENT_INSTANCE_ATTR);
            root.removeAttribute(CONTENT_HEARTBEAT_ATTR);
        }
        this.owns = false;
    }

    private startHeartbeat(): void {
        this.beat();
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(() => this.beat(), CONTENT_HEARTBEAT_MS);
    }

    private beat(): void {
        if (!this.owns) return;
        const root = this.document.documentElement;
        root.setAttribute(CONTENT_HEARTBEAT_ATTR, String(this.now()));
        root.setAttribute(CONTENT_INSTANCE_ATTR, this.instanceId);
    }
}
