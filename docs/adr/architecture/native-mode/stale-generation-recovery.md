# ADR: Stale generation recovery model

## Status

Accepted.

## Context

Long ChatGPT sessions can leave stale Stop controls or large composer gaps after rendering quiets down. Native Mode needs a detector before it can safely offer manual recovery.

The extension must not auto-click Stop by default, fake stream completion, or interrupt active generation.

## Decision

Add a `StaleGenerationRecovery` model that evaluates sanitized signals: last assistant mutation time, last tool mutation time, active-stream state, Stop-control presence, composer enabled state, bottom gap, and current time.

The model only reports whether stale Stop or stale bottom-gap conditions are detected after a quiet window. It performs no DOM mutation and no automatic recovery.

## Consequences

- Future Native Mode UI can offer manual recovery with clear preconditions.
- Active streams remain protected.
- Diagnostics contain timing and gap measurements only, never message text, raw HTML, tool output, credentials, or conversation identifiers.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
