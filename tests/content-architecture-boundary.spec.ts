import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "fs";
import path from "path";

test("content entrypoint depends on ChatGPT through one provider runtime adapter", () => {
    const source = readFileSync(path.resolve("src/content/index.ts"), "utf8");

    expect(source).toContain('import { ChatGptContentRuntime }');
    expect(source).toContain('import { createExtensionStatus }');
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
        expect(source).not.toContain("showFullLoad");
        expect(source).not.toContain("handleFullLoad");
        expect(source).not.toContain("__retired_full_load_bypass__");
    }
    expect(contentSource).toContain("showFetchTrimmed");
    expect(uiSource).toContain("Load older messages");
});

test("stable load-more reveal path stays bounded to the requested batch", () => {
    const source = readFileSync(path.resolve("src/content/MessageManager.ts"), "utf8");
    const loadMoreBody = source.match(/loadMore\(toLoad\?: number\): number \{(?<body>[\s\S]*?)\n    \}/)?.groups?.body ?? "";

    expect(loadMoreBody).toContain("firstVisibleIndex");
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

test("fast-mode status invariants stay wired", () => {
    const source = readFileSync(path.resolve("src/content/index.ts"), "utf8");

    expect(source).toContain("previousFastMode");
    expect(source).toContain("fastModeChanged");
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
