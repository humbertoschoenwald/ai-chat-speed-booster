#!/usr/bin/env node
/**
 * License: MIT. See LICENSE in the repository root.
 * Responsibility: install the local pre-push changelog hook for maintainers.
 * Boundary: writes only the repository-local Git hook file.
 * ADR: docs/adr/engineering/tooling/pnpm-package-manager-authority.md.
 */
import { execFileSync } from "child_process";
import { chmodSync, mkdirSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function git(args) {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

const hookPath = resolve(root, git(["rev-parse", "--git-path", "hooks/pre-push"]));
const hookBody = `#!/bin/sh
# Installed by pnpm run hooks:install.
# Refreshes CHANGELOG.md and creates a changelog-only commit when needed.
exec node scripts/pre-push-changelog.mjs "$@"
`;

mkdirSync(dirname(hookPath), { recursive: true });
writeFileSync(hookPath, hookBody, "utf8");
chmodSync(hookPath, 0o755);
console.log(`Installed pre-push hook at ${hookPath.replaceAll("\\", "/")}`);
