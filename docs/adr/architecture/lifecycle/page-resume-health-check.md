# ADR: Page resume health check

## Status

Accepted.

## Context

Issue #31 reports that the extension can appear to disappear or stop responding after long-session tab lifecycle changes. Previous lifecycle slices made the status indicator recreatable and added sanitized content health status.

The next safe step is to run a bounded health check when a page resumes, gains focus, or becomes visible again. The check must not create duplicate observers, alter Legacy Mode hiding, or enable Native Mode virtualization.

## Decision

The content entrypoint listens for `pageshow`, window `focus`, and visible `visibilitychange` events. These events schedule one debounced resume health check.

The health check refreshes Native Mode guard state, verifies whether the extension-owned status indicator is still mounted, and only rebuilds message-manager state when the current state is not active or the overlay is missing. Empty recovery degrades status with a sanitized error class.

## Consequences

- Tab resume can recover extension-owned status UI without requiring a user click or full page reload.
- Duplicate startup work is avoided by reusing the existing observer and content-script state.
- The health signal stores no message text, raw HTML, tool output, credentials, or conversation identifiers.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
