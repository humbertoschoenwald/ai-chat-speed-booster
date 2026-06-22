/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: adapt ChatGPT-specific DOM/runtime behavior to the generic content entrypoint.
 * Boundary: ChatGPT selectors, native snapshot sync, and ChatGPT page diagnostics only.
 * ADR: docs/adr/architecture/native-mode/site-adapter-engine-boundary.md.
 */
import type { ExtensionConfig, ExtensionStatus } from "../../../shared/types";
import { NativeDiagnosticsSampler } from "../NativeDiagnosticsSampler";
import { createRenderUnitBudgetSnapshot, type RenderUnitBudgetSnapshot } from "../RenderUnitBudget";
import type { NativeModeController } from "../NativeModeController";
import { ToolCallGroupController } from "../ToolCallGroupController";
import { TurnRegistry } from "../TurnRegistry";
import { VirtualizationConflictDetector } from "../VirtualizationConflictDetector";
import {
    ChatGptCodeBlockContainmentController,
    type ChatGptCodeBlockContainmentSnapshot,
} from "./ChatGptCodeBlockContainmentController";
import {
    detectChatGptDeliveryTimeout,
    type ChatGptDeliveryTimeoutSnapshot,
} from "./ChatGptDeliveryTimeoutDetector";
import {
    detectChatGptMaxLengthReadonly,
    type ChatGptMaxLengthReadonlySnapshot,
} from "./ChatGptMaxLengthReadonlyDetector";
import { resolveChatGptConversationScope } from "./ChatGptConversationScope";
import { createChatGptLogicalDisplayStatus } from "./ChatGptLogicalTurnCounter";
import {
    createChatGptInteractiveNodeBudgetSnapshot,
    type ChatGptInteractiveNodeBudgetSnapshot,
} from "./ChatGptInteractiveNodeBudget";
import {
    readChatGptScrollRootState,
    type ChatGptScrollRootState,
} from "./ChatGptScrollRootState";
import { ChatGptTextSnapshotRenderer } from "./ChatGptTextSnapshotRenderer";
import {
    readChatGptThreadCssMetrics,
    type ChatGptThreadCssMetrics,
} from "./ChatGptThreadCssMetrics";
import {
    createChatGptToolCardDensityProfile,
    type ChatGptToolCardDensityProfile,
} from "./ChatGptToolCardDensityProfile";
import { ChatGptToolCallSummaryController } from "./ChatGptToolCallSummaryController";
import { ChatGptTurnContentVisibilityController } from "./ChatGptTurnContainmentController";
import { ChatGptVisibleTurnPriorityController } from "./ChatGptVisibleTurnPriorityController";
import {
    estimateChatGptPromptTokens,
    readChatGptComposerText,
    type ChatGptTokenEstimate,
} from "./ChatGptTokenEstimator";
import { logger } from "../../../shared/logger";
import { CHATGPT_STREAMING_SELECTOR, dedupeChatGptTurnElements } from "./ChatGptSelectors";

const NATIVE_SNAPSHOT_SYNC_FAILURE_COOLDOWN_MS = 1_500;
const NATIVE_PAGE_INSPECTION_SAMPLE_TTL_MS = 1_000;

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
    readonly nativeInteractiveNodeBudget: ChatGptInteractiveNodeBudgetSnapshot | null;
    readonly nativeToolCardDensityProfile: ChatGptToolCardDensityProfile | null;
    readonly nativeThreadCssMetrics: ChatGptThreadCssMetrics | null;
    readonly nativeCodeBlockContainment: ChatGptCodeBlockContainmentSnapshot | null;
    readonly nativeScrollRootState: ChatGptScrollRootState | null;
    readonly nativeRevealLoopCount: number;
    readonly nativeScrollOscillationCount: number;
    readonly nativeVirtualizationDisabled: boolean;
    readonly nativeVirtualizationConflictReason: string | null;
}

export class ChatGptContentRuntime {
    private readonly nativeVirtualizationConflicts = new VirtualizationConflictDetector();
    private readonly nativeTurnRegistry = new TurnRegistry();
    private readonly nativeToolCallGroups = new ToolCallGroupController();
    private readonly codeBlockContainment = new ChatGptCodeBlockContainmentController();
    private readonly pageInspectionSampler: NativeDiagnosticsSampler<ChatGptPageInspection>;
    private readonly toolCallSummaries = new ChatGptToolCallSummaryController();
    private readonly visibleTurnPriorities = new ChatGptVisibleTurnPriorityController();
    private readonly ports: ChatGptContentRuntimePorts;
    private chatGptTextSnapshotRenderer: ChatGptTextSnapshotRenderer | null = null;
    private chatGptTurnContentVisibilityController: ChatGptTurnContentVisibilityController | null = null;
    private chatGptResizeListenerAttached = false;
    private nativeRenderBudget: RenderUnitBudgetSnapshot | null = null;
    private nativeInteractiveNodeBudget: ChatGptInteractiveNodeBudgetSnapshot | null = null;
    private nativeToolCardDensityProfile: ChatGptToolCardDensityProfile | null = null;
    private nativeThreadCssMetrics: ChatGptThreadCssMetrics | null = null;
    private nativeCodeBlockContainment: ChatGptCodeBlockContainmentSnapshot | null = null;
    private nativeScrollRootState: ChatGptScrollRootState | null = null;
    private nativeSnapshotHosts = 0;
    private nativeSnapshotCacheBytes = 0;
    private nativeSnapshotSyncCooldownUntilMs = 0;
    private nativeScrollWorkRaf: number | null = null;
    private config: ExtensionConfig | null = null;

    constructor(ports: ChatGptContentRuntimePorts) {
        this.ports = ports;
        this.pageInspectionSampler = new NativeDiagnosticsSampler(
            NATIVE_PAGE_INSPECTION_SAMPLE_TTL_MS,
            () => this.computePageInspection(),
        );
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
        this.toolCallSummaries.restoreAll(this.ports.document);
    }

    resetNativeTracking(): void {
        this.invalidateTurnVisibility();
        this.restoreNativeArtifacts();
        this.nativeTurnRegistry.reset();
        this.nativeToolCallGroups.reset();
        this.pageInspectionSampler.clear();
        this.nativeRenderBudget = null;
        this.nativeInteractiveNodeBudget = null;
        this.nativeToolCardDensityProfile = null;
        this.nativeThreadCssMetrics = null;
        this.nativeCodeBlockContainment = null;
        this.nativeScrollRootState = null;
        this.nativeSnapshotHosts = 0;
        this.nativeSnapshotCacheBytes = 0;
    }

    inspectPage(): ChatGptPageInspection {
        return this.pageInspectionSampler.read();
    }

    private computePageInspection(): ChatGptPageInspection {
        return {
            deliveryTimeout: detectChatGptDeliveryTimeout(this.ports.document),
            maxLengthReadonly: detectChatGptMaxLengthReadonly(this.ports.document),
            tokenEstimate: estimateChatGptPromptTokens(
                readChatGptComposerText(this.ports.document),
            ),
        };
    }

    getDisplayStatus(status: ExtensionStatus): ExtensionStatus {
        return createChatGptLogicalDisplayStatus(this.ports.queryTurns(), status);
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
            nativeInteractiveNodeBudget: this.nativeInteractiveNodeBudget,
            nativeToolCardDensityProfile: this.nativeToolCardDensityProfile,
            nativeThreadCssMetrics: this.nativeThreadCssMetrics,
            nativeCodeBlockContainment: this.nativeCodeBlockContainment,
            nativeScrollRootState: this.nativeScrollRootState,
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
        this.toolCallSummaries.stop(this.ports.document);
        this.codeBlockContainment.stop(this.ports.document);
    }

    private ensureNativeState(): void {
        if (this.config?.performanceMode !== "native" && this.config?.performanceMode !== "extreme") {
            this.detachResizeListener();
            this.chatGptTextSnapshotRenderer?.stop();
            this.chatGptTextSnapshotRenderer = null;
            this.chatGptTurnContentVisibilityController?.stop(this.ports.document);
            this.chatGptTurnContentVisibilityController = null;
            this.toolCallSummaries.stop(this.ports.document);
            this.codeBlockContainment.stop(this.ports.document);
            this.scrubStableNativeArtifacts();
            return;
        }

        this.attachResizeListener();
        this.chatGptTextSnapshotRenderer ??= new ChatGptTextSnapshotRenderer();
        this.chatGptTurnContentVisibilityController ??= new ChatGptTurnContentVisibilityController();
        this.chatGptTextSnapshotRenderer.start(this.ports.document);
        this.chatGptTurnContentVisibilityController.start(this.ports.document);
        this.toolCallSummaries.start(this.ports.document);
        this.codeBlockContainment.start(this.ports.document);
    }

    private syncNativeSnapshots(controller: NativeModeController | null): void {
        const config = this.config;
        const renderer = this.chatGptTextSnapshotRenderer;
        const nativeActive =
            (config?.performanceMode === "native" || config?.performanceMode === "extreme") && controller?.snapshot().active === true;
        if (!renderer || !controller || !config || !nativeActive) {
            this.deactivateNativeArtifacts();
            return;
        }
        if (controller.shouldDeferBackgroundWork()) {
            controller.deferBackgroundWork();
            return;
        }
        if (this.isReplyInProgress()) {
            controller.protectBackgroundWork("reply-in-progress", 750);
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

            const turns = dedupeChatGptTurnElements(this.ports.queryTurns());
            const scrollContainer = this.ports.findScrollContainer();
            this.nativeScrollRootState = readChatGptScrollRootState(scrollContainer);
            const conversationScope = resolveChatGptConversationScope(this.ports.document, scrollContainer);
            this.nativeThreadCssMetrics = conversationScope instanceof Element
                ? readChatGptThreadCssMetrics(conversationScope, this.ports.window)
                : null;
            this.nativeInteractiveNodeBudget = createChatGptInteractiveNodeBudgetSnapshot(
                conversationScope,
                turns,
            );
            const records = turns.map((turn, index) => this.nativeTurnRegistry.track(turn, index));
            const dirtyRecords = this.nativeTurnRegistry.consumeDirtyRecords(records);
            const toolSourceRecords = dirtyRecords.length > 0 ? dirtyRecords : records;
            const recordsForToolIndex = this.visibleTurnPriorities.prioritize(toolSourceRecords);
            if (toolSourceRecords === records) this.nativeToolCallGroups.reset();
            const toolGroups = recordsForToolIndex.flatMap((record) => [...this.nativeToolCallGroups.indexTurn(record)]);
            this.nativeToolCardDensityProfile = createChatGptToolCardDensityProfile(toolGroups, records.length);
            this.toolCallSummaries.sync(
                toolGroups,
                this.nativeToolCardDensityProfile.behavior === "static-summary",
            );
            this.nativeRenderBudget = createRenderUnitBudgetSnapshot(
                turns,
                this.nativeToolCallGroups.snapshot(),
                config.visibleMessageLimit,
            );
            this.nativeCodeBlockContainment = this.nativeScrollRootState.shouldDeferOldTurnWork
                ? null
                : this.codeBlockContainment.sync(
                    records,
                    this.nativeRenderBudget.liveWindowSize + 2,
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

    private isReplyInProgress(): boolean {
        return this.ports.document.querySelector(CHATGPT_STREAMING_SELECTOR) !== null;
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
        this.nativeInteractiveNodeBudget = null;
        this.nativeToolCardDensityProfile = null;
        this.nativeThreadCssMetrics = null;
        this.nativeCodeBlockContainment = null;
        this.nativeScrollRootState = null;
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
