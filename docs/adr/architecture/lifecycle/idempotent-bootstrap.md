# ADR: Idempotent content bootstrap

## Status

Accepted.

## Context

Issue #31 includes lifecycle recovery and duplicate startup risk. A content script may be injected or evaluated more than once across tab lifecycle changes, extension reloads, or browser edge cases.

Duplicate content owners could create duplicate observers, event listeners, or extension UI if bootstrap is not guarded.

## Decision

The content script claims a document-level ownership marker before starting observers and UI. If another ACSB instance already owns the page, the later instance exits before registering config, message, observer, or resume handlers.

The owner removes the marker during unload. If bootstrap fails after claiming ownership, the catch path clears the marker and records a sanitized degraded error class so a later attempt can recover.

## Consequences

- Duplicate bootstrap attempts fail closed before creating duplicate observers or UI.
- A failed bootstrap does not permanently poison the page.
- The marker contains no message text, raw HTML, tool output, credentials, or conversation identifiers.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
