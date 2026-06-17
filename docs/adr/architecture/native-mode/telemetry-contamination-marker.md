# ADR: Telemetry contamination marker

## Status

Accepted.

## Context

Native Mode may eventually modify page rendering through freezing, restoration, or diagnostics overlays. The extension should be able to mark that a page was extension-modified without blocking telemetry or sending private content.

The marker must be optional and off by default when wired later.

## Decision

Add a model that can set a DOM marker attribute and emit a custom event with a schema version. Clearing the marker removes the attribute.

The marker carries only a version number. It does not read or emit message text, raw HTML, tool output, credentials, account data, model data, file data, billing data, or conversation identifiers.

## Consequences

- Future Native Mode features can transparently mark extension-modified pages.
- The marker is explicit and reversible.
- No telemetry endpoint is blocked or modified by this model.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
