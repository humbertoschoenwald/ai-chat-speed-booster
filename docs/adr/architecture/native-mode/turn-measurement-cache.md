# ADR: Turn measurement cache model

## Status

Accepted.

## Context

Native Mode needs persistent measurement metadata before scroll-stable virtualization can safely restore geometry across page sessions. Persistent storage must never contain message text, tool output, raw HTML, credentials, raw conversation identifiers, or uncertain route-scoped keys.

This slice introduces the cache model only. It does not wire live virtualization, freezing, placeholder insertion, or scroll compensation.

## Decision

Add a bounded `TurnMeasurementCache` that stores only schema version, stable non-content test-id keys, role, measured height, measurement timestamp, and feature flags.

The cache rejects uncertain keys and non-test-id keys. It stores at most 200 records and can load/save through extension storage when a future Native Mode scheduler chooses to use it.

## Consequences

- Future Native Mode virtualization can reuse safe height metadata.
- Persistent cache contents remain metadata-only and content-free.
- Keys that could contain route context or raw identifiers are not persisted.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
