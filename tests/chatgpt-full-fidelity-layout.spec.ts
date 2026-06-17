import { test, expect } from "@playwright/test";
import {
    createChatGptFullFidelityLayoutPlan,
    findChatGptTurnAtOffset,
} from "../src/content/native/chatgpt/ChatGptFullFidelityLayoutPlan";

test.describe("ChatGPT full-fidelity layout plan", () => {
    test("calculates start-to-end scroll geometry without hiding turns", () => {
        const plan = createChatGptFullFidelityLayoutPlan([
            { key: "turn-1", heightPx: 100 },
            { key: "turn-2", heightPx: 250 },
            { key: "turn-3", heightPx: 150 },
        ], {
            scrollTopPx: 120,
            viewportHeightPx: 200,
            overscanPx: 50,
        });

        expect(plan.totalHeightPx).toBe(500);
        expect(plan.records).toEqual([
            { key: "turn-1", topPx: 0, heightPx: 100, bottomPx: 100, pinned: false },
            { key: "turn-2", topPx: 100, heightPx: 250, bottomPx: 350, pinned: false },
            { key: "turn-3", topPx: 350, heightPx: 150, bottomPx: 500, pinned: false },
        ]);
        expect(plan.visibleKeys).toEqual(["turn-1", "turn-2", "turn-3"]);
    });

    test("keeps pinned turns visible while marking distant unpinned turns cacheable", () => {
        const plan = createChatGptFullFidelityLayoutPlan([
            { key: "intro", heightPx: 200 },
            { key: "tool-running", heightPx: 400, pinned: true },
            { key: "middle", heightPx: 300 },
            { key: "latest", heightPx: 250 },
        ], {
            scrollTopPx: 1000,
            viewportHeightPx: 200,
            overscanPx: 100,
        });

        expect(plan.visibleKeys).toEqual(["tool-running", "latest"]);
        expect(plan.cacheableKeys).toEqual(["intro", "middle"]);
    });

    test("finds the turn that owns a scroll offset", () => {
        const plan = createChatGptFullFidelityLayoutPlan([
            { key: "a", heightPx: 100 },
            { key: "b", heightPx: 100 },
        ], {
            scrollTopPx: 0,
            viewportHeightPx: 100,
            overscanPx: 0,
        });

        expect(findChatGptTurnAtOffset(plan, 0)?.key).toBe("a");
        expect(findChatGptTurnAtOffset(plan, 150)?.key).toBe("b");
        expect(findChatGptTurnAtOffset(plan, 250)).toBeNull();
    });
});
