import { test, expect } from "@playwright/test";
import {
    getChatGptAnchoredMenuRelationshipSelectorForTests,
    hasChatGptAnchoredMenuRelationship,
    inspectChatGptAnchoredMenuRelationships,
} from "../src/content/native/chatgpt/ChatGptAnchoredMenuRelationships";

test("ChatGPT anchored relationship selector covers menu and tooltip metadata", () => {
    const selector = getChatGptAnchoredMenuRelationshipSelectorForTests();

    expect(selector).toContain("aria-controls");
    expect(selector).toContain("aria-describedby");
    expect(selector).toContain("aria-expanded");
    expect(selector).toContain("interestfor");
    expect(selector).toContain("anchor-name");
});

test("ChatGPT anchored relationships are detected before old-turn replacement", () => {
    expect(hasChatGptAnchoredMenuRelationship(rootWith([anchoredNode("turn")]))).toBe(true);
    expect(hasChatGptAnchoredMenuRelationship(rootWith([]))).toBe(false);
});

test("ChatGPT anchored relationship diagnostics split composer sidebar and turn scopes", () => {
    const composer = anchoredNode("composer");
    const sidebar = anchoredNode("sidebar");
    const turnAction = anchoredNode("turn");
    const documentRoot = rootWith([composer, sidebar, turnAction]) as Document;

    expect(inspectChatGptAnchoredMenuRelationships({ documentRoot, turns: [rootWith([turnAction]) as HTMLElement] })).toEqual({
        documentRelationshipCount: 3,
        composerRelationshipCount: 1,
        sidebarRelationshipCount: 1,
        turnRelationshipCount: 1,
    });
});

test("ChatGPT Native snapshot and containment guards preserve anchored controls", async () => {
    const fs = await import("node:fs/promises");
    const snapshotSource = await fs.readFile("src/content/native/chatgpt/ChatGptTextSnapshotRenderer.ts", "utf8");
    const containmentSource = await fs.readFile("src/content/native/chatgpt/ChatGptTurnContainmentController.ts", "utf8");

    expect(snapshotSource).toContain("hasChatGptAnchoredMenuRelationship(turn)");
    expect(containmentSource).toContain("hasChatGptAnchoredMenuRelationship(turn)");
});

function anchoredNode(scope: "composer" | "sidebar" | "turn"): HTMLElement {
    return {
        matches: (selector: string) => selector.includes("aria-controls"),
        closest: (selector: string) => {
            if (scope === "sidebar" && selector.includes("navigation")) return {};
            if (scope === "composer" && selector.includes("textarea")) return {};
            return null;
        },
        querySelector: () => null,
        querySelectorAll: () => [],
    } as unknown as HTMLElement;
}

function rootWith(nodes: readonly HTMLElement[]): ParentNode {
    return {
        querySelector: () => nodes[0] ?? null,
        querySelectorAll: () => nodes,
    } as unknown as ParentNode;
}
