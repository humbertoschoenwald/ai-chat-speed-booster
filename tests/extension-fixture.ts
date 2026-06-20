/**
 * Playwright fixture that launches Chromium with the extension loaded.
 *
 * Provides:
 *  - `extensionContext` – persistent BrowserContext with the extension
 *  - `extensionId`      – the Manifest-V3 extension ID
 *  - `page`             – a fresh Page per test (from the extension context)
 */
import { test as base, chromium, type BrowserContext, type Page } from "@playwright/test";
import path from "path";
import { readFileSync, existsSync, cpSync, mkdtempSync } from "fs";
import os from "os";

/*  paths  */
const EXTENSION_PATH = path.resolve("dist", "chrome");
const AUTH_PROFILE = path.resolve("tests", ".auth-profile");

/*  site configs (single source of truth)  */
export interface SiteConfig {
    id: string;
    name: string;
    hostnames: string[];
    urlPatterns: string[];
    selectors: {
        messageTurn: string;
        scrollContainer: string;
        scrollContainerAlt?: string;
    };
    messageUnit?: {
        elementsPerMessage: number;
    };
    messageIdAttribute?: string;
}

export const SITES: SiteConfig[] = JSON.parse(
    readFileSync(path.resolve("sites.config.json"), "utf8"),
);

/*  fixtures  */

// Worker-scoped (shared across all tests in a file)
type WorkerFixtures = {
    extensionContext: BrowserContext;
    extensionId: string;
};

/**
 * Base extension test – launches a TEMPORARY profile (no saved auth).
 * Used for mock-page tests.
 */
export const test = base.extend<{ page: Page }, WorkerFixtures>({
    // eslint-disable-next-line no-empty-pattern
    extensionContext: [async ({ }, use) => {
        const showTestBrowser = process.env.SHOW_TEST_BROWSER === "1";
        const ctx = await chromium.launchPersistentContext("", {
            headless: false, // Chromium extensions still need a persistent extension context.
            args: [
                ...(showTestBrowser ? [] : ["--headless=new"]),
                "--no-first-run",
                "--no-default-browser-check",
                `--disable-extensions-except=${EXTENSION_PATH}`,
                `--load-extension=${EXTENSION_PATH}`,
            ],
        });
        await use(ctx);
        await ctx.close();
    }, { scope: "worker" }],

    extensionId: [async ({ extensionContext }, use) => {
        let [sw] = extensionContext.serviceWorkers();
        if (!sw) sw = await extensionContext.waitForEvent("serviceworker");
        const id = sw.url().split("/")[2];
        await use(id);
    }, { scope: "worker" }],

    page: async ({ extensionContext }, use) => {
        const page = await extensionContext.newPage();
        await use(page);
        await page.close();
    },
});

/**
 * Auth-aware extension test – copies the saved auth profile so tests
 * start already logged in. Falls back to a blank profile if none exists.
 */
export const authTest = base.extend<{ page: Page }, WorkerFixtures>({
    // eslint-disable-next-line no-empty-pattern
    extensionContext: [async ({ }, use) => {
        const showTestBrowser = process.env.SHOW_TEST_BROWSER === "1";
        let userDataDir = "";
        if (existsSync(AUTH_PROFILE)) {
            userDataDir = mkdtempSync(path.join(os.tmpdir(), "acsb-test-"));
            cpSync(AUTH_PROFILE, userDataDir, { recursive: true });
        }
        const ctx = await chromium.launchPersistentContext(userDataDir, {
            headless: false,
            args: [
                ...(showTestBrowser ? [] : ["--headless=new"]),
                "--no-first-run",
                "--no-default-browser-check",
                `--disable-extensions-except=${EXTENSION_PATH}`,
                `--load-extension=${EXTENSION_PATH}`,
            ],
        });
        await use(ctx);
        await ctx.close();
    }, { scope: "worker" }],

    extensionId: [async ({ extensionContext }, use) => {
        let [sw] = extensionContext.serviceWorkers();
        if (!sw) sw = await extensionContext.waitForEvent("serviceworker");
        const id = sw.url().split("/")[2];
        await use(id);
    }, { scope: "worker" }],

    page: async ({ extensionContext }, use) => {
        const page = await extensionContext.newPage();
        await use(page);
        await page.close();
    },
});

export const expect = test.expect;
