import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "fs";
import path from "path";

type TestSiteConfig = {
    id: string;
    review?: {
        stableModeLastReviewedAt: string | null;
        nativeModeLastReviewedAt: string | null;
        stableModeStatus: "not-functional" | null;
        nativeModeStatus: "not-functional" | null;
    };
    selectors?: { messageTurn?: string; scrollContainer?: string };
    ui?: { loadMorePlacement?: string; loadMoreRevealAnchorMs?: number; loadMoreTheme?: string };
    messageUnit?: { elementsPerMessage?: number };
    messageIdAttribute?: string;
};

const SITES_CONFIG = JSON.parse(readFileSync(path.resolve("sites.config.json"), "utf8")) as TestSiteConfig[];
const CHATGPT_STABLE_MODE_LAST_REVIEWED_AT = SITES_CONFIG.find((site) => site.id === "chatgpt")
    ?.review?.stableModeLastReviewedAt ?? null;

test("content entrypoint loads native code only behind dynamic Native Mode imports", () => {
    const source = readFileSync(path.resolve("src/content/index.ts"), "utf8");

    expect(source).not.toMatch(/from \"\.\/native\//);
    expect(source).toContain('import("./native/NativeModeController")');
    expect(source).toContain('import("./native/chatgpt/ChatGptContentRuntime")');
    expect(source).toContain("createExtensionStatus");
    for (const forbidden of [
        "ensureChatGptTextSnapshotRendererState",
        "syncChatGptNativeSnapshots",
        "detectChatGptDeliveryTimeout",
        "detectChatGptMaxLengthReadonly",
        "ChatGptTextSnapshotRenderer",
        "ChatGptTurnContentVisibilityController",
        "estimateChatGptPromptTokens",
        "readChatGptComposerText",
        "VirtualizationConflictDetector",
        "ToolCallGroupController",
        "TurnRegistry",
    ]) {
        expect(source, `${forbidden} belongs inside the ChatGPT runtime adapter`).not.toContain(forbidden);
    }
});

test("content entrypoint delegates popup status DTO shaping", () => {
    const source = readFileSync(path.resolve("src/content/index.ts"), "utf8");

    expect(source).toContain("return createExtensionStatus({");
    for (const field of [
        "nativeModeSnapshotHosts:",
        "chatGptDeliveryTimeoutDetected:",
        "editorInputEventCount:",
        "observerLastBatchClass:",
        "nativeModeVirtualizationDisabled:",
    ]) {
        expect(source, `${field} belongs in ContentStatusPresenter`).not.toContain(field);
    }
});

test("content entrypoint delegates bootstrap leasing", () => {
    const source = readFileSync(path.resolve("src/content/index.ts"), "utf8");

    expect(source).toContain("new ContentBootstrapLease");
    for (const marker of [
        "data-acsb-content-bootstrapped",
        "data-acsb-content-instance",
        "data-acsb-content-heartbeat-at",
        "contentHeartbeatTimer",
    ]) {
        expect(source, `${marker} belongs in ContentBootstrapLease`).not.toContain(marker);
    }
});

test("stable load-more never exposes a full-conversation reload bypass", () => {
    const contentSource = readFileSync(path.resolve("src/content/index.ts"), "utf8");
    const uiSource = readFileSync(path.resolve("src/content/UIComponents.ts"), "utf8");
    const fetchSource = readFileSync(path.resolve("src/content/fetchInterceptor.ts"), "utf8");

    for (const source of [contentSource, uiSource, fetchSource]) {
        expect(source).not.toContain("Load full conversation");
        expect(source).not.toContain("showFetchTrimmed");
        expect(source).not.toContain("handleFetchTrimmed");
        expect(source).not.toContain("reloadCurrentPage");
        expect(source).not.toContain("showFullLoad");
        expect(source).not.toContain("handleFullLoad");
        expect(source).not.toContain("__retired_full_load_bypass__");
    }
    expect(uiSource).toContain("Load ${perClick} older");
});

test("stable load-more reveal path stays bounded to the requested batch", () => {
    const source = readFileSync(path.resolve("src/content/MessageManager.ts"), "utf8");
    const loadMoreBody = source.match(/loadMore\(toLoad\?: number\): number \{(?<body>[\s\S]*?)\n    \}/)?.groups?.body ?? "";

    expect(loadMoreBody).toContain("firstVisibleIndex");
    expect(loadMoreBody).toContain("logicalToElementCount");
    expect(loadMoreBody).not.toContain(".filter(");
    expect(loadMoreBody).not.toContain(".slice(");
});

test("popup does not render the retired Auto Load Beta control", () => {
    const source = readFileSync(path.resolve("src/popup/popup.html"), "utf8");

    expect(source).not.toContain("toggle-auto-load");
    expect(source).not.toContain("Auto load");
    expect(source).not.toContain("Beta");
});

test("delivery-timeout refresh is not grouped with Stable-only controls", () => {
    const source = readFileSync(path.resolve("src/popup/popup.html"), "utf8");
    const toggleIndex = source.indexOf("toggle-delivery-timeout-refresh");
    const controlStart = source.lastIndexOf("<div class=\"setting\"", toggleIndex);
    const controlOpeningTag = source.slice(controlStart, source.indexOf(">", controlStart));

    expect(toggleIndex).toBeGreaterThan(0);
    expect(controlOpeningTag).not.toContain("data-legacy-control");
});

test("fast loading does not disable stable status counts", () => {
    const source = readFileSync(path.resolve("src/content/index.ts"), "utf8");

    expect(source).not.toContain("previousFastMode");
    expect(source).not.toContain("fastModeChanged");
    expect(source).not.toContain("config.fetchInterceptEnabled || displayStatus.totalMessages");
});

test("stable hidden turns leave the page flow while visible turns opt out of host placeholders", () => {
    const source = readFileSync(path.resolve("src/content/MessageManager.ts"), "utf8");

    expect(source).toContain("display:none!important");
    expect(source).toContain("content-visibility:visible!important");
    expect(source).toContain("contain-intrinsic-size:auto!important");
});

test("observer source keeps narrow mutation helpers", () => {
    const source = readFileSync(path.resolve("src/content/DOMObserver.ts"), "utf8");
    expect(source).toContain("TOOL_CALL_MUTATION_SELECTOR");
});

test("Stable DOM observation reads live turns instead of cache snapshots", () => {
    const source = readFileSync(path.resolve("src/content/DOMObserver.ts"), "utf8");
    expect(source).not.toContain("MessageQueryCache");
    expect(source).toContain("document.querySelectorAll<HTMLElement>(this.selectors.messageTurn)");
});

test("Stable fetch policy leaves ChatGPT rendering in control", () => {
    const bridgeSource = readFileSync(path.resolve("src/content/settingsBridge.ts"), "utf8");
    const policySource = readFileSync(path.resolve("src/shared/native-runtime-policy.ts"), "utf8");
    const fetchSource = readFileSync(path.resolve("src/content/fetchInterceptor.ts"), "utf8");

    expect(bridgeSource).toContain("fetchInterceptEnabled: false");
    expect(policySource).toContain("fetchInterceptEnabled: false");
    expect(fetchSource).toContain("Stable deliberately does not cache conversation responses");
    expect(fetchSource).not.toContain("RESPONSE_CACHE_MAX");
    expect(fetchSource).not.toContain("responseCache");
    expect(fetchSource).not.toContain("restoreCachedChunkState");
});

test("ChatGPT Stable Mode reviewed behavior is locked", () => {
    const contentSource = readFileSync(path.resolve("src/content/index.ts"), "utf8");
    const managerSource = readFileSync(path.resolve("src/content/MessageManager.ts"), "utf8");
    const bridgeSource = readFileSync(path.resolve("src/content/settingsBridge.ts"), "utf8");
    const policySource = readFileSync(path.resolve("src/shared/native-runtime-policy.ts"), "utf8");
    const fetchSource = readFileSync(path.resolve("src/content/fetchInterceptor.ts"), "utf8");
    const chatgpt = SITES_CONFIG.find((site) => site.id === "chatgpt");

    expect(chatgpt?.review?.stableModeLastReviewedAt).toBe(CHATGPT_STABLE_MODE_LAST_REVIEWED_AT);
    expect(chatgpt?.review?.nativeModeLastReviewedAt).toBeNull();
    expect(chatgpt?.review?.stableModeStatus).toBeNull();
    expect(chatgpt?.review?.nativeModeStatus).toBeNull();
    expect(chatgpt?.selectors?.messageTurn).toBe('section[data-testid^="conversation-turn-"]');
    expect(chatgpt?.selectors?.scrollContainer).toBe("div[data-scroll-root]");
    expect(chatgpt?.messageUnit?.elementsPerMessage).toBe(2);
    expect(chatgpt?.messageIdAttribute).toBe("data-turn-id");
    expect(chatgpt?.ui?.loadMorePlacement).toBe("left-of-share");

    expect(bridgeSource).toContain("fetchInterceptEnabled: false");
    expect(policySource).toContain("fetchInterceptEnabled: false");
    expect(policySource).not.toContain("fetchInterceptEnabled: true");
    expect(fetchSource).not.toContain("responseCache");
    expect(fetchSource).not.toContain("restoreCachedChunkState");
    for (const runtimeSource of [contentSource, managerSource, bridgeSource, policySource, fetchSource]) {
        expect(runtimeSource).not.toContain("stableModeLastReviewedAt");
        expect(runtimeSource).not.toContain("nativeModeLastReviewedAt");
        expect(runtimeSource).not.toContain("stableModeStatus");
        expect(runtimeSource).not.toContain("nativeModeStatus");
    }

    expect(contentSource).toContain("const effectiveHiddenMessages = status.hiddenMessages");
    expect(contentSource).toContain("const downloading = false");
    expect(contentSource).toContain("messageManager.loadMore()");
    expect(contentSource).toContain("preserveViewportAnchor(previousFirstVisible, previousTop)");
    expect(contentSource).not.toContain("loadNextStableChunk");
    expect(contentSource).not.toContain("readStableVirtualHiddenMessages");
    expect(contentSource).not.toContain("window.location.reload(), 120");

    const notFunctionalStableSiteIds = new Set(["perplexity", "search-ai-mode"]);
    for (const site of SITES_CONFIG.filter((site) => site.id !== "chatgpt")) {
        expect(site.review?.stableModeLastReviewedAt).toBeNull();
        expect(site.review?.nativeModeLastReviewedAt).toBeNull();
        expect(site.review?.stableModeStatus).toBe(
            notFunctionalStableSiteIds.has(site.id) ? "not-functional" : null,
        );
        expect(site.review?.nativeModeStatus).toBeNull();
    }

    expect(managerSource).toContain("display:none!important");
    expect(managerSource).toContain("overflow-anchor:none!important");
    expect(managerSource).toContain("candidate.getAttribute(\"data-turn-id-container\") === turnId");
    expect(managerSource).toContain("layoutElement = candidate");
});

test("Stable managed turns hide the outer ChatGPT layout wrapper", () => {
    const source = readFileSync(path.resolve("src/content/MessageManager.ts"), "utf8");

    expect(source).toContain("overflow-anchor:none!important");
    expect(source).toContain("content-visibility:visible!important");
    expect(source).toContain("candidate.getAttribute(\"data-turn-id-container\") === turnId");
    expect(source).toContain("layoutElement = candidate");
});

test("Stable Load More overlay uses reviewed site placement metadata", () => {
    const source = readFileSync(path.resolve("src/content/UIComponents.ts"), "utf8");
    const chatgpt = SITES_CONFIG.find((site) => site.id === "chatgpt");
    const gemini = SITES_CONFIG.find((site) => site.id === "gemini");

    expect(source).toContain('return this.siteConfig.ui?.loadMorePlacement !== "inline"');
    expect(source).toContain('const placement = this.siteConfig.ui?.loadMorePlacement ?? "top-right"');
    expect(source).toContain('this.siteConfig.ui?.loadMoreTheme === "gemini"');
    expect(chatgpt?.ui?.loadMorePlacement).toBe("left-of-share");
    expect(gemini?.ui?.loadMoreTheme).toBe("gemini");
    expect(gemini?.ui?.loadMoreRevealAnchorMs).toBe(2400);
});

test("Stable Load More reveals downloaded DOM without chunk reload", () => {
    const contentSource = readFileSync(path.resolve("src/content/index.ts"), "utf8");

    expect(contentSource).toContain("messageManager.loadMore()");
    expect(contentSource).toContain("preserveViewportAnchor(previousFirstVisible, previousTop)");
    expect(contentSource).toContain("DEFAULT_STABLE_DOM_REVEAL_ANCHOR_MAX_MS = 420");
    expect(contentSource).toContain("readStableRevealAnchorMaxMs()");
    expect(contentSource).toContain("currentSite.ui?.loadMoreRevealAnchorMs");
    expect(contentSource).toContain("requestAnimationFrame(restore)");
    expect(contentSource).not.toContain("loadNextStableChunk");
    expect(contentSource).not.toContain("setTimeout(() => window.location.reload(), 120)");
});

test("Stable ignores virtual history state", () => {
    const contentSource = readFileSync(path.resolve("src/content/index.ts"), "utf8");

    expect(contentSource).toContain("const effectiveHiddenMessages = status.hiddenMessages");
    expect(contentSource).toContain("const downloading = false");
    expect(contentSource).toContain("clearStableVirtualHistoryState");
    expect(contentSource).not.toContain("readStableVirtualHiddenMessages");
});

test("auto-load observer never forces the scroll position away from the top", () => {
    const source = readFileSync(path.resolve("src/content/DOMObserver.ts"), "utf8");

    expect(source.match(/private readonly handleScroll =/g)?.length).toBe(1);
    expect(source).not.toContain("scrollTo(");
    expect(source).not.toContain("0.12 * el.scrollHeight");
});

test("extension source does not carry Schoenwald large-file markers", () => {
    const marker = ["SCHOENWALD", "LARGE", "FILE"].join("-");
    const sourceRoots = ["src", "tests", "scripts"];
    const matches: string[] = [];

    for (const root of sourceRoots) {
        for (const filePath of listTextFiles(path.resolve(root))) {
            const source = readFileSync(filePath, "utf8");
            if (source.includes(marker)) matches.push(path.relative(process.cwd(), filePath));
        }
    }

    expect(matches).toEqual([]);
});

function listTextFiles(root: string): string[] {
    const stat = statSync(root);
    if (stat.isFile()) return [root];
    return readdirSync(root).flatMap((entry) => {
        const entryPath = path.join(root, entry);
        const entryStat = statSync(entryPath);
        if (entryStat.isDirectory()) return listTextFiles(entryPath);
        return /\.(?:cjs|js|mjs|ts|tsx)$/.test(entry) ? [entryPath] : [];
    });
}
