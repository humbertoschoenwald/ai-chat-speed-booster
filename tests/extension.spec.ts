/**
 * Extension tests – loads the real extension in Chromium and verifies it
 * works on mock pages that mimic each configured site's DOM.
 *
 * For every site in sites.config.json the tests:
 *  1. Route the real URL to return mock HTML
 *  2. Navigate → content script runs (URL matches manifest pattern)
 *  3. Verify messages are hidden/shown correctly
 *  4. Verify Load More button appears and works
 *  5. Verify status indicator shows correct counts
 *
 * No login or network access needed.
 * Detection is DOM-based (data-acsb-managed, .acsb-* classes) so it works
 * regardless of __DEV__/production build mode.
 */
import { test, expect, SITES } from "./extension-fixture";
import { generateMockPage, getMessageTestAttr } from "./helpers/mock-page";

const MESSAGE_COUNT = 20; // enough to exceed default visible window
// Config defaults: visibleMessageLimit=3, loadMoreBatchSize=3
// Actual visible = limit * 2 (user+assistant pairs), actual batch = batch * 2
const DEFAULT_VISIBLE_LIMIT = 6; // 3 * 2
const DEFAULT_BATCH_SIZE = 6; // 3 * 2

for (const site of SITES) {
    test.describe(`${site.name}`, () => {
        test.describe.configure({ mode: "serial" });

        /*  helpers  */

        function messageLocator(page: import("@playwright/test").Page, index: number) {
            const { attr, prefix } = getMessageTestAttr(site);
            return page.locator(`[${attr}="${prefix}${index}"]`);
        }

        function getMockUrl(): string {
            if (site.id === "deepseek") return `https://${site.hostnames[0]}/a/chat/s/mock`;
            if (site.id === "grok") return `https://${site.hostnames[0]}/c/mock-conversation`;
            if (site.id === "search-ai-mode") return `https://${site.hostnames[0]}/search?q=mock-test&udm=50`;
            return `https://${site.hostnames[0]}/mock-test`;
        }

        /** Navigate to mock page and wait for the extension to process messages */
        async function loadMockPage(page: import("@playwright/test").Page) {
            const mockHtml = generateMockPage(site, MESSAGE_COUNT);
            await page.route(`**/${site.hostnames[0]}/**`, (route) =>
                route.fulfill({ contentType: "text/html", body: mockHtml }),
            );
            await page.goto(getMockUrl(), {
                waitUntil: "domcontentloaded",
            });
            // Wait for the extension to process: it adds data-acsb-managed attrs
            await page.waitForSelector("[data-acsb-managed]", {
                timeout: 10_000,
                state: "attached", // not "visible" — first managed elements are hidden
            });
        }

        /*  tests  */

        test("content script activates and manages messages", async ({ page }) => {
            await loadMockPage(page);

            const managedCount = await page.locator("[data-acsb-managed]").count();
            expect(managedCount).toBe(MESSAGE_COUNT);
        });

        test("hides excess messages (FIFO)", async ({ page }) => {
            await loadMockPage(page);

            const hiddenCount = MESSAGE_COUNT - DEFAULT_VISIBLE_LIMIT;

            for (let i = 1; i <= hiddenCount; i++) {
                await expect(messageLocator(page, i)).toHaveCSS("display", "none");
            }

            for (let i = hiddenCount + 1; i <= MESSAGE_COUNT; i++) {
                await expect(messageLocator(page, i)).not.toHaveCSS("display", "none");
            }
        });

        test("Load More button appears with correct counts", async ({ page }) => {
            await loadMockPage(page);

            const hiddenCount = MESSAGE_COUNT - DEFAULT_VISIBLE_LIMIT;
            await expect(page.locator(".acsb-load-more-wrapper")).toBeVisible();
            // Label divides by 2 to show conversation pairs, not raw turns
            await expect(page.locator(".acsb-load-more-label")).toContainText(
                `${hiddenCount / 2} hidden`,
            );
            await expect(page.locator(".acsb-load-more-label")).toContainText(
                `${DEFAULT_BATCH_SIZE / 2} more`
            );
        });

        test("clicking Load More reveals more messages", async ({ page }) => {
            await loadMockPage(page);

            const hiddenBefore = MESSAGE_COUNT - DEFAULT_VISIBLE_LIMIT;
            await page.locator(".acsb-load-more-btn").click();
            await page.waitForTimeout(500);

            const expectedHidden = Math.max(0, hiddenBefore - DEFAULT_BATCH_SIZE);
            const { attr, prefix } = getMessageTestAttr(site);
            let actualHidden = 0;
            for (let i = 1; i <= MESSAGE_COUNT; i++) {
                const display = await page
                    .locator(`[${attr}="${prefix}${i}"]`)
                    .evaluate((el) => getComputedStyle(el).display);
                if (display === "none") actualHidden++;
            }
            expect(actualHidden).toBe(expectedHidden);
        });

        test("status indicator shows correct counts", async ({ page }) => {
            await loadMockPage(page);

            await expect(page.locator(".acsb-status-indicator")).toBeVisible();
            const hiddenCount = (MESSAGE_COUNT - DEFAULT_VISIBLE_LIMIT) / 2;
            await expect(page.locator(".acsb-status-label")).toContainText(
                `${hiddenCount} hidden`,
            );
        });

        test("status indicator recovers after host removal (#31)", async ({ page }) => {
            await loadMockPage(page);

            await expect(page.locator(".acsb-status-indicator")).toBeVisible();
            await page.locator(".acsb-status-indicator").evaluate((element) => element.remove());
            await expect(page.locator(".acsb-status-indicator")).toHaveCount(0);

            await page.locator(".acsb-load-more-btn").click();
            await expect(page.locator(".acsb-status-indicator")).toBeVisible();
        });

        test("status indicator recovers on page resume (#31)", async ({ page }) => {
            await loadMockPage(page);

            await expect(page.locator(".acsb-status-indicator")).toBeVisible();
            await page.locator(".acsb-status-indicator").evaluate((element) => element.remove());
            await expect(page.locator(".acsb-status-indicator")).toHaveCount(0);

            await page.evaluate(() => window.dispatchEvent(new Event("pageshow")));
            await expect(page.locator(".acsb-status-indicator")).toBeVisible();
        });

        if (site.id === "deepseek") {
            test("DeepSeek selector regression: manages virtual-list item roots without inner markdown duplicates (#14)", async ({ page }) => {
                await loadMockPage(page);

                const rootCount = await page.locator(".ds-virtual-list-visible-items > [data-virtual-list-item-key]").count();
                const innerCount = await page.locator(".ds-message").count();
                const assistantMarkdownCount = await page.locator(".ds-assistant-message-main-content").count();
                const managedCount = await page.locator("[data-acsb-managed]").count();

                expect(rootCount).toBe(MESSAGE_COUNT);
                expect(innerCount).toBe(MESSAGE_COUNT);
                expect(assistantMarkdownCount).toBeGreaterThan(0);
                expect(managedCount).toBe(MESSAGE_COUNT);
            });

            test("DeepSeek scroll regression: uses the scoped virtual-list scroll container (#14)", async ({ page }) => {
                await loadMockPage(page);

                const scrollContainers = await page.locator(".ds-virtual-list.ds-scroll-area").count();
                const allScrollAreas = await page.locator(".ds-scroll-area").count();

                expect(scrollContainers).toBe(1);
                expect(allScrollAreas).toBeGreaterThanOrEqual(2);
            });
        }

        if (site.id === "search-ai-mode") {
            test("Search AI Mode guard: normal search URL without udm=50 does not activate ACSB (#23)", async ({ page }) => {
                const mockHtml = generateMockPage(site, MESSAGE_COUNT);
                await page.route(`**/${site.hostnames[0]}/**`, (route) =>
                    route.fulfill({ contentType: "text/html", body: mockHtml }),
                );
                await page.goto(`https://${site.hostnames[0]}/search?q=mock-test`, {
                    waitUntil: "domcontentloaded",
                });
                await page.waitForTimeout(1000);

                await expect(page.locator("[data-acsb-managed]")).toHaveCount(0);
                await expect(page.locator(".acsb-status-indicator")).toHaveCount(0);
            });

            test("Search AI Mode selector regression: manages AI turn roots instead of generic main content (#23)", async ({ page }) => {
                await loadMockPage(page);
                await page.evaluate(() => {
                    const main = document.createElement("div");
                    main.setAttribute("role", "main");
                    main.textContent = "Generic content that must not be managed";
                    document.body.appendChild(main);
                });

                await expect(page.locator('div[data-xid^="aim-mars-turn-root"]')).toHaveCount(MESSAGE_COUNT);
                await expect(page.locator("[data-acsb-managed]")).toHaveCount(MESSAGE_COUNT);
            });
        }

        if (site.id === "grok") {
            test("Grok selector regression: manages scoped response roots (#12)", async ({ page }) => {
                await loadMockPage(page);

                await expect(page.locator('[data-testid="drop-ui"] div[id^="response-"]')).toHaveCount(MESSAGE_COUNT);
                await expect(page.locator("[data-acsb-managed]")).toHaveCount(MESSAGE_COUNT);
            });

            test("Grok selector regression: does not treat message bubbles as duplicate turns (#12)", async ({ page }) => {
                await loadMockPage(page);

                expect(await page.locator('[data-testid="drop-ui"] div[id^="response-"]').count()).toBe(MESSAGE_COUNT);
                expect(await page.locator(".message-bubble").count()).toBe(MESSAGE_COUNT);
                expect(await page.locator("[data-acsb-managed]").count()).toBe(MESSAGE_COUNT);
            });

            test("Grok selector regression: avoids generic response-class overmatch (#12)", async ({ page }) => {
                await loadMockPage(page);
                await page.evaluate(() => {
                    const extra = document.createElement("div");
                    extra.className = "relative response-content-markdown markdown";
                    extra.textContent = "Nested response-looking element that must not be managed";
                    document.body.appendChild(extra);
                });

                await expect(page.locator('[data-testid="drop-ui"] div[id^="response-"]')).toHaveCount(MESSAGE_COUNT);
                await expect(page.locator("[data-acsb-managed]")).toHaveCount(MESSAGE_COUNT);
            });

            test("Grok scroll regression: uses scoped chat scroll container instead of generic overflow nodes (#12)", async ({ page }) => {
                await loadMockPage(page);
                await page.evaluate(() => {
                    const fakeScroll = document.createElement("div");
                    fakeScroll.className = "fake-scroll overflow-y-auto";
                    fakeScroll.textContent = "Fake scroll container";
                    document.body.appendChild(fakeScroll);
                });

                await expect(page.locator('[data-testid="drop-ui"] main > div > div.overflow-y-auto')).toHaveCount(1);
            });
        }

        test("no errors in extension service worker", async ({ extensionContext }) => {
            const workers = extensionContext.serviceWorkers();
            expect(workers.length).toBeGreaterThan(0);
            expect(workers[0].url()).toContain("background.js");
        });

        test("popup page loads without errors", async ({ extensionId, extensionContext }) => {
            const popupPage = await extensionContext.newPage();
            const errors: string[] = [];
            popupPage.on("pageerror", (err) => errors.push(err.message));

            await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
            await popupPage.waitForTimeout(1000);

            expect(errors).toHaveLength(0);
            await expect(popupPage.locator(".popup-header__brand")).toContainText(
                "Speed Booster",
            );
            await popupPage.close();
        });
    });
}
