/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: detect supported AI chat sites from URLs.
 * Boundary: pure URL/site matching only; site config declarations stay in sites.ts.
 * ADR: docs/adr/architecture/native-mode/mode-boundary.md.
 */
import { SITES, type SiteConfig } from "./sites";

function hostnameMatches(site: SiteConfig, hostname: string): boolean {
    return site.hostnames.some((h) => hostname === h || hostname.endsWith(`.${h}`));
}

function requiredSearchParamsMatchForUrl(site: SiteConfig, url: URL): boolean {
    if (!site.requiredSearchParams?.length) return true;

    return site.requiredSearchParams.every((requirement) => {
        const currentValue = url.searchParams.get(requirement.name);
        return currentValue !== null && requirement.values.includes(currentValue);
    });
}

export function detectSiteFromUrl(rawUrl: string | undefined): SiteConfig | null {
    if (!rawUrl) return null;

    try {
        const url = new URL(rawUrl);
        return SITES.find((site) => hostnameMatches(site, url.hostname) && requiredSearchParamsMatchForUrl(site, url)) ?? null;
    } catch {
        return null;
    }
}
