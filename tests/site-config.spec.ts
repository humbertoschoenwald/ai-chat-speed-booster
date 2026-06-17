import { test, expect } from "@playwright/test";
import { SITES } from "../src/shared/sites";

test("search ai site config is guarded by required query parameter (#23)", () => {
    const site = SITES.find((candidate) => candidate.id === "search-ai");

    expect(site).toBeDefined();
    expect(site?.requiredSearchParams).toEqual([
        { name: "udm", values: ["50"] },
    ]);
    expect(site?.fetchIntercept).toBeUndefined();
});
