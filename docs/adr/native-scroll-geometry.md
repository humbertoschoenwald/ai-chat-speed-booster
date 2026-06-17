# ADR: Native scroll geometry diagnostics

## Status

Accepted.

## Context

Issue #24 and the Native Mode plan both identify scroll-height oscillation, host re-rendering, and viewport instability as risks in long ChatGPT sessions. Legacy Mode uses `display:none!important` and must remain unchanged until a separate Native Mode virtualization path is proven safe.

Before Native Mode changes layout, it needs a small diagnostics model that can detect scroll deltas and oscillation without mutating the DOM.

## Decision

Add a `ScrollGeometry` helper that samples scroll position, scroll height, and viewport height for either `window` or an element scroller. It can compare two samples, record deltas, flag alternating large scroll-height changes as oscillation, and expose a sanitized snapshot.

The helper is diagnostics-only in this slice. It does not compensate scroll, insert placeholders, hide turns, restore turns, or alter Legacy Mode behavior.

## Consequences

- Future Native Mode virtualization can be gated on measured geometry instead of assumptions.
- Issue #24 follow-up work can detect host reveal or hide loops before disabling sub-features.
- No chat content, raw HTML, tool output, or conversation identifiers are stored.
- Legacy `display:none!important` hiding remains unchanged.
