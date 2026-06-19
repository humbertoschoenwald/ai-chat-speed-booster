#!/usr/bin/env node
/**
 * License: MIT. See LICENSE in the repository root.
 * Responsibility: remove local generated build and diagnostic outputs.
 * Boundary: this script only removes repository-owned generated paths documented by the
 * pnpm package-manager authority ADR.
 * ADR: docs/adr/engineering/tooling/pnpm-package-manager-authority.md.
 */
import { existsSync, readdirSync, rmSync } from "fs";
import { join } from "path";

const PRESERVED_DIST_TARGET = "chrome";
const removeAllDist = process.argv.includes("--all") || process.env.CLEAN_ALL_DIST === "1";

const GENERATED_PATHS = [
    "test-results",
    "playwright-report",
    "scroll-diagnostic.log",
];

function cleanDist() {
    if (removeAllDist) {
        rmSync("dist", { recursive: true, force: true });
        return;
    }

    if (!existsSync("dist")) return;

    for (const entry of readdirSync("dist", { withFileTypes: true })) {
        if (entry.name === PRESERVED_DIST_TARGET) continue;
        rmSync(join("dist", entry.name), { recursive: true, force: true });
    }
}

cleanDist();

for (const generatedPath of GENERATED_PATHS) {
    rmSync(generatedPath, { recursive: true, force: true });
}
