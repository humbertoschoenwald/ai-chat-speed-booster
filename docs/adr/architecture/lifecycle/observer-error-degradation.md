# ADR: Observer error degradation

## Status

Accepted.

## Context

Issue #31 requires the extension to keep responding even when observer-driven recovery work hits an unexpected error. A MutationObserver callback should not leave popup status stuck on loading or silently kill later health signals.

The recovery path must stay small and must not change Legacy Mode hiding or introduce Native Mode virtualization.

## Decision

DOMObserver invokes content callbacks through a guarded callback runner. If a callback throws, DOMObserver logs the failure and reports the phase plus error object to the content entrypoint.

The content entrypoint marks lifecycle state as degraded, records a sanitized recoverable error class, and refreshes the UI so popup status remains available.

## Consequences

- Observer callback failures become visible as degraded status instead of an unresponsive popup.
- The recorded error class contains no message text, raw HTML, tool output, credentials, or conversation identifiers.
- Existing Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
