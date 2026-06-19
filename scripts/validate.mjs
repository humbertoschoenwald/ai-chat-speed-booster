#!/usr/bin/env node
/**
 * License: MIT. See LICENSE in the repository root.
 * Responsibility: run the public package validation sequence.
 * Boundary: this script invokes repository scripts only and leaves stricter operator checks to
 * external validation wrappers.
 * ADR: docs/adr/engineering/tooling/pnpm-package-manager-authority.md.
 */
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const validationStartedAt = performance.now();

function quoteWindowsCommandPart(part) {
    if (/^[A-Za-z0-9_./:=@-]+$/.test(part)) {
        return part;
    }
    return `"${part.replace(/(["^&|<>])/g, "^$1")}"`;
}

function tail(text, maxChars = 24_000) {
    if (!text || text.length <= maxChars) {
        return text ?? "";
    }
    return `[output truncated to last ${maxChars} characters]\n${text.slice(-maxChars)}`;
}

function formatDuration(ms) {
    return `${(ms / 1000).toFixed(1)}s`;
}

function isChromiumInstalled() {
    try {
        const { chromium } = require("@playwright/test");
        return existsSync(chromium.executablePath());
    } catch {
        return false;
    }
}

function childEnv() {
    const env = {
        ...process.env,
        NO_COLOR: "1",
    };
    delete env.FORCE_COLOR;
    return env;
}

function run(command, args) {
    const startedAt = performance.now();
    const displayCommand = [command, ...args].join(" ");
    console.log(`\nRUN ${displayCommand}`);
    const spawnCommand = process.platform === "win32"
        ? process.env.ComSpec ?? "cmd.exe"
        : command;
    const spawnArgs = process.platform === "win32"
        ? ["/d", "/s", "/c", [command, ...args].map(quoteWindowsCommandPart).join(" ")]
        : args;
    const result = spawnSync(spawnCommand, spawnArgs, {
        encoding: "utf8",
        env: childEnv(),
        maxBuffer: 64 * 1024 * 1024,
        shell: false,
        stdio: ["inherit", "pipe", "pipe"],
    });

    const stdout = result.stdout ?? "";
    const stderr = result.stderr ?? "";

    if (process.env.VALIDATE_VERBOSE === "1") {
        if (stdout) {
            process.stdout.write(stdout);
        }
        if (stderr) {
            process.stderr.write(stderr);
        }
    }

    if (result.error) {
        console.error(`ERROR validation step failed before exit: ${displayCommand}`);
        console.error(result.error.message);
        process.exit(1);
    }

    if (result.status !== 0) {
        console.error(`ERROR validation step failed: ${displayCommand}`);
        console.error(`exit code: ${result.status ?? "unknown"}${result.signal ? ` signal: ${result.signal}` : ""}`);
        if (stdout) {
            console.error("\n--- stdout ---");
            console.error(tail(stdout));
        }
        if (stderr) {
            console.error("\n--- stderr ---");
            console.error(tail(stderr));
        }
        process.exit(result.status ?? 1);
    }

    console.log(`OK ${displayCommand} (${formatDuration(performance.now() - startedAt)})`);
}

const playwrightInstallArgs =
    process.env.CI === "true" && process.platform === "linux"
        ? ["exec", "playwright", "install", "--with-deps", "chromium"]
        : ["exec", "playwright", "install", "chromium"];
const pnpm = "pnpm";
const includeBrowserSmoke = process.env.VALIDATE_BROWSER === "1" || process.env.VALIDATE_FULL === "1";
const includeFullExtension = process.env.VALIDATE_FULL === "1";
const includeLiveIntegration = process.env.VALIDATE_LIVE_INTEGRATION === "1" || process.env.VALIDATE_FULL === "1";
const buildScript = process.env.VALIDATE_ALL_BROWSERS === "1" || process.env.VALIDATE_FULL === "1"
    ? "build:all"
    : "build:chrome";
const buildTestWorkers = process.env.VALIDATE_BUILD_TEST_WORKERS
    ?? (process.platform === "win32" ? "2" : "50%");
const browserTestWorkers = process.env.VALIDATE_BROWSER_TEST_WORKERS
    ?? (includeFullExtension || includeLiveIntegration ? "3" : "1");
const browserProjects = [
    ...(includeBrowserSmoke ? ["extension-smoke"] : []),
    ...(includeFullExtension ? ["extension"] : []),
    ...(includeLiveIntegration ? ["integration"] : []),
];
const shouldInstallChromium = process.env.CI === "true" && process.platform === "linux"
    ? includeBrowserSmoke || includeFullExtension || includeLiveIntegration
    : browserProjects.length > 0 && !isChromiumInstalled();

const STEPS = [
    [pnpm, ["run", "clean"]],
    [pnpm, ["run", buildScript]],
    [pnpm, ["run", "typecheck"]],
    [pnpm, ["run", "lint"]],
    [pnpm, ["exec", "playwright", "test", "--project=build", "--workers", buildTestWorkers, "--reporter=dot"]],
    ...(shouldInstallChromium ? [[pnpm, playwrightInstallArgs]] : []),
    ...(includeBrowserSmoke ? [["node", ["tests/auth-setup.mjs"]]] : []),
    ...(browserProjects.length > 0
        ? [[pnpm, [
            "exec",
            "playwright",
            "test",
            ...browserProjects.map((project) => `--project=${project}`),
            "--workers",
            browserTestWorkers,
            "--reporter=dot",
        ]]]
        : []),
    ["node", ["tests/scroll-diagnostic.mjs"]],
];

if (buildScript !== "build:all") {
    console.log("Building Chrome only. Set VALIDATE_ALL_BROWSERS=1 to build every browser target.");
}

if (!includeBrowserSmoke) {
    console.log("Skipping browser smoke tests. Set VALIDATE_BROWSER=1 to include them.");
}

if (!includeFullExtension) {
    console.log("Skipping full extension regression tests. Set VALIDATE_FULL=1 to include them.");
}

if (!includeLiveIntegration) {
    console.log("Skipping live integration tests. Set VALIDATE_LIVE_INTEGRATION=1 to include them.");
}

for (const [command, args] of STEPS) {
    run(command, args);
}

console.log(`\nValidation complete in ${formatDuration(performance.now() - validationStartedAt)}.`);
