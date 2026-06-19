/**
 * License: MIT. Provenance: AI Chat Speed Booster extension tests.
 * Responsibility: verify content bootstrap leasing owns heartbeat attributes.
 * Boundary: fake document element only; content-script bootstrapping is not exercised here.
 * ADR: docs/adr/architecture/lifecycle/content-bootstrap-ownership.md.
 */
import { test, expect } from "@playwright/test";
import { ContentBootstrapLease } from "../src/content/runtime/ContentBootstrapLease";

function fakeDocument(initial: Record<string, string> = {}): Document {
    const attrs = new Map(Object.entries(initial));
    const root = {
        getAttribute: (key: string) => attrs.get(key) ?? null,
        setAttribute: (key: string, value: string) => attrs.set(key, value),
        removeAttribute: (key: string) => attrs.delete(key),
    };
    return { documentElement: root } as unknown as Document;
}

test("bootstrap lease writes and releases owned heartbeat attributes", () => {
    const doc = fakeDocument();
    const lease = new ContentBootstrapLease({ document: doc, instanceId: "test-instance", now: () => 100 });

    expect(lease.acquire()).toEqual({ acquire: true, reason: "empty" });
    expect(doc.documentElement.getAttribute("data-acsb-content-bootstrapped")).toBe("true");
    expect(doc.documentElement.getAttribute("data-acsb-content-instance")).toBe("test-instance");
    expect(doc.documentElement.getAttribute("data-acsb-content-heartbeat-at")).toBe("100");

    lease.release();
    expect(doc.documentElement.getAttribute("data-acsb-content-bootstrapped")).toBeNull();
    expect(doc.documentElement.getAttribute("data-acsb-content-instance")).toBeNull();
    expect(doc.documentElement.getAttribute("data-acsb-content-heartbeat-at")).toBeNull();
});

test("bootstrap lease does not steal an active owner", () => {
    const doc = fakeDocument({
        "data-acsb-content-bootstrapped": "true",
        "data-acsb-content-heartbeat-at": "900",
        "data-acsb-content-instance": "other",
    });
    const lease = new ContentBootstrapLease({ document: doc, instanceId: "new", now: () => 1_000 });

    expect(lease.acquire()).toEqual({ acquire: false, reason: "fresh-owner" });
    expect(doc.documentElement.getAttribute("data-acsb-content-instance")).toBe("other");
});
