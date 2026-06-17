# ADR: Frozen turn cache model

## Status

Accepted.

## Context

Native Mode needs a full-fidelity restoration primitive before it can safely virtualize offscreen turns. The cache must never persist chat content, tool output, raw HTML, credentials, or conversation identifiers.

This slice introduces the model only. It does not wire freezing into live behavior, insert placeholders in production flow, or replace Legacy Mode hiding.

## Decision

Add a per-tab `FrozenTurnCache` that can move a hydrated turn element into an in-memory document fragment and restore it through an extension-owned placeholder.

The cache is keyed by the non-content turn key supplied by `TurnRegistry`. It reports sanitized counts and timestamps only.

## Consequences

- Native Mode has a reversible in-memory ownership model for future virtualization work.
- Frozen DOM remains inside the current tab process and is not persisted.
- Future scroll and accessibility work can restore all frozen records before disabling Native Mode or exporting diagnostics.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
