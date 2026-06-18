/**
 * License: MIT. Provenance: AI Chat Speed Booster extension tests.
 * Responsibility: verify Fast Mode response rewriting stays host-compatible.
 * Boundary: browser-level regression tests only; no live ChatGPT account or network dependency.
 * ADR: docs/adr/architecture/message-management/chatgpt-fetch-trim-reference-preservation.md.
 */
import { test, expect } from "./extension-fixture";

function chatGptNode(role: "user" | "assistant", parent: string, child?: string) {
    return {
        message: {
            author: { role },
            content: { content_type: "text", parts: [`${role} message`] },
        },
        parent,
        children: child ? [child] : [],
    };
}

test("ChatGPT Fast Mode keeps original mapping nodes addressable after trimming", async ({ page }) => {
    const mapping = {
        root: { message: null, parent: null, children: ["n1"] },
        n1: chatGptNode("user", "root", "n2"),
        n2: chatGptNode("assistant", "n1", "n3"),
        n3: chatGptNode("user", "n2", "n4"),
        n4: chatGptNode("assistant", "n3", "n5"),
        n5: chatGptNode("user", "n4", "n6"),
        n6: chatGptNode("assistant", "n5"),
    };

    await page.route("https://chatgpt.com/c/mock-fast-mode", (route) =>
        route.fulfill({ contentType: "text/html", body: "<main>mock ChatGPT</main>" }),
    );
    await page.route("https://chatgpt.com/backend-api/conversation/mock-fast-mode", (route) =>
        route.fulfill({
            contentType: "application/json",
            body: JSON.stringify({ mapping, current_node: "n6", root: "root" }),
        }),
    );

    await page.goto("https://chatgpt.com/c/mock-fast-mode", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean((window as unknown as Record<string, unknown>).__ACSB_FETCH_PATCHED__));
    await page.evaluate(() => {
        localStorage.setItem("acsb_bridge_config", JSON.stringify({
            enabled: true,
            fetchInterceptEnabled: true,
            visibleMessageLimit: 1,
            loadMoreBatchSize: 0,
        }));
    });

    const trimmed = await page.evaluate(async () => {
        const response = await fetch("/backend-api/conversation/mock-fast-mode");
        return response.json();
    }) as { mapping: Record<string, { parent: string | null; children: string[] }> };

    expect(Object.keys(trimmed.mapping).sort()).toEqual(Object.keys(mapping).sort());
    expect(trimmed.mapping.root.children).toEqual(["n5"]);
    expect(trimmed.mapping.n5.parent).toBe("root");
    expect(trimmed.mapping.n5.children).toEqual(["n6"]);
    expect(trimmed.mapping.n6.parent).toBe("n5");
});
