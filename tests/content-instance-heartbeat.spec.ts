import { test, expect } from "@playwright/test";
import { decideContentBootstrapOwnership } from "../src/content/ContentBootstrapOwnership";
import { ContentBootstrapLease } from "../src/content/runtime/ContentBootstrapLease";
import { readContentInstanceDiagnostics } from "../src/content/runtime/ContentInstanceDiagnostics";

test("content ownership keeps a healthy current instance", () => {
    expect(decideContentBootstrapOwnership({ bootstrapped: true, heartbeatAt: 9_000 }, 10_000, 5_000)).toEqual({
        acquire: false,
        reason: "fresh-owner",
    });
});

test("content ownership recovers stale and missing beats conservatively", () => {
    expect(decideContentBootstrapOwnership({ bootstrapped: true, heartbeatAt: 1_000 }, 10_000, 5_000)).toEqual({
        acquire: true,
        reason: "stale-owner",
    });
    expect(decideContentBootstrapOwnership({ bootstrapped: true, heartbeatAt: null }, 10_000, 5_000)).toEqual({
        acquire: true,
        reason: "stale-owner",
    });
});

test("content lease writes ACSB-owned instance diagnostics", () => {
    let now = 20_000;
    const document = fakeDocument();
    const lease = new ContentBootstrapLease({ document, instanceId: "instance-a", now: () => now });

    expect(lease.acquire()).toEqual({ acquire: true, reason: "empty" });
    const diagnostics = readContentInstanceDiagnostics(document, lease.ownsBootstrap(), lease.getInstanceId(), now + 250);

    expect(diagnostics).toEqual({
        ownsBootstrap: true,
        instanceId: "instance-a",
        observedInstanceId: "instance-a",
        lastBeatAt: 20_000,
        beatAgeMs: 250,
    });

    lease.release();
});

test("content lease blocks duplicate healthy observers", () => {
    const document = fakeDocument();
    const first = new ContentBootstrapLease({ document, instanceId: "one", now: () => 30_000 });
    const second = new ContentBootstrapLease({ document, instanceId: "two", now: () => 30_100 });

    expect(first.acquire().acquire).toBe(true);
    expect(second.acquire()).toEqual({ acquire: false, reason: "fresh-owner" });

    first.release();
});

function fakeDocument(): Document {
    const attrs = new Map<string, string>();
    const root = {
        getAttribute: (name: string) => attrs.get(name) ?? null,
        setAttribute: (name: string, value: string) => attrs.set(name, value),
        removeAttribute: (name: string) => attrs.delete(name),
    };
    return { documentElement: root } as unknown as Document;
}
