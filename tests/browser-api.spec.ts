import { test, expect } from "@playwright/test";
import { isExtensionContextInvalidatedError } from "../src/shared/browser-api";

test("Chrome extension context invalidation errors are recognized", () => {
    expect(isExtensionContextInvalidatedError(new Error("Extension context invalidated."))).toBe(true);
    expect(isExtensionContextInvalidatedError("Extension context invalidated.")).toBe(true);
    expect(isExtensionContextInvalidatedError(new Error("Some other extension error"))).toBe(false);
});
