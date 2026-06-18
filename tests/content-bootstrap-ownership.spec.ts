import { test, expect } from "@playwright/test";
import { decideContentBootstrapOwnership } from "../src/content/ContentBootstrapOwnership";

test.describe("content bootstrap ownership", () => {
    test("acquires ownership when no content script marker exists", () => {
        expect(decideContentBootstrapOwnership({ bootstrapped: false, heartbeatAt: null }, 1_000, 5_000)).toEqual({
            acquire: true,
            reason: "empty",
        });
    });

    test("does not duplicate observers when a fresh owner is heartbeating", () => {
        expect(decideContentBootstrapOwnership({ bootstrapped: true, heartbeatAt: 9_500 }, 10_000, 5_000)).toEqual({
            acquire: false,
            reason: "fresh-owner",
        });
    });

    test("takes over stale ownership after extension reloads (#31)", () => {
        expect(decideContentBootstrapOwnership({ bootstrapped: true, heartbeatAt: 1_000 }, 10_000, 5_000)).toEqual({
            acquire: true,
            reason: "stale-owner",
        });
        expect(decideContentBootstrapOwnership({ bootstrapped: true, heartbeatAt: null }, 10_000, 5_000)).toEqual({
            acquire: true,
            reason: "stale-owner",
        });
    });
});
