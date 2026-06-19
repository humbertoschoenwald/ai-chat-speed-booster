#!/usr/bin/env node
/**
 * License: MIT. See LICENSE in the repository root.
 * Responsibility: refresh CHANGELOG.md before a push and create a changelog-only commit when needed.
 * Boundary: only CHANGELOG.md may be changed or committed by this script.
 * ADR: docs/adr/engineering/tooling/pnpm-package-manager-authority.md.
 */
import { execFileSync } from "child_process";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const changelogPath = "CHANGELOG.md";
const changelogCommitSubject = "chore(changelog): update changelog [skip changelog]";

function git(args, options = {}) {
    const result = execFileSync("git", args, {
        cwd: root,
        encoding: "utf8",
        stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
    });
    return typeof result === "string" ? result.trim() : "";
}

function runNodeScript(scriptPath) {
    execFileSync(process.execPath, [scriptPath], {
        cwd: root,
        stdio: "inherit",
    });
}

function statusLines() {
    const raw = git(["status", "--porcelain"]);
    return raw ? raw.split("\n").filter(Boolean) : [];
}

function isChangelogStatus(line) {
    return line.endsWith(` ${changelogPath}`) || line.endsWith(` ${changelogPath.replaceAll("/", "\\")}`);
}

function fail(message, lines = []) {
    console.error(`pre-push changelog: ${message}`);
    for (const line of lines) {
        console.error(`  ${line}`);
    }
    process.exit(1);
}

const initialStatus = statusLines();
const unrelatedInitialStatus = initialStatus.filter((line) => !isChangelogStatus(line));
if (unrelatedInitialStatus.length > 0) {
    fail("commit or stash non-changelog changes before pushing.", unrelatedInitialStatus);
}

runNodeScript("scripts/generate-changelog.mjs");

const finalStatus = statusLines();
const unrelatedFinalStatus = finalStatus.filter((line) => !isChangelogStatus(line));
if (unrelatedFinalStatus.length > 0) {
    fail("changelog generation produced unexpected non-changelog changes.", unrelatedFinalStatus);
}

if (!finalStatus.some(isChangelogStatus)) {
    console.log("pre-push changelog: CHANGELOG.md is already up to date.");
    process.exit(0);
}

git(["add", changelogPath], { stdio: "inherit" });
git(["commit", "-m", changelogCommitSubject], { stdio: "inherit" });
console.error("pre-push changelog: created a changelog commit. Re-run git push so the new commit is included.");
process.exit(1);
