#!/usr/bin/env node
/**
 * License: MIT. See LICENSE in the repository root.
 * Responsibility: install local changelog Git hooks for maintainers.
 * Boundary: writes only repository-local Git hook files.
 * ADR: docs/adr/engineering/tooling/pnpm-package-manager-authority.md.
 */
import { execFileSync } from "child_process";
import { chmodSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const managedPrePushMarker = "scripts/pre-push-changelog.mjs";

function git(args) {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function gitHookPath(name) {
    return resolve(root, git(["rev-parse", "--git-path", `hooks/${name}`]));
}

function writeExecutable(path, body) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, body, "utf8");
    chmodSync(path, 0o755);
}

const oldPrePushPath = gitHookPath("pre-push");
if (existsSync(oldPrePushPath) && readFileSync(oldPrePushPath, "utf8").includes(managedPrePushMarker)) {
    unlinkSync(oldPrePushPath);
    console.log(`Removed old pre-push changelog hook at ${oldPrePushPath.replaceAll("\\", "/")}`);
}

const postCommitPath = gitHookPath("post-commit");
writeExecutable(postCommitPath, `#!/bin/sh
# Installed by pnpm run hooks:install.
# Creates a changelog-only follow-up commit after normal commits when CHANGELOG.md changes.
exec node scripts/post-commit-changelog.mjs "$@"
`);

console.log(`Installed post-commit changelog hook at ${postCommitPath.replaceAll("\\", "/")}`);
