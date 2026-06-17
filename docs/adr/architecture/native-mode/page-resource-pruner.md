# ADR: Page resource pruner model

## Status

Accepted.

## Context

Native Mode may eventually clean up consumed preload references after the host page has settled. Resource cleanup must never run during protected editor input and must not touch safety, auth, billing, account, model, file, or conversation-write endpoints.

This slice introduces the model only. It does not remove resources from live pages.

## Decision

Add a `PageResourcePruner` model that can collect preload link candidates and mark them as consumed only when input is not protected.

The model reports sanitized counts only and does not inspect response bodies, request payloads, or conversation content.

## Consequences

- Future memory-pressure work has a guardable resource-pruning boundary.
- Editor input remains protected because pruning can be blocked by input activity.
- No private content or endpoint payloads are read or stored.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
