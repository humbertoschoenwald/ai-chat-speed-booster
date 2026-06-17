# ADR: Extension UI lifecycle recovery

## Status

Accepted.

## Context

Issue #31 reports that the extension can appear to reload, disappear, or stop responding during long sessions. A low-risk cause is host-page re-rendering: a supported chat surface can remove extension-owned UI while the content script still holds a stale element reference.

Legacy message hiding remains unchanged. This ADR does not replace `.acsb-hidden` or change the existing `display:none!important` behavior used by Legacy Mode.

## Decision

Extension-owned status UI treats a detached DOM node as missing. On the next status update, the content script recreates the status indicator instead of updating a stale detached reference.

This is intentionally smaller than Native Mode virtualization. It is a safe lifecycle recovery slice for issue #31 and does not change message hiding, Load More behavior, fetch trimming, request counting, or browser-store metadata.

## Consequences

- Host removal of the status indicator is recoverable without a tab reload.
- The fix is additive and preserves Legacy Mode behavior.
- Regression coverage proves the status indicator returns after simulated host removal.
- More invasive recovery states, idempotent bootstrap diagnostics, and Native Mode scheduling remain separate follow-up work.
