import { test, expect } from "@playwright/test";
import {
    getChatGptScopedDiagnosticsSelectorsForTests,
    inspectChatGptScopedDiagnostics,
} from "../src/content/native/chatgpt/ChatGptScopedDiagnostics";

test("ChatGPT scoped diagnostics split document and conversation counts", () => {
    const turn = nodeWithCount("turn", 2, { turnId: "t1" });
    const conversation = rootWith({ all: [turn, nodeWithCount("reply", 1)] });
    const documentRoot = rootWith({
        all: [conversation as HTMLElement, nodeWithCount("sidebar", 4), nodeWithCount("composer", 3, { composer: true })],
        composer: [nodeWithCount("composer", 3, { composer: true })],
        sidebar: [nodeWithCount("sidebar", 4)],
    }) as Document;

    const snapshot = inspectChatGptScopedDiagnostics({
        documentRoot,
        conversationRoot: conversation,
        turns: [turn],
    });

    expect(snapshot.documentNodeCount).toBe(4);
    expect(snapshot.conversationNodeCount).toBe(3);
    expect(snapshot.canonicalTurnCount).toBe(1);
    expect(snapshot.canonicalTurnNodeCount).toBe(3);
    expect(snapshot.composerNodeCount).toBe(4);
    expect(snapshot.sidebarNodeCount).toBe(5);
    expect(snapshot.stickyChrome).toMatchObject({ stickyNodeCount: 0, fixedNodeCount: 0, headerNodeCount: 0 });
});

test("ChatGPT scoped diagnostics exposes composer and sidebar selectors", () => {
    expect(getChatGptScopedDiagnosticsSelectorsForTests()).toMatchObject({
        composer: expect.stringContaining("prompt-textarea"),
        sidebar: expect.stringContaining("navigation"),
    });
});

function nodeWithCount(name: string, childCount: number, options: { readonly turnId?: string; readonly composer?: boolean } = {}): HTMLElement {
    return {
        name,
        contains: (other: HTMLElement) => other === undefined ? false : false,
        getAttribute: (attr: string) => {
            if (attr === "data-turn-id") return options.turnId ?? null;
            return null;
        },
        matches: (selector: string) => Boolean(
            (options.turnId && selector.includes("conversation-turn"))
            || (options.composer && (selector.includes("textarea") || selector.includes("contenteditable"))),
        ),
        closest: () => null,
        querySelector: () => null,
        querySelectorAll: () => Array.from({ length: childCount }, () => ({})),
    } as unknown as HTMLElement;
}

function rootWith(options: {
    readonly all: readonly HTMLElement[];
    readonly composer?: readonly HTMLElement[];
    readonly sidebar?: readonly HTMLElement[];
}): ParentNode {
    return {
        querySelectorAll: (selector: string) => {
            if (selector.includes("prompt-textarea")) return options.composer ?? [];
            if (selector.includes("navigation")) return options.sidebar ?? [];
            return options.all;
        },
    } as unknown as ParentNode;
}

test("ChatGPT Native scheduler decisions avoid full-page totals", async () => {
    const source = await import("node:fs/promises").then((fs) =>
        fs.readFile("src/content/native/chatgpt/ChatGptContentRuntime.ts", "utf8"),
    );

    expect(source).toContain("createRenderUnitBudgetSnapshotFromCost");
    expect(source).toContain("hydratedTurns.length");
    expect(source).toContain("this.nativeStaticContentMeasurement.estimatedTurnNodeCost");
    expect(source).toContain("nativeScopedDiagnostics");
    expect(source).not.toContain("nativeScopedDiagnostics.documentNodeCount");
});
