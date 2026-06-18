#!/usr/bin/env node
/**
 * Packages release artifacts into ./deploys/ (gitignored):
 *   - chrome-v<version>.zip       — built Chrome extension (upload to CWS)
 *   - firefox-v<version>.zip      — built Firefox extension (upload to AMO)
 *   - firefox-source-v<version>.zip — source archive for AMO review
 *
 * The source archive comes from `git archive HEAD`, so it contains exactly the
 * committed tree (no node_modules, no dist, no local untracked files).
 *
 * Usage:
 *   pnpm run package                # build chrome + firefox, then zip everything
 *   pnpm run package -- --skip-build  # zip whatever's already in dist/
 */
import { execSync } from "child_process";
import { existsSync, mkdirSync, rmSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DEPLOYS = resolve(ROOT, "deploys");

const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));
const VERSION = pkg.version;

const args = process.argv.slice(2);
const skipBuild = args.includes("--skip-build");

function run(cmd, cwd = ROOT) {
    console.log(`$ ${cmd}`);
    execSync(cmd, { cwd, stdio: "inherit" });
}

function zipDir(srcDir, outZip) {
    if (!existsSync(srcDir)) {
        console.error(`missing ${srcDir} — run a build first (or drop --skip-build)`);
        process.exit(1);
    }
    if (existsSync(outZip)) {
        rmSync(outZip);
    }
    // -r recurse, -q quiet, -X strip OS-specific extra attrs for reproducibility.
    // -x excludes stray archive files left in dist/ from older release runs.
    run(`zip -rqX "${outZip}" . -x "*.zip" "*.xpi" "*.crx"`, srcDir);
}

mkdirSync(DEPLOYS, { recursive: true });

if (!skipBuild) {
    run("pnpm run build:chrome");
    run("pnpm run build:firefox");
}

const chromeZip = resolve(DEPLOYS, `chrome-v${VERSION}.zip`);
const firefoxZip = resolve(DEPLOYS, `firefox-v${VERSION}.zip`);
const sourceZip = resolve(DEPLOYS, `firefox-source-v${VERSION}.zip`);

zipDir(resolve(ROOT, "dist", "chrome"), chromeZip);
zipDir(resolve(ROOT, "dist", "firefox"), firefoxZip);

if (existsSync(sourceZip)) {
    rmSync(sourceZip);
}
run(`git archive --format=zip --output="${sourceZip}" HEAD`);

console.log("\npackaged:");
console.log(`  ${chromeZip}`);
console.log(`  ${firefoxZip}`);
console.log(`  ${sourceZip}`);
