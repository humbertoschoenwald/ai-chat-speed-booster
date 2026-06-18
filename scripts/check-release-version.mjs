#!/usr/bin/env node
import { readFileSync } from "fs";

const tag = process.env.GITHUB_REF_TYPE === "tag" ? process.env.GITHUB_REF_NAME || "" : "";
if (!tag) {
    process.exit(0);
}

const version = tag.replace(/^v/, "");
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    console.error(`Invalid release tag: ${tag}`);
    process.exit(1);
}

const files = [
    "package.json",
    "browsers/chrome/manifest.json",
    "browsers/firefox/manifest.json",
    "browsers/edge/manifest.json",
    "browsers/safari/manifest.json",
];

const mismatches = [];
for (const file of files) {
    const actual = JSON.parse(readFileSync(file, "utf8")).version;
    if (actual !== version) {
        mismatches.push(`${file} has ${actual}`);
    }
}

if (mismatches.length > 0) {
    console.error(`Release tag ${tag} does not match repository version files.`);
    console.error(mismatches.join("\n"));
    console.error(`Run: pnpm run bump ${version}, commit the version bump, then create and push ${tag}.`);
    process.exit(1);
}
