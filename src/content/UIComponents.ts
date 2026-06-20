/**
 * License: MIT. Provenance: AI Chat Speed Booster extension source.
 * Responsibility: render Stable Mode in-page controls and the floating status badge.
 * Boundary: DOM control rendering only; message accounting lives in MessageManager.
 * ADR: docs/adr/architecture/message-management/stable-fast-logical-message-contract.md.
 */
import { CSS_PREFIX } from "../shared/constants";
import { logger } from "../shared/logger";
import type { SiteConfig } from "../shared/sites";
import type { StatusPosition } from "../shared/types";

export type LoadMoreHandler = () => void;

function createArrowUpIcon(): SVGElement {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("xmlns", ns);
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    const vertical = document.createElementNS(ns, "path");
    vertical.setAttribute("d", "M12 19V5");

    const arrowHead = document.createElementNS(ns, "path");
    arrowHead.setAttribute("d", "m5 12 7-7 7 7");

    svg.append(vertical, arrowHead);
    return svg;
}

export class LoadMoreButton {
    private container: HTMLElement | null = null;
    private readonly onLoadMore: LoadMoreHandler;
    private activeHandler: LoadMoreHandler;
    private hiddenCount = 0;
    private loadMoreBatchSize = 3;
    private downloading = false;
    private siteConfig: SiteConfig;

    constructor(onLoadMore: LoadMoreHandler, siteConfig: SiteConfig) {
        this.onLoadMore = onLoadMore;
        this.activeHandler = onLoadMore;
        this.siteConfig = siteConfig;
    }

    show(
        anchorParent: HTMLElement,
        firstVisibleElement: HTMLElement | null,
        hiddenCount: number,
        loadMoreBatchSize: number,
        downloading = false,
    ): void {
        this.hiddenCount = hiddenCount;
        this.loadMoreBatchSize = loadMoreBatchSize;
        this.downloading = downloading;
        this.activeHandler = this.onLoadMore;

        if (!this.container) {
            this.container = this.createElement();
        }

        this.updateLabel();

        if (this.usesFixedOverlay()) {
            this.applyFixedOverlayPlacement();
            document.body.appendChild(this.container);
            return;
        }

        this.applyInlinePlacement();
        if (
            firstVisibleElement &&
            firstVisibleElement.parentElement === anchorParent
        ) {
            anchorParent.insertBefore(this.container, firstVisibleElement);
        } else {
            anchorParent.prepend(this.container);
        }
    }

    update(hiddenCount: number): void {
        this.hiddenCount = hiddenCount;
        this.updateLabel();
    }

    hide(): void {
        this.container?.remove();
    }

    destroy(): void {
        this.hide();
        this.container = null;
    }

    private usesFixedOverlay(): boolean {
        return this.siteConfig.id === "chatgpt";
    }

    private applyFixedOverlayPlacement(): void {
        if (!this.container) return;
        Object.assign(this.container.style, {
            position: "fixed",
            top: "52px",
            right: "116px",
            zIndex: "2147483646",
            display: "flex",
            alignSelf: "auto",
            justifyContent: "center",
            alignItems: "center",
            padding: "0",
            margin: "0",
            borderRadius: "999px",
            background: "transparent",
            pointerEvents: "auto",
        } satisfies Partial<CSSStyleDeclaration>);
    }

    private applyInlinePlacement(): void {
        if (!this.container) return;
        Object.assign(this.container.style, {
            position: "static",
            top: "auto",
            right: "auto",
            zIndex: "auto",
            display: "flex",
            alignSelf: "stretch",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px 12px",
            margin: this.siteConfig.ui?.loadMoreMargin ?? "4px 0",
            borderRadius: "12px",
            background: "transparent",
            pointerEvents: "auto",
        } satisfies Partial<CSSStyleDeclaration>);
    }

    private createElement(): HTMLElement {
        const wrapper = document.createElement("div");
        const siteMargin = this.siteConfig.ui?.loadMoreMargin ?? "4px 0";
        wrapper.className = `${CSS_PREFIX}-load-more-wrapper`;
        wrapper.setAttribute("role", "banner");
        Object.assign(wrapper.style, {
            display: "flex",
            alignSelf: "stretch",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px 12px",
            margin: siteMargin,
            borderRadius: "12px",
            background: "transparent",
            transition: "opacity 0.2s ease",
        } satisfies Partial<CSSStyleDeclaration>);

        const button = document.createElement("button");
        button.className = `${CSS_PREFIX}-load-more-btn`;
        button.type = "button";
        button.setAttribute("aria-label", "Load older messages");
        Object.assign(button.style, {
            all: "unset",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            minHeight: "34px",
            padding: "7px 16px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: "600",
            fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            color: "var(--text-primary, var(--text-foreground, #f4f4f5))",
            background: "var(--main-surface-secondary, rgba(127,127,127,0.16))",
            border: "1px solid var(--border-light, rgba(127,127,127,0.22))",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            transition:
                "background 0.15s ease, transform 0.1s ease, color 0.1s ease, border-color 0.15s ease",
        } satisfies Partial<CSSStyleDeclaration>);

        button.addEventListener("mouseenter", () => {
            button.style.background = "var(--main-surface-tertiary, rgba(127,127,127,0.22))";
            button.style.borderColor = "var(--border-medium, rgba(127,127,127,0.32))";
        });
        button.addEventListener("mouseleave", () => {
            button.style.background = "var(--main-surface-secondary, rgba(127,127,127,0.16))";
            button.style.borderColor = "var(--border-light, rgba(127,127,127,0.22))";
        });
        button.addEventListener("mousedown", () => {
            button.style.transform = "scale(0.97)";
        });
        button.addEventListener("mouseup", () => {
            button.style.transform = "scale(1)";
        });

        const icon = document.createElement("span");
        icon.setAttribute("aria-hidden", "true");
        Object.assign(icon.style, {
            display: "inline-flex",
            alignItems: "center",
        });
        icon.appendChild(createArrowUpIcon());

        const label = document.createElement("span");
        label.className = `${CSS_PREFIX}-load-more-label`;

        button.append(icon, label);
        button.addEventListener("click", this.handleClick);
        wrapper.appendChild(button);

        logger.debug("load more button created");
        return wrapper;
    }

    private updateLabel(): void {
        const label = this.container?.querySelector<HTMLElement>(
            `.${CSS_PREFIX}-load-more-label`,
        );
        if (label) {
            if (this.downloading) {
                label.textContent = "Downloading…";
                return;
            }
            const hidden = this.hiddenCount;
            const perClick = Math.min(this.loadMoreBatchSize, hidden);
            label.textContent = `Load ${perClick} older (${hidden} hidden)`;
        }
    }

    private readonly handleClick = (e: MouseEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        if (this.downloading) return;
        this.activeHandler();
    };
}

export class StatusIndicator {
    private container: HTMLElement | null = null;
    private label: HTMLElement | null = null;
    private position: StatusPosition = "top-right";
    private appliedLightTheme: boolean | null = null;
    private siteConfig: SiteConfig;

    constructor(siteConfig: SiteConfig) {
        this.siteConfig = siteConfig;
    }

    /**
     * Updates the displayed counts, position and theme. Creates the indicator if needed.
     */
    update(hidden: number, total: number, position: StatusPosition, fetchInterceptEnabled = false, lightTheme: boolean = false): void {
        if (!this.container || !this.container.isConnected) {
            if (this.container) {
                this.container.remove();
            }
            this.container = null;
            this.label = null;
            this.appliedLightTheme = null;
            if (!this.mount()) return;
        }
        if (this.position !== position) {
            this.position = position;
            this.applyPosition();
        }
        if (this.label) {
            this.label.textContent = fetchInterceptEnabled
                ? `${hidden} hidden`
                : `${hidden} hidden · ${total} total`;
        }
        // Avoid rewriting inline theme styles on every refresh frame.
        if (this.appliedLightTheme !== lightTheme) {
            if (lightTheme) {
                this.setLightTheme();
            } else {
                this.setDarkTheme();
            }
            this.appliedLightTheme = lightTheme;
        }
    }

    isMounted(): boolean {
        return this.container?.isConnected ?? false;
    }

    hide(): void {
        this.container?.remove();
        this.container = null;
        this.label = null;
        this.appliedLightTheme = null;
    }

    destroy(): void {
        this.hide();
    }

    /*** Sets the light theme for the status indicator. */
    private setLightTheme(): void {
        if (this.container){
            this.container.style.background = "var(--surface-secondary, rgba(255, 255, 255, 0.7))";
            this.container.style.color = "#000000";
        }
        if (this.label) this.label.style.color = "#000000";
    }

    /** Sets the dark theme for the status indicator. */
    private setDarkTheme(): void {
        if (this.container) {
            this.container.style.background = "var(--surface-secondary, rgba(0,0,0,0.7))";
            this.container.style.color = "var(--text-secondary, #9ca3af)";
        }
        if (this.label) this.label.style.color = "var(--text-secondary, #9ca3af)";
        
    }

    private getAnchorRect(anchor: "name" | "controls" | "bottom"): DOMRect | undefined {
        const selector = this.siteConfig.statusAnchors?.[anchor];
        if (!selector) return undefined;
        return document.querySelector<HTMLElement>(selector)?.getBoundingClientRect() ?? undefined;
    }

    private applyPosition(): void {
        if (!this.container) return;
        const s = this.container.style;
        // Reset all corners
        s.top = s.bottom = s.left = s.right = "";
        switch (this.position) {

            case "top-left": {
                const rect = this.getAnchorRect("name");
                if (rect) {
                    s.top = `${Math.round(rect.bottom + 8)}px`;
                    s.left = `${Math.round(Math.max(16, rect.left))}px`;
                } else {
                    s.top = "8px";
                    s.left = "16px";
                }
                break;
            }

            case "top-right": {
                const rect = this.getAnchorRect("controls");
                if (rect) {
                    s.top = `${Math.round(rect.bottom + 8)}px`;
                    s.right = `${Math.round(
                        Math.max(16, window.innerWidth - rect.right),
                    )}px`;
                } else {
                    s.top = "8px";
                    s.right = "16px";
                }
                break;
            }

            case "bottom-left": {
                const rect = this.getAnchorRect("bottom");
                if (rect) {
                    s.bottom = "8px";
                    s.left = `${Math.round(Math.max(16, rect.left + 16))}px`;
                } else {
                    s.bottom = "8px";
                    s.left = "16px";
                }
                break;
            }

            case "bottom-right":
                s.bottom = "8px"; s.right = "16px"; break;
        }
    }

    private mount(): boolean {
        if (!document.body) return false;
        this.container = document.createElement("div");
        this.container.className = `${CSS_PREFIX}-status-indicator`;
        this.container.setAttribute("role", "status");
        this.container.setAttribute("aria-live", "polite");

        Object.assign(this.container.style, {
            position: "fixed",
            zIndex: "10000",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: "500",
            fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            color: "var(--text-secondary, #9ca3af)",
            background: "var(--surface-secondary, rgba(0,0,0,0.6))",
            backdropFilter: "blur(8px)",
            border: "1px solid var(--border-light, rgba(255,255,255,0.06))",
            pointerEvents: "none",
            userSelect: "none",
            opacity: "0.85",
        } satisfies Partial<CSSStyleDeclaration>);

        this.applyPosition();

        this.label = document.createElement("span");
        this.label.className = `${CSS_PREFIX}-status-label`;
        this.container.appendChild(this.label);

        document.body.appendChild(this.container);
        logger.debug("status indicator mounted");
        return true;
    }
}
