#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readmePath = resolve(root, "README.md");
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const version = `v${packageJson.version}`;

const links = {
    Chrome: "[chromewebstore](https://chromewebstore.google.com/detail/ai-chat-speed-booster/fgefgkfmapdjjjdekejanelknedclfik)",
    Firefox: "[addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/ai-chat-speed-booster/?utm_source=addons.mozilla.org&utm_medium=referral&utm_content=search)",
};

const nextTable = [
    "| Browser | Version | Link |",
    "| --- | --- | --- |",
    `| Chrome | ${version} | ${links.Chrome} |`,
    `| Firefox | ${version} | ${links.Firefox} |`,
];

const readme = readFileSync(readmePath, "utf8");
const lines = readme.split(/\r?\n/);
const headingIndex = lines.findIndex((line) => line.trim() === "## Install via official browser extension store");
if (headingIndex === -1) {
    console.error("Could not find the official store install heading in README.md.");
    process.exit(1);
}

const tableStart = lines.findIndex((line, index) => index > headingIndex && line.trim().startsWith("| Browser |"));
if (tableStart === -1) {
    console.error("Could not find the official store install table in README.md.");
    process.exit(1);
}

let tableEnd = tableStart;
while (tableEnd < lines.length && lines[tableEnd].trim().startsWith("|")) {
    tableEnd += 1;
}

lines.splice(tableStart, tableEnd - tableStart, ...nextTable);
writeFileSync(readmePath, `${lines.join("\n")}\n`);
