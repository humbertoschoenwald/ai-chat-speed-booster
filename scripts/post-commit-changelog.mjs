#!/usr/bin/env node
/**
 * License: MIT. See LICENSE in the repository root.
 * Responsibility: refresh CHANGELOG.md after normal commits and add a changelog-only follow-up commit.
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

function log(message, lines = []) {
    console.log(`post-commit changelog: ${message}`);
    for (const line of lines) {
        console.log(`  ${line}`);
    }
}

if (process.env.ACSB_SKIP_CHANGELOG_HOOK === "1") {
    process.exit(0);
}

const subject = git(["log", "-1", "--pretty=%s"]);
if (/^chore\(changelog\):/i.test(subject) || /\[skip changelog\]/i.test(subject)) {
    process.exit(0);
}

const initialStatus = statusLines();
const unrelatedInitialStatus = initialStatus.filter((line) => !isChangelogStatus(line));
if (unrelatedInitialStatus.length > 0) {
    log("skipping because non-changelog files are still dirty.", unrelatedInitialStatus);
    process.exit(0);
}

runNodeScript("scripts/generate-changelog.mjs");

const finalStatus = statusLines();
const unrelatedFinalStatus = finalStatus.filter((line) => !isChangelogStatus(line));
if (unrelatedFinalStatus.length > 0) {
    log("skipping commit because changelog generation saw unexpected changes.", unrelatedFinalStatus);
    process.exit(0);
}

if (!finalStatus.some(isChangelogStatus)) {
    log("CHANGELOG.md is already up to date.");
    process.exit(0);
}

git(["add", changelogPath], { stdio: "inherit" });
execFileSync("git", ["commit", "-m", changelogCommitSubject], {
    cwd: root,
    env: {
        ...process.env,
        ACSB_SKIP_CHANGELOG_HOOK: "1",
    },
    stdio: "inherit",
});
log("created changelog follow-up commit.");
