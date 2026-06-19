#!/usr/bin/env node
/**
 * License: MIT. See LICENSE in the repository root.
 * Responsibility: run the public package validation sequence.
 * Boundary: this script invokes repository scripts only and leaves stricter operator checks to
 * external validation wrappers.
 * ADR: docs/adr/engineering/tooling/pnpm-package-manager-authority.md.
 */
import { spawnSync } from "child_process";

function quoteWindowsCommandPart(part) {
    if (/^[A-Za-z0-9_./:=@-]+$/.test(part)) {
        return part;
    }
    return `"${part.replace(/(["^&|<>])/g, "^$1")}"`;
}

function run(command, args) {
    console.log(`\n$ ${[command, ...args].join(" ")}`);
    const spawnCommand = process.platform === "win32"
        ? process.env.ComSpec ?? "cmd.exe"
        : command;
    const spawnArgs = process.platform === "win32"
        ? ["/d", "/s", "/c", [command, ...args].map(quoteWindowsCommandPart).join(" ")]
        : args;
    const result = spawnSync(spawnCommand, spawnArgs, {
        stdio: "inherit",
        shell: false,
    });

    if (result.error) {
        console.error(result.error.message);
        process.exit(1);
    }

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
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

const STEPS = [
    [pnpm, ["run", "clean"]],
    [pnpm, ["run", buildScript]],
    [pnpm, ["run", "typecheck"]],
    [pnpm, ["run", "lint"]],
    [pnpm, ["exec", "playwright", "test", "--project=build"]],
    ...(includeBrowserSmoke ? [[pnpm, playwrightInstallArgs], ["node", ["tests/auth-setup.mjs"]], [pnpm, ["exec", "playwright", "test", "--project=extension-smoke"]]] : []),
    ...(includeFullExtension ? [[pnpm, ["exec", "playwright", "test", "--project=extension"]]] : []),
    ...(includeLiveIntegration ? [[pnpm, ["exec", "playwright", "test", "--project=integration"]]] : []),
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
