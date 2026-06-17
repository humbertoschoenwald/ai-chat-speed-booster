# ADR: Native feature gate

## Status

Accepted.

## Context

Native Mode has several standalone models. They need one shared allow or deny contract before orchestration uses them.

## Decision

Add a `NativeFeatureGate` model that returns a small decision from active mode, selector health, and protected input state.

## Consequences

- Future orchestration has a shared safety gate.
- Protected input blocks heavier native work except large input planning.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
