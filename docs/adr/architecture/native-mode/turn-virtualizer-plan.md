# ADR: Turn virtualizer plan

## Status

Accepted.

## Context

Native Mode needs scroll-stable virtualization, but live freeze and restore behavior must remain separate from planning until it is proven safe. The planner must keep pinned, unmeasured, active, or uncertain turns hydrated and must not mutate the chat DOM.

## Decision

Add a `TurnVirtualizer` planner that inspects turn records, viewport bounds, and overscan. It produces decisions to keep hydrated, mark as freeze candidates, or mark as restore candidates.

The planner is decision-only. It does not insert placeholders, move nodes, compensate scroll, hide content, or persist content.

## Consequences

- Future Native Mode virtualization has an explicit safety boundary before DOM mutation.
- Pinned and unmeasured turns fail open and remain hydrated.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
