# ADR: Freeze precondition model

## Status

Accepted.

## Context

Native Mode should not freeze a turn simply because it is outside the viewport. It must first prove the turn is measured, unpinned, safe by role, and outside the active render window.

## Decision

Add a `FreezePrecondition` model that returns an allow or block decision for a turn record. The model only reads turn metadata and the caller-provided visible-window state.

## Consequences

- Future freezing work has an explicit safety gate.
- Pinned, visible, unmeasured, placeholder, system, and unknown-role turns stay hydrated.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
