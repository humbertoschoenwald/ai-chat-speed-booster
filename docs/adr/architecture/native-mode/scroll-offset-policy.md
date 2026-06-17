# ADR: Scroll offset policy

## Status

Accepted.

## Context

Native Mode needs a separate scroll decision layer before future geometry work changes page position.

## Decision

Add a `ScrollOffsetPolicy` that decides whether an observed height delta is large enough to apply and blocks adjustment while oscillation is detected.

## Consequences

- Future scroll work has a small numeric contract.
- Oscillation fails open by avoiding forced offset changes.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
