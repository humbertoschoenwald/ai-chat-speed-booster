#!/usr/bin/env node
/**
 * License: MIT. See LICENSE in the repository root.
 * Responsibility: remove local generated build and diagnostic outputs.
 * Boundary: this script only removes repository-owned generated paths documented by the
 * pnpm package-manager authority ADR.
 * ADR: docs/adr/engineering/tooling/pnpm-package-manager-authority.md.
 */
import { rmSync } from "fs";

const GENERATED_PATHS = [
    "dist",
    "test-results",
    "playwright-report",
    "scroll-diagnostic.log",
];

for (const generatedPath of GENERATED_PATHS) {
    rmSync(generatedPath, { recursive: true, force: true });
}
