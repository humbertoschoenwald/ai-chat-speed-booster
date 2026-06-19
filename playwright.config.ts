import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests",
    timeout: 60_000,
    retries: 0,
    workers: 1, // extensions need sequential execution
    reporter: [["list"]],
    projects: [
        {
            name: "build",
            testMatch: ["validate-build.spec.ts", "native-models.spec.ts", "counter-models.spec.ts", "native-cache-models.spec.ts", "site-config.spec.ts", "native-adapters.spec.ts", "chatgpt-native-tuning.spec.ts", "native-execution-plan.spec.ts", "chatgpt-native-safety.spec.ts", "chatgpt-full-fidelity-layout.spec.ts", "chatgpt-layout-cache.spec.ts", "chatgpt-text-snapshot-cache.spec.ts", "chatgpt-delivery-timeout.spec.ts"],
        },
        {
            name: "extension-smoke",
            testMatch: "extension-smoke.spec.ts",
        },
        {
            name: "extension",
            testMatch: ["extension.spec.ts", "fetch-interceptor.spec.ts"],
        },
        {
            name: "safari",
            testMatch: "safari-compatibility.spec.ts",
        },
        {
            name: "integration",
            testMatch: "integration.spec.ts",
        },
    ],
});
