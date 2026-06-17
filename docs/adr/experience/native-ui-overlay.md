# ADR: Native UI overlay model

## Status

Accepted.

## Context

Native Mode needs a manual recovery and diagnostics surface before live virtualization actions ship. The first model should be content-free and should not mount UI or alter chat DOM.

## Decision

Add a `NativeUiOverlay` model that tracks visibility and bounded manual commands such as restore-all and panel open/close.

The model is state-only. It does not render UI, read chat content, move DOM nodes, or change extension hiding behavior.

## Consequences

- Future Native diagnostics can expose manual recovery with bounded state.
- Commands are limited and do not store message text, raw HTML, tool output, or conversation identifiers.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
