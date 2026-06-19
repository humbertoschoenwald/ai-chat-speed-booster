import { test, expect, SITES, type SiteConfig } from "./extension-fixture";
import { generateMockPage } from "./helpers/mock-page";

const MESSAGE_COUNT = 8;

function mockUrl(site: SiteConfig): string {
    if (site.id === "deepseek") return `https://${site.hostnames[0]}/a/chat/s/mock`;
    if (site.id === "grok") return `https://${site.hostnames[0]}/c/mock-conversation`;
    if (site.id === "search-ai-mode") return `https://${site.hostnames[0]}/search?q=mock-test&udm=50`;
    return `https://${site.hostnames[0]}/mock-test`;
}

test("fast extension smoke covers every configured mock site", async ({ extensionContext }) => {
    for (const site of SITES) {
        const page = await extensionContext.newPage();
        try {
            await page.route(`**/${site.hostnames[0]}/**`, (route) =>
                route.fulfill({ contentType: "text/html", body: generateMockPage(site, MESSAGE_COUNT) }),
            );
            await page.goto(mockUrl(site), { waitUntil: "domcontentloaded" });
            await page.waitForSelector("[data-acsb-managed]", {
                timeout: 10_000,
                state: "attached",
            });

            await expect(page.locator("[data-acsb-managed]")).toHaveCount(MESSAGE_COUNT);
            await expect(page.locator(".acsb-load-more-wrapper")).toBeVisible();
            await expect(page.locator(".acsb-status-indicator")).toBeVisible();
        } finally {
            await page.close();
        }
    }
});
