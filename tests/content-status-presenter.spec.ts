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
            deliveryTimeout: { detected: true, confidence: "structural", retryButtonCount: 1, assistantErrorCount: 1, firstMessageId: "m1", reason: "delivery-timeout" },
            maxLengthReadonly: { detected: false, reason: null },
            tokenEstimate: { approxTokens: 1200, limitTokens: 32000, ratio: 0.04, warningLevel: "ok" },
        } as never,
        chatGptStatus: {
            nativeSnapshotHosts: 2,
            nativeSnapshotCacheBytes: 0,
            nativeRenderBudget: null,
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
        nativeModeApproxInputTokens: 1200,
        nativeModeSnapshotHosts: 2,
        observerLastBatchSize: 1,
        editorInputEventCount: 2,
    });
});
