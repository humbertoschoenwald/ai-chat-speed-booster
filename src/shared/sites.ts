import sitesConfig from "../../sites.config.json";

export interface SiteSelectors {
    readonly messageTurn: string;
    readonly scrollContainer: string;
    readonly scrollContainerAlt?: string;
    readonly userMessageSelector?: string;
    readonly excludedMessageAncestorSelectors?: readonly string[];
}

export interface StatusAnchors {
    readonly name?: string;
    readonly controls?: string;
    readonly bottom?: string;
}

export type LoadMorePlacement = "inline" | "top-right" | "left-of-share";
export type LoadMoreTheme = "default" | "gemini";

export interface SiteUI {
    readonly loadMoreMargin?: string;
    readonly loadMorePlacement?: LoadMorePlacement;
    readonly loadMoreAnchorSelector?: string;
    readonly loadMoreTopPx?: number;
    readonly loadMoreRightPx?: number;
    readonly loadMoreTheme?: LoadMoreTheme;
}

export type SiteModeReviewStatus = "not-functional";

export interface SiteReviewMetadata {
    readonly stableModeLastReviewedAt: string | null;
    readonly nativeModeLastReviewedAt: string | null;
    readonly stableModeStatus: SiteModeReviewStatus | null;
    readonly nativeModeStatus: SiteModeReviewStatus | null;
}

export interface MessageUnitConfig {
    /** Managed DOM turn elements that represent one user-visible chat message. */
    readonly elementsPerMessage: number;
}

export interface FetchInterceptTreeWalkConfig {
    readonly nodesKey: string;
    readonly currentNodeKey: string;
    readonly rootKey: string;
    readonly parentPointer: string;
    readonly childrenKey: string;
    readonly messageKey: string;
    readonly roleAccessor: string;
    readonly visibleRoles: readonly string[];
}

export interface FetchInterceptArraySliceConfig {
    readonly messagesKey: string;
    readonly roleKey: string;
    readonly visibleRoles: readonly string[];
    /** Number of initial messages to always keep (system prompts, etc.). */
    readonly keepInitial?: number;
}

export interface FetchInterceptConfig {
    /** Substring that must appear in the URL to match. */
    readonly urlMatch: string;
    /** URL substrings that exclude a request from interception. */
    readonly urlExclude: readonly string[];
    /** HTTP method to match (e.g. "GET"). */
    readonly method: string;
    /** Trimming strategy to apply. */
    readonly strategy: "tree-walk" | "array-slice";
    readonly treeWalk?: FetchInterceptTreeWalkConfig;
    readonly arraySlice?: FetchInterceptArraySliceConfig;
}

export interface SiteConfig {
    readonly id: string;
    readonly name: string;
    readonly review?: SiteReviewMetadata;
    readonly hostnames: readonly string[];
    readonly isDynamic?: boolean; // Indicates if the site has dynamic content loading that may require special handling (e.g. Gemini)
    readonly urlPatterns: readonly string[];
    readonly requiredSearchParams?: readonly { readonly name: string; readonly values: readonly string[] }[];
    readonly selectors: SiteSelectors;
    readonly messageUnit?: MessageUnitConfig;
    readonly messageIdAttribute?: string;
    readonly statusAnchors?: StatusAnchors;
    readonly ui?: SiteUI;
    readonly fetchIntercept?: FetchInterceptConfig;
}

export const SITES: readonly SiteConfig[] = sitesConfig as SiteConfig[];

export function detectCurrentSite(): SiteConfig | null {
    const hostname = window.location.hostname;
    const params = new URLSearchParams(window.location.search);

    return SITES.find((site) => {
        const hostMatches = site.hostnames.some((h) => hostname === h || hostname.endsWith(`.${h}`));
        const paramsMatch = !site.requiredSearchParams?.length || site.requiredSearchParams.every((requirement) => {
            const currentValue = params.get(requirement.name);
            return currentValue !== null && requirement.values.includes(currentValue);
        });
        return hostMatches && paramsMatch;
    }) ?? null;
}

/** Collect every URL pattern across all configured sites. */
export function getAllUrlPatterns(): string[] {
    return SITES.flatMap((site) => [...site.urlPatterns]);
}
