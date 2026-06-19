/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: adapt ChatGPT-specific DOM/runtime behavior to the generic content entrypoint.
 * Boundary: ChatGPT selectors, native snapshot sync, and ChatGPT page diagnostics only.
 * ADR: docs/adr/architecture/native-mode/site-adapter-engine-boundary.md.
 */
import type { ExtensionConfig, ExtensionStatus } from "../../../shared/types";
import { createRenderUnitBudgetSnapshot, type RenderUnitBudgetSnapshot } from "../RenderUnitBudget";
import type { NativeModeController } from "../NativeModeController";
import { ToolCallGroupController } from "../ToolCallGroupController";
import { TurnRegistry } from "../TurnRegistry";
import { VirtualizationConflictDetector } from "../VirtualizationConflictDetector";
import {
    detectChatGptDeliveryTimeout,
    type ChatGptDeliveryTimeoutSnapshot,
} from "./ChatGptDeliveryTimeoutDetector";
import {
    detectChatGptMaxLengthReadonly,
    type ChatGptMaxLengthReadonlySnapshot,
} from "./ChatGptMaxLengthReadonlyDetector";
import { ChatGptTextSnapshotRenderer } from "./ChatGptTextSnapshotRenderer";
import { ChatGptTurnContentVisibilityController } from "./ChatGptTurnContainmentController";
import {
    estimateChatGptPromptTokens,
    readChatGptComposerText,
    type ChatGptTokenEstimate,
} from "./ChatGptTokenEstimator";
import { logger } from "../../../shared/logger";

const NATIVE_SNAPSHOT_SYNC_FAILURE_COOLDOWN_MS = 1_500;
const CHATGPT_RENDERED_MESSAGE_SELECTOR = "[data-message-author-role][data-message-id]";

export interface ChatGptContentRuntimePorts {
    readonly document: Document;
    readonly window: Window;
    readonly queryTurns: () => HTMLElement[];
    readonly findScrollContainer: () => HTMLElement | null;
    readonly onViewportResize: () => void;
    readonly onRecoverableError: (errorClass: string | null) => void;
}

export interface ChatGptPageInspection {
    readonly deliveryTimeout: ChatGptDeliveryTimeoutSnapshot;
    readonly maxLengthReadonly: ChatGptMaxLengthReadonlySnapshot;
    readonly tokenEstimate: ChatGptTokenEstimate;
}

export interface ChatGptContentRuntimeStatus {
    readonly nativeSnapshotHosts: number;
    readonly nativeSnapshotCacheBytes: number;
    readonly nativeRenderBudget: RenderUnitBudgetSnapshot | null;
    readonly nativeRevealLoopCount: number;
    readonly nativeScrollOscillationCount: number;
    readonly nativeVirtualizationDisabled: boolean;
    readonly nativeVirtualizationConflictReason: string | null;
}

export class ChatGptContentRuntime {
    private readonly nativeVirtualizationConflicts = new VirtualizationConflictDetector();
    private readonly nativeTurnRegistry = new TurnRegistry();
    private readonly nativeToolCallGroups = new ToolCallGroupController();
    private readonly ports: ChatGptContentRuntimePorts;
    private chatGptTextSnapshotRenderer: ChatGptTextSnapshotRenderer | null = null;
    private chatGptTurnContentVisibilityController: ChatGptTurnContentVisibilityController | null = null;
    private chatGptResizeListenerAttached = false;
    private nativeRenderBudget: RenderUnitBudgetSnapshot | null = null;
    private nativeSnapshotHosts = 0;
    private nativeSnapshotCacheBytes = 0;
    private nativeSnapshotSyncCooldownUntilMs = 0;
    private nativeScrollWorkRaf: number | null = null;
    private config: ExtensionConfig | null = null;

    constructor(ports: ChatGptContentRuntimePorts) {
        this.ports = ports;
    }

    updateConfig(config: ExtensionConfig): void {
        this.config = config;
        this.ensureNativeState();
    }

    invalidateTurnVisibility(): void {
        this.chatGptTurnContentVisibilityController?.invalidateAll();
    }

    restoreNativeArtifacts(): void {
        this.chatGptTextSnapshotRenderer?.restoreAll(this.ports.document);
        this.chatGptTurnContentVisibilityController?.restoreAll(this.ports.document);
    }

    resetNativeTracking(): void {
        this.invalidateTurnVisibility();
        this.restoreNativeArtifacts();
        this.nativeTurnRegistry.reset();
        this.nativeToolCallGroups.reset();
        this.nativeRenderBudget = null;
        this.nativeSnapshotHosts = 0;
        this.nativeSnapshotCacheBytes = 0;
    }

    inspectPage(): ChatGptPageInspection {
        return {
            deliveryTimeout: detectChatGptDeliveryTimeout(this.ports.document),
            maxLengthReadonly: detectChatGptMaxLengthReadonly(this.ports.document),
            tokenEstimate: estimateChatGptPromptTokens(
                readChatGptComposerText(this.ports.document),
            ),
        };
    }

    getDisplayStatus(status: ExtensionStatus): ExtensionStatus {
        const messages = Array.from(
            this.ports.document.querySelectorAll<HTMLElement>(CHATGPT_RENDERED_MESSAGE_SELECTOR),
        );
        if (messages.length <= status.totalMessages) return status;
        const visibleMessages = messages.filter((message) => !message.closest(".acsb-hidden")).length;
        return {
            ...status,
            totalMessages: messages.length,
            visibleMessages,
            hiddenMessages: Math.max(0, messages.length - visibleMessages),
        };
    }

    scheduleNativeScrollWork(controller: NativeModeController | null): void {
        if (this.nativeScrollWorkRaf !== null) return;
        this.nativeScrollWorkRaf = this.ports.window.requestAnimationFrame(() => {
            this.nativeScrollWorkRaf = null;
            this.syncNativeSnapshots(controller);
        });
    }

    snapshot(): ChatGptContentRuntimeStatus {
        const nativeConflictSnapshot = this.nativeVirtualizationConflicts.snapshot();
        return {
            nativeSnapshotHosts: this.nativeSnapshotHosts,
            nativeSnapshotCacheBytes: this.nativeSnapshotCacheBytes,
            nativeRenderBudget: this.nativeRenderBudget,
            nativeRevealLoopCount: nativeConflictSnapshot.revealLoopCount,
            nativeScrollOscillationCount: nativeConflictSnapshot.scrollOscillationCount,
            nativeVirtualizationDisabled: nativeConflictSnapshot.shouldDisableNativeVirtualization,
            nativeVirtualizationConflictReason: nativeConflictSnapshot.lastReason,
        };
    }

    dispose(): void {
        if (this.nativeScrollWorkRaf !== null) {
            this.ports.window.cancelAnimationFrame(this.nativeScrollWorkRaf);
            this.nativeScrollWorkRaf = null;
        }
        this.detachResizeListener();
        this.chatGptTextSnapshotRenderer?.stop();
        this.chatGptTextSnapshotRenderer = null;
        this.chatGptTurnContentVisibilityController?.stop(this.ports.document);
        this.chatGptTurnContentVisibilityController = null;
    }

    private ensureNativeState(): void {
        if (this.config?.performanceMode !== "native") {
            this.detachResizeListener();
            this.chatGptTextSnapshotRenderer?.stop();
            this.chatGptTextSnapshotRenderer = null;
            this.chatGptTurnContentVisibilityController?.stop(this.ports.document);
            this.chatGptTurnContentVisibilityController = null;
            this.scrubStableNativeArtifacts();
            return;
        }

        this.attachResizeListener();
        this.chatGptTextSnapshotRenderer ??= new ChatGptTextSnapshotRenderer();
        this.chatGptTurnContentVisibilityController ??= new ChatGptTurnContentVisibilityController();
        this.chatGptTextSnapshotRenderer.start(this.ports.document);
        this.chatGptTurnContentVisibilityController.start(this.ports.document);
    }

    private syncNativeSnapshots(controller: NativeModeController | null): void {
        const config = this.config;
        const renderer = this.chatGptTextSnapshotRenderer;
        const nativeActive =
            config?.performanceMode === "native" && controller?.snapshot().active === true;
        if (!renderer || !controller || !config || !nativeActive) {
            this.deactivateNativeArtifacts();
            return;
        }
        if (controller.shouldDeferBackgroundWork()) {
            controller.deferBackgroundWork();
            return;
        }
        if (Date.now() < this.nativeSnapshotSyncCooldownUntilMs) {
            controller.deferBackgroundWork();
            return;
        }

        try {
            const scrollRoot = this.ports.findScrollContainer() ?? this.ports.document.documentElement;
            this.nativeVirtualizationConflicts.recordScrollHeight(scrollRoot.scrollHeight);
            if (this.nativeVirtualizationConflicts.snapshot().shouldDisableNativeVirtualization) {
                renderer.restoreAll(this.ports.document);
                this.nativeSnapshotHosts = 0;
                this.nativeSnapshotCacheBytes = 0;
                return;
            }

            const turns = this.ports.queryTurns();
            this.nativeToolCallGroups.reset();
            const records = turns.map((turn, index) => this.nativeTurnRegistry.track(turn, index));
            for (const record of records) this.nativeToolCallGroups.indexTurn(record);
            this.nativeRenderBudget = createRenderUnitBudgetSnapshot(
                turns,
                this.nativeToolCallGroups.snapshot(),
                config.visibleMessageLimit,
            );

            renderer.restoreAll(this.ports.document);
            const result = this.chatGptTurnContentVisibilityController?.sync(turns, {
                liveWindowSize: this.nativeRenderBudget.liveWindowSize,
                nearestWindow: 2,
            });
            this.nativeSnapshotHosts = result?.containedTurns ?? 0;
            this.nativeSnapshotCacheBytes = 0;
        } catch (error) {
            this.handleNativeSnapshotSyncError(error);
        }
    }

    private handleNativeSnapshotSyncError(error: unknown): void {
        this.nativeSnapshotSyncCooldownUntilMs =
            Date.now() + NATIVE_SNAPSHOT_SYNC_FAILURE_COOLDOWN_MS;
        this.deactivateNativeArtifacts();
        const errorClass =
            error instanceof Error ? `native-snapshot-sync:${error.name}` : "native-snapshot-sync:error";
        this.ports.onRecoverableError(errorClass);
        logger.warn("native snapshot sync failed; cooldown started", error);
    }

    private deactivateNativeArtifacts(): void {
        this.restoreNativeArtifacts();
        ChatGptTextSnapshotRenderer.cleanupNativeArtifacts(this.ports.document);
        this.nativeTurnRegistry.reset();
        this.nativeToolCallGroups.reset();
        this.nativeRenderBudget = null;
        this.nativeSnapshotHosts = 0;
        this.nativeSnapshotCacheBytes = 0;
    }

    private scrubStableNativeArtifacts(): void {
        if (this.config?.performanceMode === "native") return;
        ChatGptTextSnapshotRenderer.cleanupNativeArtifacts(this.ports.document);
    }

    private attachResizeListener(): void {
        if (this.chatGptResizeListenerAttached) return;
        this.ports.window.addEventListener("resize", this.ports.onViewportResize);
        this.chatGptResizeListenerAttached = true;
    }

    private detachResizeListener(): void {
        if (!this.chatGptResizeListenerAttached) return;
        this.ports.window.removeEventListener("resize", this.ports.onViewportResize);
        this.chatGptResizeListenerAttached = false;
    }
}
