#!/usr/bin/env node
/**
 * Bumps the extension version across package.json + every browser manifest,
 * commits the change with "fix: update version to <version>", and creates a
 * matching git tag (v<version>).
 *
 * Usage:
 *   pnpm run bump 1.4.5             # bump, commit, and tag
 *   pnpm run bump 1.4.5 -- --no-tag # bump and commit but don't tag
 *   pnpm run bump 1.4.5 -- --dry    # show what would change, do nothing
 *
 * Does NOT push — review with `git log` / `git show` first, then push manually.
 */
import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith("--")));
const noTag = flags.has("--no-tag");
const dry = flags.has("--dry");

const newVersion = args[0];
if (!newVersion) {
    console.error("usage: pnpm run bump <version>  (e.g. 1.4.5)");
    process.exit(1);
}
if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(newVersion)) {
    console.error(`invalid version: "${newVersion}" — expected semver like 1.4.5 or 1.4.5-beta.1`);
    process.exit(1);
}

const TARGETS = [
    "package.json",
    "browsers/chrome/manifest.json",
    "browsers/edge/manifest.json",
    "browsers/firefox/manifest.json",
    "browsers/safari/manifest.json",
];

function run(cmd) {
    return execSync(cmd, { cwd: ROOT, encoding: "utf8" }).trim();
}

const tagName = `v${newVersion}`;
const existingTags = run("git tag --list").split("\n");
if (existingTags.includes(tagName)) {
    console.error(`tag ${tagName} already exists — pick another version or delete the tag first`);
    process.exit(1);
}

const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));
const currentVersion = pkg.version;
if (currentVersion === newVersion) {
    console.error(`already at ${newVersion} — nothing to do`);
    process.exit(1);
}

console.log(`bumping ${currentVersion} -> ${newVersion}\n`);

for (const file of TARGETS) {
    const path = resolve(ROOT, file);
    const original = readFileSync(path, "utf8");
    // Match the first "version": "X.Y.Z" so we only touch the manifest/pkg root,
    // never something nested like a dependency version constraint.
    const updated = original.replace(
        /"version"\s*:\s*"[^"]+"/,
        `"version": "${newVersion}"`,
    );
    if (updated === original) {
        console.error(`couldn't find a "version" field in ${file}`);
        process.exit(1);
    }
    if (!dry) {
        writeFileSync(path, updated);
    }
    console.log(`  ${file}`);
}

if (dry) {
    console.log("\n--dry: no files written, no commit, no tag.");
    process.exit(0);
}

run(`git add -- ${TARGETS.map((t) => `"${t}"`).join(" ")}`);
run(`git commit -m "fix: update version to ${newVersion}"`);
console.log(`\ncommitted: fix: update version to ${newVersion}`);

if (!noTag) {
    run(`git tag ${tagName}`);
    console.log(`tagged:    ${tagName}`);
} else {
    console.log("skipped tag (--no-tag).");
}

console.log("\nnext: review with `git log -1` / `git show`, then `git push && git push --tags`.");
