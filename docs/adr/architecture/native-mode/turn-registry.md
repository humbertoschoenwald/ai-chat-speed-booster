# ADR: Native turn registry

## Status

Accepted.

## Context

Native Mode needs stable, non-content turn tracking before any virtualization, freezing, or tool-call grouping can safely run. Long sessions should not repeatedly rediscover the same DOM nodes or depend on message text for identity.

Legacy Mode already has its own message tracking and `display:none!important` hiding path. This ADR does not replace that path.

## Decision

Add a Native Mode `TurnRegistry` that keeps O(1) maps from structural turn keys to records, elements to records, and placeholders to records. It tracks role, hydration state, measured height metadata, pin reasons, and dirty measurement keys.

Stable keys prefer explicit non-content attributes such as `data-testid="conversation-turn-*"`. Attribute ids are accepted when present. Route-scoped structural fallback keys are marked uncertain and pinned so future virtualization cannot freeze them until selector confidence improves.

## Consequences

- Native Mode can build later schedulers on stable records instead of repeated full scans.
- No message text, tool output, raw HTML, credentials, or raw conversation IDs are persisted.
- Uncertain keys fail safe by keeping turns pinned.
- Legacy Mode hiding, Load More, and Fast Mode remain unchanged.
