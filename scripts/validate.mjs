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

const STEPS = [
    [pnpm, ["run", "build"]],
    [pnpm, ["run", "typecheck"]],
    [pnpm, ["run", "lint"]],
    [pnpm, playwrightInstallArgs],
    [pnpm, ["run", "test:auth"]],
    [pnpm, ["run", "test:build"]],
    [pnpm, ["run", "test:extension"]],
    [pnpm, ["run", "test:integration"]],
    [pnpm, ["run", "diagnose:scroll"]],
];

for (const [command, args] of STEPS) {
    run(command, args);
}
