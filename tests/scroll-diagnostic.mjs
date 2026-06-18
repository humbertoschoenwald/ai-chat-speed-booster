#!/usr/bin/env node
/**
 * License: MIT. See LICENSE in the repository root.
 * Responsibility: run an optional scroll-position diagnostic against a provided chat URL.
 * Boundary: this diagnostic skips when no URL is configured and only writes its local log file.
 * ADR: docs/adr/engineering/tooling/pnpm-package-manager-authority.md.
 *
 * Scroll diagnostic – opens a chat URL with the extension loaded, lets it
 * settle, then repeatedly scrolls the conversation container up while logging
 * the scroll position (scrollTop / scrollHeight / clientHeight) before and
 * after each step. This makes it easy to see the extension yanking the
 * viewport around (the auto-load "scroll jump" bug).
 *
 * Usage:
 *   node tests/scroll-diagnostic.mjs "<chat-url>"
 *
 * Requires a saved auth profile so the chat actually loads:
 *   pnpm run test:auth
 *
 * Output: scroll-diagnostic.log in the repo root.
 */
import { chromium } from "@playwright/test";
import path from "path";
import os from "os";
import { readFileSync, existsSync, cpSync, mkdtempSync, writeFileSync, appendFileSync } from "fs";

const URL = process.argv[2] ?? process.env.SCROLL_DIAGNOSTIC_URL;
if (!URL) {
    console.log(
        'Skipping scroll diagnostic because no URL was provided. Set SCROLL_DIAGNOSTIC_URL or pass "<chat-url>".',
    );
    process.exit(0);
}

const EXTENSION_PATH = path.resolve("dist", "chrome");
const AUTH_PROFILE = path.resolve("tests", ".auth-profile");
const LOG_FILE = path.resolve("scroll-diagnostic.log");

const sites = JSON.parse(readFileSync("sites.config.json", "utf8"));
const hostname = new URL(URL).hostname;
const site = sites.find((s) => s.hostnames.some((h) => hostname.endsWith(h))) ?? sites[0];

writeFileSync(LOG_FILE, `# scroll diagnostic\n# url: ${URL}\n# site: ${site.id}\n# started: ${new Date().toISOString()}\n\n`);
function log(line) {
    const stamp = new Date().toISOString().slice(11, 23);
    appendFileSync(LOG_FILE, `[${stamp}] ${line}\n`);
    console.log(`[${stamp}] ${line}`);
}

if (!existsSync(EXTENSION_PATH)) {
    log(`ERROR: ${EXTENSION_PATH} not found — run "pnpm run build:chrome" first.`);
    process.exit(1);
}

let userDataDir = "";
if (existsSync(AUTH_PROFILE)) {
    userDataDir = mkdtempSync(path.join(os.tmpdir(), "acsb-scroll-"));
    cpSync(AUTH_PROFILE, userDataDir, { recursive: true });
    log(`using auth profile copy at ${userDataDir}`);
} else {
    log(`WARNING: no auth profile at ${AUTH_PROFILE} — the chat may not load. Run "pnpm run test:auth".`);
}

const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false, // extensions require a headed context
    args: [
        "--no-first-run",
        "--no-default-browser-check",
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
    ],
});

const page = await context.newPage();
page.on("console", (msg) => {
    const t = msg.text();
    if (t.includes("AI Chat Speed Booster") || t.includes("[acsb]") || t.toLowerCase().includes("auto")) {
        log(`PAGE-CONSOLE: ${t}`);
    }
});

// Probe helper evaluated in the page: finds the scroll container and returns metrics.
const SCROLL_SELECTORS = [site.selectors.scrollContainer, site.selectors.scrollContainerAlt].filter(Boolean);
async function metrics() {
    return page.evaluate((selectors) => {
        let el = null;
        let used = null;
        for (const sel of selectors) {
            const found = document.querySelector(sel);
            if (found) { el = found; used = sel; break; }
        }
        const turns = document.querySelectorAll('section[data-testid^="conversation-turn-"], [data-test-render-count], user-query, model-response').length;
        const hidden = document.querySelectorAll(".acsb-hidden").length;
        if (!el) return { ok: false, used: null, turns, hidden };
        return {
            ok: true,
            used,
            scrollTop: Math.round(el.scrollTop),
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
            atTopPct: el.scrollHeight - el.clientHeight > 0
                ? +(el.scrollTop / (el.scrollHeight - el.clientHeight) * 100).toFixed(1)
                : 100,
            turns,
            hidden,
        };
    }, SCROLL_SELECTORS);
}

try {
    log(`navigating to ${URL}`);
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60_000 });

    // Wait for conversation turns to render.
    log("waiting for conversation to render…");
    await page.waitForTimeout(8_000);
    let m = await metrics();
    log(`after load: ${JSON.stringify(m)}`);

    if (!m.ok) {
        log("could not locate a scroll container with any configured selector — check sites.config.json. Dumping candidates:");
        const cands = await page.evaluate(() => {
            const out = [];
            for (const el of document.querySelectorAll("div, main")) {
                const overflowY = getComputedStyle(el).overflowY;
                if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight + 50) {
                    out.push({
                        tag: el.tagName.toLowerCase(),
                        id: el.id || null,
                        cls: (el.className || "").toString().slice(0, 80),
                        attrs: [...el.attributes].map((a) => a.name).filter((n) => n.startsWith("data-")).slice(0, 6),
                        scrollHeight: el.scrollHeight,
                        clientHeight: el.clientHeight,
                    });
                }
            }
            return out.slice(0, 10);
        });
        log(`scrollable candidates: ${JSON.stringify(cands, null, 2)}`);
    }

    // Scroll to the bottom first (where the user normally starts), then walk up.
    await page.evaluate((selectors) => {
        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el) { el.scrollTop = el.scrollHeight; break; }
        }
    }, SCROLL_SELECTORS);
    await page.waitForTimeout(1_500);
    log(`at bottom: ${JSON.stringify(await metrics())}`);

    // Walk upward in chunks. After each wheel-up, sample immediately and again
    // after 1.2s to catch the extension scrolling the viewport back down.
    for (let i = 0; i < 30; i++) {
        await page.mouse.move(640, 360);
        await page.mouse.wheel(0, -1200);
        const before = await metrics();
        await page.waitForTimeout(1_200);
        const after = await metrics();
        const jumped = before.ok && after.ok && Math.abs(after.scrollTop - before.scrollTop) > 150;
        log(`step ${i + 1}: immediate=${JSON.stringify(before)}  +1.2s=${JSON.stringify(after)}${jumped ? "  <-- VIEWPORT JUMPED" : ""}`);
        if (after.ok && after.scrollTop <= 2 && after.hidden === 0) {
            log("reached top with nothing hidden — stopping.");
            break;
        }
    }

    log("done. Leaving browser open 5s for inspection.");
    await page.waitForTimeout(5_000);
} catch (err) {
    log(`ERROR: ${err && err.stack ? err.stack : err}`);
} finally {
    await context.close();
    log(`log written to ${LOG_FILE}`);
}
