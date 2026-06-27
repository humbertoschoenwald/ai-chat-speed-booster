/**
 * License: MIT. Provenance: AI Chat Speed Booster extension tests.
 * Responsibility: verify popup status payload assembly remains a pure presenter concern.
 * Boundary: no DOM or content-script bootstrapping is exercised here.
 * ADR: docs/adr/architecture/lifecycle/content-health-status.md.
 */
import { test, expect } from "@playwright/test";
import { createExtensionStatus } from "../src/content/status/ContentStatusPresenter";
import type { ExtensionStatus } from "../src/shared/types";

const baseStatus: ExtensionStatus = {
    enabled: true,
    totalMessages: 4,
    visibleMessages: 2,
    hiddenMessages: 2,
    showStatus: true,
    statusPosition: "top-right",
};

test("content status presenter is the SSOT for extension diagnostics payloads", () => {
    const status = createExtensionStatus({
        baseStatus,
        siteId: "chatgpt",
        performanceMode: "native",
        lifecycle: {
            state: "degraded",
            bootTime: 10,
            lastUiRefreshAt: 20,
            overlayPresent: true,
            lastRecoverableErrorClass: "chatgpt-delivery-timeout:structural",
        },
        nativeState: {
            active: true,
            selectorHealth: { healthy: true, reasons: [] },
            editorInput: { active: true },
            adapter: { siteId: "chatgpt", displayName: "ChatGPT", support: "enabled" },
            blockedReason: null,
            executionPlan: {
                canStart: true,
                reason: "native adapter enabled",
                activeFeatures: ["diagnostics"],
                blockedFeatures: [],
                mutationBudgetMs: 8,
                inputQuietWindowMs: 120,
                scrollOverscanPx: 900,
            },
        } as never,
        editorInput: {
            active: true,
            composing: false,
            deferredTaskCount: 1,
            eventCount: 2,
            lastEventType: "input",
            lastEventAt: 30,
            protectedUntilMs: 40,
            lastPasteLength: null,
            lastPasteChunkCount: null,
        },
        observer: {
            lastBatchClass: "small",
            lastBatchSize: 1,
            lastScannedNodeCount: 2,
            lastSkippedNodeCount: 0,
            lastDurationMs: 0.5,
            overBudgetCount: 0,
        },
        chatGptInspection: {
            deliveryTimeout: { detected: true, confidence: "structural", scope: "turn", retryButtonCount: 1, assistantErrorCount: 1, firstMessageId: "m1", affectedMessageIds: ["m1"], reason: "delivery-timeout" },
            maxLengthReadonly: { detected: false, reason: null },
            threadStatus: { detected: true, kind: "readonly", reason: "readonly-thread-status", controlCount: 1 },
            tokenEstimate: { approxTokens: 1200, limitTokens: 32000, ratio: 0.04, warningLevel: "ok" },
        } as never,
        chatGptStatus: {
            nativeSnapshotHosts: 2,
            nativeSnapshotCacheBytes: 0,
            nativeSnapshotHostBudget: {
                containedTurns: 2,
                budgetLimit: 2,
                budgetOverrun: 1,
                budgetAffectedTurnIds: ["turn-old"],
            },
            nativeInitialModalBootGate: {
                ready: true,
                markerPresent: true,
                fallbackElapsed: false,
                elapsedMs: 12,
            },
            nativeRenderBudget: null,
            nativeTurnCostProfile: {
                totalTurns: 2,
                userTurns: 1,
                assistantTurns: 1,
                toolRichAssistantTurns: 1,
                largeUserCodeTurns: 0,
                buckets: { low: 0, medium: 0, high: 0, "tool-rich": 1, "large-code": 0 },
                behaviors: { noop: 1, snapshot: 0, "contain-code": 0, "tool-card": 1 },
                sample: [{ key: "turn-a", role: "assistant", costBucket: "tool-rich", selectedBehavior: "tool-card", visible: false, toolGroupCount: 1, codeBlockCount: 0, buttonCount: 4, svgCount: 5, nodeCost: 42 }],
            },
            nativeMessageMetadata: {
                totalTurns: 2,
                messageIdCount: 1,
                missingMessageIdCount: 1,
                repeatedMessageIdCount: 0,
                roleSourceCounts: { section: 1, message: 1 },
                roleConfidenceCounts: { high: 2 },
                unknownRoleCount: 0,
                currentAssistant: { messageId: "assistant-1", turnId: null, testId: null, authorRole: "assistant", modelLabel: "gpt-test" },
            },
            nativeRevealLoopCount: 0,
            nativeScrollOscillationCount: 0,
            nativeVirtualizationDisabled: false,
            nativeVirtualizationConflictReason: null,
        },
    });

    expect(status).toMatchObject({
        siteId: "chatgpt",
        performanceMode: "native",
        contentLifecycleState: "degraded",
        nativeModeAdapterName: "ChatGPT",
        chatGptDeliveryTimeoutDetected: true,
        chatGptDeliveryTimeoutScope: "turn",
        chatGptDeliveryTimeoutAffectedMessageIds: ["m1"],
        chatGptThreadStatusDetected: true,
        chatGptThreadStatusKind: "readonly",
        chatGptThreadStatusReason: "readonly-thread-status",
        chatGptThreadStatusControlCount: 1,
        nativeModeApproxInputTokens: 1200,
        nativeModeSnapshotHosts: 2,
        nativeModeSnapshotHostBudgetLimit: 2,
        nativeModeSnapshotHostBudgetOverrun: 1,
        nativeModeSnapshotHostBudgetAffectedTurnIds: ["turn-old"],
        nativeModeInitialModalReady: true,
        nativeModeInitialModalMarkerPresent: true,
        nativeModeInitialModalFallbackElapsed: false,
        nativeModeInitialModalElapsedMs: 12,
        observerLastBatchSize: 1,
        editorInputEventCount: 2,
        nativeModeTurnCostAssistantTurns: 1,
        nativeModeTurnCostToolRichAssistantTurns: 1,
        nativeModeTurnCostSample: ["assistant:tool-rich:tool-card"],
        nativeModeMessageIdCount: 1,
        nativeModeMissingMessageIdCount: 1,
        nativeModeUnknownRoleCount: 0,
        nativeModeCurrentAssistantMessageId: "assistant-1",
        nativeModeCurrentAssistantModelLabel: "gpt-test",
    });
});

test("status presenter exposes Native role source diagnostics", () => {
    const status = createExtensionStatus({
        baseStatus,
        siteId: "chatgpt",
        performanceMode: "native",
        lifecycle: {
            state: "active",
            bootTime: 10,
            lastUiRefreshAt: 20,
            overlayPresent: true,
            lastRecoverableErrorClass: null,
        },
        nativeState: null,
        editorInput: {
            active: false,
            composing: false,
            deferredTaskCount: 0,
            eventCount: 0,
            lastEventType: null,
            lastEventAt: null,
            protectedUntilMs: null,
            lastPasteLength: null,
            lastPasteChunkCount: null,
        },
        observer: {
            lastBatchClass: null,
            lastBatchSize: 0,
            lastScannedNodeCount: 0,
            lastSkippedNodeCount: 0,
            lastDurationMs: 0,
            overBudgetCount: 0,
        },
        chatGptInspection: null,
        chatGptStatus: {
            nativeSnapshotHosts: 0,
            nativeSnapshotCacheBytes: 0,
            nativeSnapshotHostBudget: null,
            nativeInitialModalBootGate: null,
            nativeRenderBudget: null,
            nativeInteractiveNodeBudget: null,
            nativeToolCardDensityProfile: null,
            nativeTurnCostProfile: null,
            nativeMessageMetadata: {
                totalTurns: 2,
                messageIdCount: 0,
                missingMessageIdCount: 2,
                repeatedMessageIdCount: 0,
                roleSourceCounts: { cached: 1, unknown: 1 },
                roleConfidenceCounts: { medium: 1, low: 1 },
                unknownRoleCount: 1,
                currentAssistant: null,
            },
            nativeThreadCssMetrics: null,
            nativeCodeBlockContainment: null,
            nativeLayoutChangeBatch: null,
            nativeActionToolbarHoverGate: null,
            nativeToastPortalBoundary: null,
            nativeAccessibleStatus: null,
            nativeScrollRootState: null,
            nativeDataStateDelta: null,
            nativeSelectorDrift: null,
            nativeScopedDiagnostics: null,
            nativeTurnContentState: null,
            nativeStaticContentMeasurement: null,
            nativeRevealLoopCount: 0,
            nativeScrollOscillationCount: 0,
            nativeVirtualizationDisabled: false,
            nativeVirtualizationConflictReason: null,
        },
    });

    expect(status.nativeModeRoleSourceCounts).toEqual({ cached: 1, unknown: 1 });
    expect(status.nativeModeRoleConfidenceCounts).toEqual({ medium: 1, low: 1 });
    expect(status.nativeModeUnknownRoleCount).toBe(1);
});
