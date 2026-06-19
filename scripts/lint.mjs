#!/usr/bin/env node
/**
 * License: MIT. See LICENSE in the repository root.
 * Responsibility: validate repository command-surface and package-manager invariants.
 * Boundary: this public lint script checks repository invariants and does not run ESLint.
 * ADR: docs/adr/engineering/tooling/pnpm-package-manager-authority.md.
 */
import { existsSync, readFileSync } from "fs";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const scripts = packageJson.scripts ?? {};
const requiredScripts = {
    build: "pnpm run clean && pnpm run build:chrome && pnpm run build:all",
    clean: "node scripts/clean.mjs",
    lint: "node scripts/lint.mjs",
    typecheck: "tsc --noEmit",
    validate: "node scripts/validate.mjs",
    "test:auth": "pnpm run build:chrome && node tests/auth-setup.mjs",
    "test:build": "pnpm run build:all && pnpm exec playwright test --project=build",
    "test:extension": "pnpm run build:chrome && pnpm exec playwright test --project=extension",
    "test:integration": "pnpm run build:chrome && pnpm exec playwright test --project=integration",
    "diagnose:scroll": "pnpm run build:chrome && node tests/scroll-diagnostic.mjs",
};

const failures = [];

if ("packageManager" in packageJson) {
    failures.push("package.json must not hardcode a packageManager version.");
}

if (!existsSync("pnpm-lock.yaml")) {
    failures.push("pnpm-lock.yaml is required.");
}

if (existsSync("package-lock.json")) {
    failures.push("package-lock.json must not coexist with pnpm-lock.yaml.");
}

if (existsSync("eslint.config.mjs")) {
    failures.push("ESLint config is not part of this public repository validation surface.");
}

for (const [name, expected] of Object.entries(requiredScripts)) {
    if (scripts[name] !== expected) {
        failures.push(`package.json script ${name} drifted.`);
    }
}

if (failures.length > 0) {
    for (const failure of failures) {
        console.error(`lint: ${failure}`);
    }
    process.exit(1);
}
