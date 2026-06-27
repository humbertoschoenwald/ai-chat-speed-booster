import { test, expect } from "@playwright/test";
import { ChatGptActionToolbarHoverGate } from "../src/content/native/chatgpt/ChatGptActionToolbarHoverGate";
import type { NativeTurnRecord } from "../src/content/native/TurnRegistry";

test("ChatGPT action toolbar hover gate marks old unpinned turns only", () => {
    const gate = new ChatGptActionToolbarHoverGate();
    const old = recordFor("old");
    const pinned = recordFor("pinned", ["focused"]);
    const near = recordFor("near");

    const snapshot = gate.sync([old, pinned, near], 1);

    expect(snapshot).toMatchObject({ gatedTurnCount: 1, protectedTailSize: 1 });
    expect(old.element.getAttribute("data-acsb-native-toolbar-hover-gated")).toBe("true");
    expect(pinned.element.getAttribute("data-acsb-native-toolbar-hover-gated")).toBeNull();
    expect(near.element.getAttribute("data-acsb-native-toolbar-hover-gated")).toBeNull();
});

test("ChatGPT action toolbar hover gate can restore all gated turns", () => {
    const gate = new ChatGptActionToolbarHoverGate();
    const old = recordFor("old");
    gate.sync([old], 0);

    gate.restoreAll(rootFor([old.element]));

    expect(old.element.getAttribute("data-acsb-native-toolbar-hover-gated")).toBeNull();
});

test("ChatGPT action toolbar hover gate source restores before pointer or focus use", async () => {
    const source = await import("node:fs/promises").then((fs) =>
        fs.readFile("src/content/native/chatgpt/ChatGptActionToolbarHoverGate.ts", "utf8"),
    );

    expect(source).toContain("pointerover");
    expect(source).toContain("focusin");
    expect(source).toContain("pointerdown");
    expect(source).toContain("group-hover");
    expect(source).toContain("will-change:auto");
});

function recordFor(key: string, pinReasons: readonly string[] = []): NativeTurnRecord {
    return {
        key,
        element: gatedElement(),
        role: "assistant",
        hydrationState: "hydrated",
        measuredHeight: null,
        pinReasons: new Set(pinReasons as never[]),
        lastMeasuredAt: null,
    };
}

function gatedElement(): HTMLElement {
    const attrs = new Map<string, string>();
    return {
        setAttribute: (name: string, value: string) => attrs.set(name, value),
        removeAttribute: (name: string) => attrs.delete(name),
        getAttribute: (name: string) => attrs.get(name) ?? null,
    } as unknown as HTMLElement;
}

function rootFor(elements: readonly HTMLElement[]): ParentNode {
    return {
        querySelectorAll: () => elements,
    } as unknown as ParentNode;
}
