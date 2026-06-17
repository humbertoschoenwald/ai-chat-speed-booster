# ADR: Multi-tab coordinator model

## Status

Accepted.

## Context

Native Mode must avoid global bottlenecks when many long-session tabs are open. Inactive tabs should keep nonessential work quiet and resume with bounded health checks.

This slice introduces the per-tab coordination model only. It does not change background messaging, storage writes, hiding, virtualization, or observer scheduling.

## Decision

Add a `MultiTabCoordinator` model that tracks active versus inactive state, skipped nonessential work count, and resume-check count.

The model is per-tab and reports sanitized counters only.

## Consequences

- Future schedulers can skip nonessential work in inactive tabs.
- Resume behavior can be measured without full conversation scans.
- No message text, raw HTML, tool output, credentials, or conversation identifiers are stored.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
