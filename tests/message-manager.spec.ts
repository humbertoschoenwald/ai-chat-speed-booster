import { test, expect } from "@playwright/test";
import { MessageManager } from "../src/content/MessageManager";
import { DEFAULT_CONFIG } from "../src/shared/constants";

const HIDE_CLASS = "acsb-hidden";
const PRECEDING = 0x02;
const FOLLOWING = 0x04;

class FakeClassList {
    private readonly values = new Set<string>();
    add(value: string): void { this.values.add(value); }
    remove(value: string): void { this.values.delete(value); }
    contains(value: string): boolean { return this.values.has(value); }
}

class FakeTurn {
    readonly classList = new FakeClassList();
    private readonly attributes = new Map<string, string>();
    constructor(readonly domIndex: number, private readonly containsChatInput = false) {
        this.attributes.set("data-turn-id-container", `turn-${domIndex}`);
    }
    getAttribute(name: string): string | null { return this.attributes.get(name) ?? null; }
    setAttribute(name: string, value: string): void { this.attributes.set(name, value); }
    removeAttribute(name: string): void { this.attributes.delete(name); }
    matches(selector: string): boolean { return this.containsChatInput && selector.includes("textarea"); }
    closest(selector: string): FakeTurn | null { return this.containsChatInput && selector.includes("textarea") ? this : null; }
    querySelector(selector: string): FakeTurn | null { return this.containsChatInput && selector.includes("textarea") ? this : null; }
    compareDocumentPosition(other: FakeTurn): number {
        if (this.domIndex < other.domIndex) return FOLLOWING;
        if (this.domIndex > other.domIndex) return PRECEDING;
        return 0;
    }
}

function asElement(turn: FakeTurn): HTMLElement { return turn as unknown as HTMLElement; }

function setupDocument(): () => void {
    const originalDocument = globalThis.document;
    Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: {
            createElement: () => ({ textContent: "" }),
            head: { appendChild: () => undefined },
            documentElement: { appendChild: () => undefined },
        },
    });
    return () => Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: originalDocument,
    });
}

function createStableManager(): MessageManager {
    const manager = new MessageManager();
    manager.updateConfig({
        ...DEFAULT_CONFIG,
        performanceMode: "legacy",
        visibleMessageLimit: 3,
        loadMoreBatchSize: 3,
        hideOldMessages: true,
    });
    manager.setMessageUnitSize(2);
    return manager;
}

function turns(start: number, end: number): FakeTurn[] {
    return Array.from({ length: end - start + 1 }, (_, index) => new FakeTurn(start + index));
}

function expectHidden(turn: FakeTurn): void {
    expect(turn.classList.contains(HIDE_CLASS)).toBe(true);
}

function expectVisible(turn: FakeTurn): void {
    expect(turn.classList.contains(HIDE_CLASS)).toBe(false);
}

test("Stable Mode hides older turns that mount above the current DOM window", () => {
    const restoreDocument = setupDocument();
    try {
        const manager = createStableManager();
        const currentWindow = turns(7, 12);
        const olderWindow = turns(1, 6);

        manager.initialise(currentWindow.map(asElement));
        manager.addMessages(olderWindow.map(asElement));

        olderWindow.forEach(expectHidden);
        currentWindow.forEach(expectVisible);
        expect(manager.getStatus()).toMatchObject({
            totalMessages: 6,
            visibleMessages: 3,
            hiddenMessages: 3,
        });
    } finally {
        restoreDocument();
    }
});

test("Stable Mode keeps an unmatched newest turn visible", () => {
    const restoreDocument = setupDocument();
    try {
        const manager = createStableManager();
        const initialWindow = turns(1, 6);
        const newestTurn = new FakeTurn(7);

        manager.initialise(initialWindow.map(asElement));
        manager.addMessages([asElement(newestTurn)]);

        initialWindow.forEach(expectVisible);
        expectVisible(newestTurn);

    } finally {
        restoreDocument();
    }
});

test("Stable Mode counts hidden elements directly across partial logical groups", () => {
    const restoreDocument = setupDocument();
    try {
        const manager = createStableManager();
        const initialWindow = turns(1, 7);

        manager.initialise(initialWindow.map(asElement));

        expect(manager.getStatus()).toMatchObject({
            totalMessages: 4,
            visibleMessages: 4,
            hiddenMessages: 0,
        });

        manager.updateConfig({
            ...DEFAULT_CONFIG,
            performanceMode: "legacy",
            visibleMessageLimit: 2,
            loadMoreBatchSize: 3,
            hideOldMessages: true,
        });
        manager.rebalanceVisibility();

        expect(manager.getStatus()).toMatchObject({
            totalMessages: 4,
            visibleMessages: 2,
            hiddenMessages: 2,
        });
    } finally {
        restoreDocument();
    }
});

test("Stable Mode never hides chat input scopes", () => {
    const restoreDocument = setupDocument();
    try {
        const manager = createStableManager();
        const oldTurns = turns(1, 6);
        const inputScope = new FakeTurn(0, true);

        manager.initialise([...oldTurns, inputScope].map(asElement));

        oldTurns.slice(0, 2).forEach(expectHidden);
        expectVisible(inputScope);
    } finally {
        restoreDocument();
    }
});
