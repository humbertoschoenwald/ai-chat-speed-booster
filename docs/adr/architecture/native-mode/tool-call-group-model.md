# ADR: Tool-call group model

## Status

Accepted.

## Context

Native Mode must treat tool calls as first-class render units. Completed tool-call bodies may later be grouped or frozen, but running, failed, and user-expanded tool calls must remain hydrated and visible.

This slice introduces the model only. It does not hide, freeze, collapse, or restore live tool-call DOM.

## Decision

Add a `ToolCallGroupController` that indexes tool-like subtrees under a turn record, classifies groups as completed, running, failed, or user-expanded, and reports sanitized counts plus estimated node cost.

The controller uses structural selectors only and never reads or stores tool output text.

## Consequences

- Future Native Mode virtualization can pin running, failed, and user-expanded tool calls before grouping completed bodies.
- Diagnostics can reason about node cost without persisting content.
- No tool output is deleted or hidden by this slice.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
