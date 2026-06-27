/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: adapt ChatGPT-specific DOM/runtime behavior to the generic content entrypoint.
 * Boundary: ChatGPT selectors, native snapshot sync, and ChatGPT page diagnostics only.
 * ADR: docs/adr/architecture/native-mode/site-adapter-engine-boundary.md.
 */
import type { ExtensionConfig, ExtensionStatus } from "../../../shared/types";
import { NativeDiagnosticsSampler } from "../NativeDiagnosticsSampler";
import { createRenderUnitBudgetSnapshotFromCost, type RenderUnitBudgetSnapshot } from "../RenderUnitBudget";
import type { NativeModeController } from "../NativeModeController";
import { ToolCallGroupController } from "../ToolCallGroupController";
import { TurnRegistry } from "../TurnRegistry";
import { VirtualizationConflictDetector } from "../VirtualizationConflictDetector";
import {
    ChatGptCodeBlockContainmentController,
    type ChatGptCodeBlockContainmentSnapshot,
} from "./ChatGptCodeBlockContainmentController";
import {
    ChatGptActionToolbarHoverGate,
    type ChatGptActionToolbarHoverGateSnapshot,
} from "./ChatGptActionToolbarHoverGate";
import {
    inspectChatGptAccessibleStatusPreservation,
    type ChatGptAccessibleStatusPreservationSnapshot,
} from "./ChatGptAccessibleStatusPreservation";
import {
    detectChatGptDeliveryTimeout,
    type ChatGptDeliveryTimeoutSnapshot,
} from "./ChatGptDeliveryTimeoutDetector";
import {
    ChatGptDataStateDeltaObserver,
    type ChatGptDataStateDeltaSnapshot,
} from "./ChatGptDataStateDeltaObserver";
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
    ChatGptInitialModalBootGate,
    type ChatGptInitialModalBootGateSnapshot,
} from "./ChatGptInitialModalBootGate";
import {
    createChatGptMessageMetadataSummary,
    type ChatGptMessageMetadataSummary,
} from "./ChatGptMessageMetadata";
import {
    readChatGptScrollRootState,
    type ChatGptScrollRootState,
} from "./ChatGptScrollRootState";
import {
    inspectChatGptSelectorDrift,
    type ChatGptSelectorDriftSentinelSnapshot,
} from "./ChatGptSelectorDriftSentinel";
import {
    inspectChatGptScopedDiagnostics,
    type ChatGptScopedDiagnosticsSnapshot,
} from "./ChatGptScopedDiagnostics";
import {
    ChatGptStaticContentMeasurementCache,
    type ChatGptStaticContentMeasurementCacheSnapshot,
} from "./ChatGptStaticContentMeasurementCache";
import { ChatGptTextSnapshotRenderer } from "./ChatGptTextSnapshotRenderer";
import {
    readChatGptThreadCssMetrics,
    type ChatGptThreadCssMetrics,
} from "./ChatGptThreadCssMetrics";
import {
    createChatGptToolCardDensityProfile,
    type ChatGptToolCardDensityProfile,
} from "./ChatGptToolCardDensityProfile";
import {
    createChatGptTurnCostProfile,
    prioritizeChatGptTurnRecordsByCost,
    type ChatGptTurnCostProfileSummary,
} from "./ChatGptTurnCostProfile";
import { ChatGptToolCallSummaryController } from "./ChatGptToolCallSummaryController";
import {
    ChatGptTurnContentVisibilityController,
    type ChatGptTurnContentVisibilityResult,
} from "./ChatGptTurnContainmentController";
import { ChatGptVisibleTurnPriorityController } from "./ChatGptVisibleTurnPriorityController";
import {
    estimateChatGptPromptTokens,
    readChatGptComposerText,
    type ChatGptTokenEstimate,
} from "./ChatGptTokenEstimator";
import {
    classifyChatGptThreadStatus,
    type ChatGptThreadStatusSnapshot,
} from "./ChatGptThreadStatusClassifier";
import {
    inspectChatGptToastPortalBoundary,
    type ChatGptToastPortalBoundarySnapshot,
} from "./ChatGptToastPortalBoundary";
import {
    summarizeChatGptTurnContentStates,
    updateChatGptTurnContentState,
    type ChatGptTurnContentStateSnapshot,
} from "./ChatGptTurnContentState";
import { logger } from "../../../shared/logger";
import { CHATGPT_STREAMING_SELECTOR, dedupeChatGptTurnElements } from "./ChatGptSelectors";

const NATIVE_SNAPSHOT_SYNC_FAILURE_COOLDOWN_MS = 1_500;
const NATIVE_PAGE_INSPECTION_SAMPLE_TTL_MS = 1_000;
const NATIVE_SNAPSHOT_HOST_BUDGET_FLOOR = 2;
const NATIVE_SNAPSHOT_HOST_BUDGET_CEILING = 10;

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
    readonly threadStatus: ChatGptThreadStatusSnapshot;
    readonly tokenEstimate: ChatGptTokenEstimate;
}

export interface ChatGptContentRuntimeStatus {
    readonly nativeSnapshotHosts: number;
    readonly nativeSnapshotCacheBytes: number;
    readonly nativeSnapshotHostBudget: ChatGptTurnContentVisibilityResult | null;
    readonly nativeInitialModalBootGate: ChatGptInitialModalBootGateSnapshot | null;
    readonly nativeRenderBudget: RenderUnitBudgetSnapshot | null;
    readonly nativeInteractiveNodeBudget: ChatGptInteractiveNodeBudgetSnapshot | null;
    readonly nativeToolCardDensityProfile: ChatGptToolCardDensityProfile | null;
    readonly nativeTurnCostProfile: ChatGptTurnCostProfileSummary | null;
    readonly nativeMessageMetadata: ChatGptMessageMetadataSummary | null;
    readonly nativeThreadCssMetrics: ChatGptThreadCssMetrics | null;
    readonly nativeCodeBlockContainment: ChatGptCodeBlockContainmentSnapshot | null;
    readonly nativeActionToolbarHoverGate: ChatGptActionToolbarHoverGateSnapshot | null;
    readonly nativeToastPortalBoundary: ChatGptToastPortalBoundarySnapshot | null;
    readonly nativeAccessibleStatus: ChatGptAccessibleStatusPreservationSnapshot | null;
    readonly nativeScrollRootState: ChatGptScrollRootState | null;
    readonly nativeDataStateDelta: ChatGptDataStateDeltaSnapshot | null;
    readonly nativeSelectorDrift: ChatGptSelectorDriftSentinelSnapshot | null;
    readonly nativeScopedDiagnostics: ChatGptScopedDiagnosticsSnapshot | null;
    readonly nativeTurnContentState: ChatGptTurnContentStateSnapshot | null;
    readonly nativeStaticContentMeasurement: ChatGptStaticContentMeasurementCacheSnapshot | null;
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
    private readonly actionToolbarHoverGate = new ChatGptActionToolbarHoverGate();
    private readonly pageInspectionSampler: NativeDiagnosticsSampler<ChatGptPageInspection>;
    private readonly toolCallSummaries = new ChatGptToolCallSummaryController();
    private readonly visibleTurnPriorities = new ChatGptVisibleTurnPriorityController();
    private readonly dataStateDeltas = new ChatGptDataStateDeltaObserver();
    private readonly initialModalBootGate = new ChatGptInitialModalBootGate();
    private readonly staticContentMeasurements = new ChatGptStaticContentMeasurementCache();
    private readonly ports: ChatGptContentRuntimePorts;
    private chatGptTextSnapshotRenderer: ChatGptTextSnapshotRenderer | null = null;
    private chatGptTurnContentVisibilityController: ChatGptTurnContentVisibilityController | null = null;
    private chatGptResizeListenerAttached = false;
    private nativeRenderBudget: RenderUnitBudgetSnapshot | null = null;
    private nativeInteractiveNodeBudget: ChatGptInteractiveNodeBudgetSnapshot | null = null;
    private nativeToolCardDensityProfile: ChatGptToolCardDensityProfile | null = null;
    private nativeTurnCostProfile: ChatGptTurnCostProfileSummary | null = null;
    private nativeMessageMetadata: ChatGptMessageMetadataSummary | null = null;
    private nativeThreadCssMetrics: ChatGptThreadCssMetrics | null = null;
    private nativeCodeBlockContainment: ChatGptCodeBlockContainmentSnapshot | null = null;
    private nativeActionToolbarHoverGate: ChatGptActionToolbarHoverGateSnapshot | null = null;
    private nativeToastPortalBoundary: ChatGptToastPortalBoundarySnapshot | null = null;
    private nativeAccessibleStatus: ChatGptAccessibleStatusPreservationSnapshot | null = null;
    private nativeScrollRootState: ChatGptScrollRootState | null = null;
    private nativeSelectorDrift: ChatGptSelectorDriftSentinelSnapshot | null = null;
    private nativeScopedDiagnostics: ChatGptScopedDiagnosticsSnapshot | null = null;
    private nativeTurnContentState: ChatGptTurnContentStateSnapshot | null = null;
    private nativeStaticContentMeasurement: ChatGptStaticContentMeasurementCacheSnapshot | null = null;
    private nativeSnapshotHosts = 0;
    private nativeSnapshotCacheBytes = 0;
    private nativeSnapshotHostBudget: ChatGptTurnContentVisibilityResult | null = null;
    private nativeInitialModalBootGate: ChatGptInitialModalBootGateSnapshot | null = null;
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
        this.nativeTurnCostProfile = null;
        this.nativeMessageMetadata = null;
        this.nativeThreadCssMetrics = null;
        this.nativeCodeBlockContainment = null;
        this.nativeActionToolbarHoverGate = null;
        this.nativeToastPortalBoundary = null;
        this.nativeAccessibleStatus = null;
        this.nativeScrollRootState = null;
        this.nativeSelectorDrift = null;
        this.nativeScopedDiagnostics = null;
        this.nativeTurnContentState = null;
        this.nativeStaticContentMeasurement = null;
        this.staticContentMeasurements.reset();
        this.dataStateDeltas.disconnect();
        this.nativeSnapshotHosts = 0;
        this.nativeSnapshotCacheBytes = 0;
        this.nativeSnapshotHostBudget = null;
        this.nativeInitialModalBootGate = null;
        this.initialModalBootGate.reset();
    }

    inspectPage(): ChatGptPageInspection {
        const bootGate = this.readInitialModalBootGate();
        if (!bootGate.ready) return createNeutralPageInspection();
        return this.pageInspectionSampler.read();
    }

    private readInitialModalBootGate(): ChatGptInitialModalBootGateSnapshot {
        this.nativeInitialModalBootGate = this.initialModalBootGate.read(this.ports.document);
        return this.nativeInitialModalBootGate;
    }

    private computePageInspection(): ChatGptPageInspection {
        return {
            deliveryTimeout: detectChatGptDeliveryTimeout(this.ports.document),
            maxLengthReadonly: detectChatGptMaxLengthReadonly(this.ports.document),
            threadStatus: classifyChatGptThreadStatus(this.ports.document),
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
            nativeSnapshotHostBudget: this.nativeSnapshotHostBudget,
            nativeInitialModalBootGate: this.nativeInitialModalBootGate,
            nativeRenderBudget: this.nativeRenderBudget,
            nativeInteractiveNodeBudget: this.nativeInteractiveNodeBudget,
            nativeToolCardDensityProfile: this.nativeToolCardDensityProfile,
            nativeTurnCostProfile: this.nativeTurnCostProfile,
            nativeMessageMetadata: this.nativeMessageMetadata,
            nativeThreadCssMetrics: this.nativeThreadCssMetrics,
            nativeCodeBlockContainment: this.nativeCodeBlockContainment,
            nativeActionToolbarHoverGate: this.nativeActionToolbarHoverGate,
            nativeToastPortalBoundary: this.nativeToastPortalBoundary,
            nativeAccessibleStatus: this.nativeAccessibleStatus,
            nativeScrollRootState: this.nativeScrollRootState,
            nativeDataStateDelta: this.dataStateDeltas.snapshot(),
            nativeSelectorDrift: this.nativeSelectorDrift,
            nativeScopedDiagnostics: this.nativeScopedDiagnostics,
            nativeTurnContentState: this.nativeTurnContentState,
            nativeStaticContentMeasurement: this.nativeStaticContentMeasurement,
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
        this.actionToolbarHoverGate.stop(this.ports.document);
        this.dataStateDeltas.disconnect();
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
            this.actionToolbarHoverGate.stop(this.ports.document);
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
        this.actionToolbarHoverGate.start(this.ports.document);
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
        const bootGate = this.readInitialModalBootGate();
        if (!bootGate.ready) {
            renderer.restoreAll(this.ports.document);
            this.chatGptTurnContentVisibilityController?.restoreAll(this.ports.document);
            this.nativeSnapshotHosts = 0;
            this.nativeSnapshotCacheBytes = 0;
            this.nativeSnapshotHostBudget = null;
            return;
        }

        try {
            const scrollRoot = this.ports.findScrollContainer() ?? this.ports.document.documentElement;
            this.nativeVirtualizationConflicts.recordScrollHeight(scrollRoot.scrollHeight);
            if (this.nativeVirtualizationConflicts.snapshot().shouldDisableNativeVirtualization) {
                renderer.restoreAll(this.ports.document);
                this.nativeSnapshotHosts = 0;
                this.nativeSnapshotCacheBytes = 0;
                this.nativeSnapshotHostBudget = null;
                return;
            }

            const turns = dedupeChatGptTurnElements(this.ports.queryTurns());
            const scrollContainer = this.ports.findScrollContainer();
            this.nativeSelectorDrift = inspectChatGptSelectorDrift({
                root: this.ports.document,
                scrollRoot: scrollContainer,
                turns,
            });
            if (!this.nativeSelectorDrift.riskyOptimizationAllowed) {
                renderer.restoreAll(this.ports.document);
                this.chatGptTurnContentVisibilityController?.restoreAll(this.ports.document);
                this.nativeSnapshotHosts = 0;
                this.nativeSnapshotCacheBytes = 0;
                this.nativeSnapshotHostBudget = null;
                return;
            }
            this.dataStateDeltas.setRoot(scrollContainer);
            const dataStateSnapshot = this.dataStateDeltas.snapshot();
            for (const turn of this.dataStateDeltas.consumeChangedTurns()) {
                this.nativeTurnRegistry.markDirtyByElement(turn);
            }
            this.nativeScrollRootState = readChatGptScrollRootState(scrollContainer, dataStateSnapshot.openStateCount > 0);
            if (this.nativeScrollRootState.shouldDeferOldTurnWork) {
                renderer.restoreAll(this.ports.document);
                this.chatGptTurnContentVisibilityController?.restoreAll(this.ports.document);
                this.nativeSnapshotHosts = 0;
                this.nativeSnapshotCacheBytes = 0;
                this.nativeSnapshotHostBudget = null;
                return;
            }
            const conversationScope = resolveChatGptConversationScope(this.ports.document, scrollContainer);
            this.nativeScopedDiagnostics = inspectChatGptScopedDiagnostics({
                documentRoot: this.ports.document,
                conversationRoot: conversationScope,
                turns,
            });
            this.nativeToastPortalBoundary = inspectChatGptToastPortalBoundary(this.ports.document);
            this.nativeAccessibleStatus = inspectChatGptAccessibleStatusPreservation(this.ports.document);
            this.nativeThreadCssMetrics = conversationScope instanceof Element
                ? readChatGptThreadCssMetrics(conversationScope, this.ports.window)
                : null;
            this.nativeInteractiveNodeBudget = createChatGptInteractiveNodeBudgetSnapshot(
                conversationScope,
                turns,
            );
            const records = turns.map((turn, index) => this.nativeTurnRegistry.track(turn, index));
            const turnContentStates = records.map((record) => updateChatGptTurnContentState(this.nativeTurnRegistry, record));
            this.nativeTurnContentState = summarizeChatGptTurnContentStates(turnContentStates);
            const hydratedRecords = records.filter((record) => record.hydrationState !== "placeholder");
            const hydratedTurns = hydratedRecords.map((record) => record.element);
            const dirtyKeys = this.nativeTurnRegistry.dirtyTurnKeys();
            this.nativeStaticContentMeasurement = this.staticContentMeasurements.measure(hydratedRecords, dirtyKeys);
            const dirtyRecords = this.nativeTurnRegistry.consumeDirtyRecords(hydratedRecords);
            const toolSourceRecords = dirtyRecords.length > 0 ? dirtyRecords : hydratedRecords;
            const costPrioritizedRecords = prioritizeChatGptTurnRecordsByCost(toolSourceRecords);
            const recordsForToolIndex = this.visibleTurnPriorities.prioritize(costPrioritizedRecords);
            if (toolSourceRecords === hydratedRecords) this.nativeToolCallGroups.reset();
            const toolGroups = recordsForToolIndex.flatMap((record) => [...this.nativeToolCallGroups.indexTurn(record)]);
            this.nativeToolCardDensityProfile = createChatGptToolCardDensityProfile(toolGroups, hydratedRecords.length);
            this.nativeMessageMetadata = createChatGptMessageMetadataSummary(records);
            this.toolCallSummaries.sync(
                toolGroups,
                false,
            );
            this.nativeRenderBudget = createRenderUnitBudgetSnapshotFromCost(
                hydratedTurns.length,
                this.nativeStaticContentMeasurement.estimatedTurnNodeCost,
                this.nativeToolCallGroups.snapshot(),
                config.visibleMessageLimit,
            );
            this.nativeTurnCostProfile = createChatGptTurnCostProfile(
                hydratedRecords,
                toolGroups,
                this.nativeRenderBudget.liveWindowSize,
            );
            this.nativeCodeBlockContainment = this.nativeScrollRootState.shouldDeferOldTurnWork
                ? null
                : this.codeBlockContainment.sync(
                    hydratedRecords,
                    this.nativeRenderBudget.liveWindowSize + 2,
                    this.nativeStaticContentMeasurement.codeBucketByTurnKey,
                );
            this.nativeActionToolbarHoverGate = this.actionToolbarHoverGate.sync(
                hydratedRecords,
                this.nativeRenderBudget.liveWindowSize + 2,
            );

            renderer.restoreAll(this.ports.document);
            const result = this.chatGptTurnContentVisibilityController?.sync(hydratedTurns, {
                liveWindowSize: this.nativeRenderBudget.liveWindowSize,
                nearestWindow: 2,
                maxContainedTurns: computeNativeSnapshotHostBudget(this.nativeRenderBudget.liveWindowSize),
            });
            this.nativeSnapshotHostBudget = result ?? null;
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
        this.nativeTurnCostProfile = null;
        this.nativeMessageMetadata = null;
        this.nativeThreadCssMetrics = null;
        this.nativeCodeBlockContainment = null;
        this.nativeActionToolbarHoverGate = null;
        this.nativeToastPortalBoundary = null;
        this.nativeAccessibleStatus = null;
        this.nativeScrollRootState = null;
        this.nativeSelectorDrift = null;
        this.nativeScopedDiagnostics = null;
        this.nativeTurnContentState = null;
        this.nativeStaticContentMeasurement = null;
        this.staticContentMeasurements.reset();
        this.dataStateDeltas.disconnect();
        this.nativeSnapshotHosts = 0;
        this.nativeSnapshotCacheBytes = 0;
        this.nativeSnapshotHostBudget = null;
        this.nativeInitialModalBootGate = null;
        this.initialModalBootGate.reset();
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

function computeNativeSnapshotHostBudget(liveWindowSize: number): number {
    const requested = Math.max(NATIVE_SNAPSHOT_HOST_BUDGET_FLOOR, Math.floor(liveWindowSize) + 4);
    return Math.min(NATIVE_SNAPSHOT_HOST_BUDGET_CEILING, requested);
}

function createNeutralPageInspection(): ChatGptPageInspection {
    return {
        deliveryTimeout: { detected: false, confidence: "none", scope: "none", retryButtonCount: 0, assistantErrorCount: 0, firstMessageId: null, affectedMessageIds: [], reason: null },
        maxLengthReadonly: { detected: false, reason: null },
        threadStatus: { detected: false, kind: "none", reason: null, controlCount: 0 },
        tokenEstimate: estimateChatGptPromptTokens(""),
    };
}
