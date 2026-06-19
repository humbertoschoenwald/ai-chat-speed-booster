#!/usr/bin/env node
import { execFileSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "CHANGELOG.md");
const contributorsPath = resolve(root, "contributors.json");
const repoSlug = process.env.GITHUB_REPOSITORY || repositorySlugFromRemote();
const repoUrl = repoSlug ? `https://github.com/${repoSlug}` : "";
const headings = new Map([["feat", "Features"], ["fix", "Fixes"], ["perf", "Performance"], ["test", "Tests"], ["ci", "CI"], ["build", "Build"], ["docs", "Docs"], ["refactor", "Refactors"], ["chore", "Maintenance"]]);
const ignoredSubjectPatterns = [
  /^(?:docs(?:\([^)]+\))?:\s*)?update readme\.md$/i,
  /^(?:update\s+)?changelog(?:\.md)?$/i,
  /^(?:docs|chore)(?:\([^)]+\))?:\s*(?:update\s+)?changelog(?:\.md)?$/i,
  /^chore\(changelog\):/i,
];
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

function repositorySlugFromRemote() {
  const remote = safeGit(["config", "--get", "remote.origin.url"]);
  const match = remote.match(/github\.com[:/]([^/]+\/[^/.]+)(?:\.git)?$/i);
  return match?.[1] || "";
}

function exists(ref) {
  return safeGit(["rev-parse", "--verify", `${ref}^{commit}`]) !== "";
}

function isIgnoredSubject(subject) {
  return ignoredSubjectPatterns.some((pattern) => pattern.test(subject.trim()));
}

async function log(range) {
  const raw = safeGit(["log", "--reverse", range, "--pretty=format:%H%x1f%an%x1f%ae%x1f%s"]);
  const commits = raw ? raw.split("\n").map((row) => {
    const [fullHash, author, email, subject] = row.split("\x1f");
    return { hash: fullHash.slice(0, 7), fullHash, author, email, subject };
  }).filter((commit) => !isIgnoredSubject(commit.subject)) : [];
  return withResolvedAuthorProfiles(commits);
}

function tags() {
  const raw = safeGit(["tag", "--list", "v[0-9]*.[0-9]*.[0-9]*", "--sort=v:refname"]);
  return raw ? raw.split("\n").filter(Boolean) : [];
}

function releaseRefs() {
  const localTags = tags().filter(exists).map((tag) => [tag, tag]);
  if (localTags.length > 0) {
    return localTags;
  }
  return fallbackReleaseRefs.filter(([, ref]) => exists(ref));
}

function parsed(subject) {
  const match = subject.match(/^([a-z]+)(?:\(([^)]+)\))?(!)?:\s+(.+)$/);
  if (!match) {
    return null;
  }
  return { type: match[1], scope: match[2], breaking: Boolean(match[3]), text: match[4] };
}

const contributorProfiles = loadContributorProfiles();
const apiAuthorCache = new Map();

function loadContributorProfiles() {
  try {
    return new Map(Object.entries(JSON.parse(readFileSync(contributorsPath, "utf8"))));
  } catch {
    return new Map();
  }
}

async function fetchAuthorProfile(commit) {
  if (!repoSlug || typeof fetch !== "function") {
    return null;
  }
  if (apiAuthorCache.has(commit.fullHash)) {
    return apiAuthorCache.get(commit.fullHash);
  }
  try {
    const headers = {
      Accept: "application/vnd.github+json",
      "User-Agent": "ai-chat-speed-booster-changelog",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const response = await fetch(`https://api.github.com/repos/${repoSlug}/commits/${commit.fullHash}`, { headers });
    if (!response.ok) {
      apiAuthorCache.set(commit.fullHash, null);
      return null;
    }
    const data = await response.json();
    const profile = {
      name: data.commit?.author?.name || data.author?.login || commit.author || "",
      handle: data.author?.login || "",
    };
    apiAuthorCache.set(commit.fullHash, profile);
    return profile;
  } catch {
    apiAuthorCache.set(commit.fullHash, null);
    return null;
  }
}

async function withResolvedAuthorProfiles(commits) {
  return Promise.all(commits.map(async (commit) => ({
    ...commit,
    authorProfile: await fetchAuthorProfile(commit),
  })));
}

function authorProfile(commit) {
  if (commit.authorProfile?.name || commit.authorProfile?.handle) {
    return commit.authorProfile;
  }
  if (contributorProfiles.has(commit.author)) {
    return contributorProfiles.get(commit.author);
  }
  const emailMatch = commit.email?.match(/^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/);
  if (emailMatch) {
    return { name: emailMatch[1], handle: emailMatch[1] };
  }
  if (/^[A-Za-z0-9-]+$/.test(commit.author || "")) {
    return { name: commit.author, handle: commit.author };
  }
  return { name: commit.author || "", handle: "" };
}

function byline(commit) {
  const profile = authorProfile(commit);
  if (!profile.name) {
    return "";
  }
  if (profile.handle) {
    return ` by **[${profile.name} (@${profile.handle})](https://github.com/${profile.handle})**`;
  }
  return ` by **${profile.name}**`;
}

function scopeTitle(scope) {
  return scope.split(/[/-]/).filter(Boolean).map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`).join(" ");
}

function issueReferences(subject) {
  const refs = new Set();
  for (const match of subject.matchAll(/(?:^|\s)(#\d+|GH-\d+)(?=$|[\s).,;:])/gi)) {
    refs.add(match[1]);
  }
  return [...refs];
}

function issueLink(ref) {
  const number = ref.replace(/^GH-/i, "").replace(/^#/, "");
  if (!repoUrl) {
    return `(issue #${number})`;
  }
  return `([issue #${number}](${repoUrl}/issues/${number}))`;
}

function commitLink(commit) {
  if (!repoUrl) {
    return `(${commit.hash})`;
  }
  return `([${commit.hash}](${repoUrl}/commit/${commit.fullHash || commit.hash}))`;
}

function displayText(text) {
  return text.replace(/(?:^|\s)(?:#\d+|GH-\d+)(?=$|[\s).,;:])/gi, "").replace(/\s+/g, " ").trim();
}

function entrySuffix(commit) {
  const refs = issueReferences(commit.subject).map(issueLink);
  const issueText = refs.length > 0 ? ` ${refs.join(" ")}` : "";
  return `${issueText} ${commitLink(commit)}${byline(commit)}`;
}

function line(commit) {
  const p = parsed(commit.subject);
  if (!p) {
    return ["Other", "", `- ${displayText(commit.subject)}${entrySuffix(commit)}`];
  }
  const breaking = p.breaking ? " **BREAKING**" : "";
  return [headings.get(p.type) || "Other", p.scope || "", `- ${displayText(p.text)}${breaking}${entrySuffix(commit)}`];
}

function renderScope(scope, lines) {
  if (!scope) {
    return `${lines.join("\n")}\n`;
  }
  return `#### ${scopeTitle(scope)}\n\n${lines.join("\n")}\n`;
}

function renderCommits(commits) {
  if (commits.length === 0) {
    return "- No changes.\n";
  }
  const groups = new Map();
  for (const commit of commits.slice().reverse()) {
    const [group, scope, text] = line(commit);
    if (!groups.has(group)) {
      groups.set(group, new Map());
    }
    const scopes = groups.get(group);
    if (!scopes.has(scope)) {
      scopes.set(scope, []);
    }
    scopes.get(scope).push(text);
  }
  return [...headings.values(), "Other"].filter((group) => groups.has(group)).map((group) => {
    const scopes = groups.get(group);
    const unscoped = scopes.get("") ?? [];
    const scoped = [...scopes.entries()].filter(([scope]) => scope !== "").sort(([left], [right]) => left.localeCompare(right));
    const body = [
      ...(unscoped.length > 0 ? [renderScope("", unscoped)] : []),
      ...scoped.map(([scope, lines]) => renderScope(scope, lines)),
    ].join("\n");
    return `### ${group}\n\n${body}`;
  }).join("\n");
}

function section(title, commits, note = "") {
  return `## ${title}\n\n${renderCommits(commits)}${note}`;
}

async function sectionsFromReleaseRefs(refs) {
  const parts = [section("Unreleased", await log(`${refs.at(-1)[1]}..HEAD`))];
  for (let index = refs.length - 1; index >= 0; index -= 1) {
    const [tag, ref] = refs[index];
    const previous = refs[index - 1]?.[1] || "";
    const range = previous ? `${previous}..${ref}` : ref;
    parts.push(section(tag, await log(range)));
  }
  return parts;
}

function versionFrom(subject) {
  const lower = subject.toLowerCase();
  if (!lower.includes("version") && !lower.includes("bump")) {
    return "";
  }
  const found = subject.match(/1\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?/);
  return found ? `v${found[0]}` : "";
}

function newer(version, latest) {
  const left = version.replace(/^v/, "").split(".").map(Number);
  const right = latest.replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < 3; i += 1) {
    if ((left[i] || 0) !== (right[i] || 0)) {
      return (left[i] || 0) > (right[i] || 0);
    }
  }
  return false;
}

async function inferredSections() {
  const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
  if (Number(String(pkg.version).split(".")[0]) >= 2) {
    throw new Error("Version tags are required from v2.0.0 onward.");
  }
  const released = [];
  const seen = new Set();
  let latest = "v0.0.0";
  let bucket = [];
  for (const commit of await log("HEAD")) {
    bucket.push(commit);
    const version = versionFrom(commit.subject);
    if (!version || seen.has(version) || !newer(version, latest)) {
      continue;
    }
    released.push([version, bucket]);
    seen.add(version);
    latest = version;
    bucket = [];
  }
  return [section("Unreleased", bucket), ...released.reverse().map(([version, commits]) => section(version, commits, "_Inferred from a 1.x version bump commit. Prefer real tags for future releases._\n"))];
}

const refs = releaseRefs();
const sections = refs.length > 0 ? await sectionsFromReleaseRefs(refs) : await inferredSections();
writeFileSync(out, `# Changelog\n\n${sections.join("\n")}`);
