# ADR: Content bootstrap ownership heartbeat

## Status

Accepted.

## Context

Issue #31 reports popup loading and disappearing behavior during long sessions, tab resume, and extension reloads. The content script already avoids duplicate startup with a DOM-owned bootstrap marker, but a stale marker can survive when the browser replaces or restarts the extension context without the old script running normal cleanup.

A stale marker must not permanently block the new content script from answering status, restoring UI, or observing the page. A fresh marker from a still-running content script must still prevent duplicate observers and duplicate extension-owned UI.

## Decision

The content script owns a lightweight heartbeat alongside the bootstrap marker. A new content script instance acquires ownership when no marker exists, or when a marker exists but has no fresh heartbeat. A fresh heartbeat means another instance is still active, so the new instance exits without starting duplicate observers.

The heartbeat contains only timestamps and an opaque per-tab instance id. It never contains chat text, HTML, tool output, prompt text, conversation identifiers, credentials, or provider data.

## Consequences

- Stale ownership after extension reload can recover instead of leaving the popup stuck on loading.
- Fresh ownership still blocks duplicate observers and duplicate UI.
- The recovery path is additive and scoped to content-script lifecycle state.
- The heartbeat is removed when the owning content script unloads normally.

## Validation

Regression tests cover empty ownership, fresh-owner duplicate prevention, and stale-owner takeover for issue #31. Repository validation must run through the configured `validate` command when the command-layer validation directory is writable.
