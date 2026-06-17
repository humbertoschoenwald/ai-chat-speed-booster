#!/usr/bin/env node
import { execFileSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "CHANGELOG.md");
const headings = new Map([["feat", "Features"], ["fix", "Fixes"], ["perf", "Performance"], ["test", "Tests"], ["ci", "CI"], ["build", "Build"], ["docs", "Docs"], ["refactor", "Refactors"], ["chore", "Maintenance"]]);
const fallbackReleaseRefs = [
    ["v1.0.0", "4a6ea5d"],
    ["v1.1.0", "8a1b18e"],
    ["v1.1.1", "32924ed"],
    ["v1.1.2", "bc4206b"],
    ["v1.1.3", "a104019"],
    ["v1.1.4", "09081f7"],
    ["v1.1.5", "b22bf6f"],
    ["v1.1.6", "9f550a2"],
    ["v1.1.7", "3f4f1a1"],
    ["v1.1.8", "3dcb0b3"],
    ["v1.1.9", "ae9d1c1"],
    ["v1.2.0", "0c55db8"],
    ["v1.3.0", "f129c3c"],
    ["v1.3.1", "0839a8f"],
    ["v1.3.2", "fa79b61"],
    ["v1.3.3", "86cf9a9"],
    ["v1.3.4", "bfea54d"],
    ["v1.3.6", "5523e7b"],
    ["v1.4.0", "fc0c261"],
    ["v1.4.1", "a40b618"],
    ["v1.4.3", "0ebe872"],
    ["v1.4.4", "ad9442d"],
    ["v1.4.5", "b596bbf"],
];

function git(args) {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function safeGit(args) {
    try {
        return git(args);
    } catch {
        return "";
    }
}

function exists(ref) {
    return safeGit(["rev-parse", "--verify", `${ref}^{commit}`]) !== "";
}

function log(range) {
    const raw = safeGit(["log", "--reverse", range, "--pretty=format:%H%x1f%an%x1f%ae%x1f%s"]);
    return raw ? raw.split("\n").map((row) => {
        const [hash, author, email, subject] = row.split("\x1f");
        return { hash: hash.slice(0, 7), author, email, subject };
    }) : [];
}

function tags() {
    const raw = safeGit(["tag", "--list", "v[0-9]*.[0-9]*.[0-9]*", "--sort=v:refname"]);
    return raw ? raw.split("\n").filter(Boolean) : [];
}

function releaseRefs() {
    const localTags = tags().filter(exists).map((tag) => [tag, tag]);
    if (localTags.length > 0) return localTags;
    return fallbackReleaseRefs.filter(([, ref]) => exists(ref));
}

function parsed(subject) {
    const match = subject.match(/^([a-z]+)(?:\(([^)]+)\))?(!)?:\s+(.+)$/);
    if (!match) return null;
    return { type: match[1], scope: match[2], breaking: Boolean(match[3]), text: match[4] };
}

const authorProfiles = new Map([
    ["Humberto Schoenwald", { name: "Humberto Schoenwald", handle: "humbertoschoenwald" }],
    ["Noah Thiering", { name: "Noah Thiering", handle: "Noah4ever" }],
    ["RyanHolmanClark", { name: "RyanHolmanClark", handle: "RyanHolmanClark" }],
    ["infpdev", { name: "infpdev", handle: "infpdev" }],
    ["dev", { name: "infpdev", handle: "infpdev" }],
]);

function authorProfile(commit) {
    if (authorProfiles.has(commit.author)) return authorProfiles.get(commit.author);
    const emailMatch = commit.email?.match(/^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/);
    if (emailMatch) return { name: emailMatch[1], handle: emailMatch[1] };
    if (/^[A-Za-z0-9-]+$/.test(commit.author || "")) return { name: commit.author, handle: commit.author };
    return { name: commit.author || "", handle: "" };
}

function byline(commit) {
    const profile = authorProfile(commit);
    if (!profile.name) return "";
    if (profile.handle) {
        return ` ([${profile.name} (@${profile.handle})](https://github.com/${profile.handle}))`;
    }
    return ` (${profile.name})`;
}

function line(commit) {
    const p = parsed(commit.subject);
    if (!p) return ["Other", `- ${commit.subject}${byline(commit)} (${commit.hash})`];
    const scope = p.scope ? `**${p.scope}:** ` : "";
    const breaking = p.breaking ? " **BREAKING**" : "";
    return [headings.get(p.type) || "Other", `- ${scope}${p.text}${breaking}${byline(commit)} (${commit.hash})`];
}

function renderCommits(commits) {
    if (commits.length === 0) return "- No changes.\n";
    const groups = new Map();
    for (const commit of commits.slice().reverse()) {
        const [group, text] = line(commit);
        if (!groups.has(group)) groups.set(group, []);
        groups.get(group).push(text);
    }
    return [...headings.values(), "Other"].filter((group) => groups.has(group)).map((group) => `### ${group}\n\n${groups.get(group).join("\n")}\n`).join("\n");
}

function section(title, commits, note = "") {
    return `## ${title}\n\n${renderCommits(commits)}${note}`;
}

function sectionsFromReleaseRefs(refs) {
    const parts = [section("Unreleased", log(`${refs.at(-1)[1]}..HEAD`))];
    for (let index = refs.length - 1; index >= 0; index -= 1) {
        const [tag, ref] = refs[index];
        const previous = refs[index - 1]?.[1] || "";
        const range = previous ? `${previous}..${ref}` : ref;
        parts.push(section(tag, log(range)));
    }
    return parts;
}

function versionFrom(subject) {
    const lower = subject.toLowerCase();
    if (!lower.includes("version") && !lower.includes("bump")) return "";
    const found = subject.match(/1\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?/);
    return found ? `v${found[0]}` : "";
}

function newer(version, latest) {
    const left = version.replace(/^v/, "").split(".").map(Number);
    const right = latest.replace(/^v/, "").split(".").map(Number);
    for (let i = 0; i < 3; i += 1) {
        if ((left[i] || 0) !== (right[i] || 0)) return (left[i] || 0) > (right[i] || 0);
    }
    return false;
}

function inferredSections() {
    const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
    if (Number(String(pkg.version).split(".")[0]) >= 2) throw new Error("Version tags are required from v2.0.0 onward.");
    const released = [];
    const seen = new Set();
    let latest = "v0.0.0";
    let bucket = [];
    for (const commit of log("HEAD")) {
        bucket.push(commit);
        const version = versionFrom(commit.subject);
        if (!version || seen.has(version) || !newer(version, latest)) continue;
        released.push([version, bucket]);
        seen.add(version);
        latest = version;
        bucket = [];
    }
    return [section("Unreleased", bucket), ...released.reverse().map(([version, commits]) => section(version, commits, "_Inferred from a 1.x version bump commit. Prefer real tags for future releases._\n"))];
}

const refs = releaseRefs();
const sections = refs.length > 0 ? sectionsFromReleaseRefs(refs) : inferredSections();
writeFileSync(out, `# Changelog\n\n${sections.join("\n")}`);
