# ADR: Virtualization conflict detector

## Status

Accepted.

## Context

Issue #24 reports that host-page virtualization can fight extension-managed hiding or future Native Mode virtualization. Legacy Mode must keep its current `display:none!important` behavior, while Native Mode needs diagnostics that can disable only risky Native sub-features later.

## Decision

Add a model that records host reveal loops and scroll-height oscillation signals. The model reports whether future Native virtualization should be disabled after repeated conflict signals.

This slice is diagnostic-first. Legacy hiding still uses the existing hard-hide path; if a host page removes that class from a turn the extension still considers hidden, the extension records a reveal-loop counter and reapplies the existing class. It does not add placeholders, compensate scroll, or introduce Native virtualization.

## Consequences

- Future Native Mode virtualization can fail open when host-page ownership conflicts appear.
- Issue #24 has a dedicated diagnostic model without changing the existing Legacy behavior.
- Diagnostics contain counters and reasons only, never message text, raw HTML, tool output, credentials, or conversation identifiers.
