import type { NativeTuningProfile } from "../NativeTuningProfile";

export const CHATGPT_NATIVE_TUNING_PROFILE: NativeTuningProfile = {
    id: "chatgpt-native-v1",
    siteId: "chatgpt",
    budgets: {
        mutationBudgetMs: 8,
        inputQuietWindowMs: 250,
        restoreQuietWindowMs: 120,
        scrollOverscanPx: 900,
        maxFrozenTurns: 200,
    },
    selectors: {
        turnRoot: "article[data-testid^='conversation-turn-']",
        composerRoot: "[contenteditable='true'], textarea",
        streamingControls: [
            "button[aria-label*='Stop']",
            "button[data-testid*='stop']",
        ],
        toolCallRoots: [
            "[data-testid*='tool']",
            "[class*='tool']",
        ],
    },
    enabledFeatures: [
        "selector-guard",
        "editor-input-protection",
        "sanitized-diagnostics",
        "historical-turn-containment",
        "old-turn-hover-quiet",
        "static-tool-icon-paint",
        "long-task-throttle",
        "work-scheduler-lanes",
    ],
    blockedFeatures: [
        "live-turn-freeze",
        "live-scroll-compensation",
        "live-tool-call-freeze",
        "automatic-stop-recovery",
        "resource-pruning",
    ],
};
