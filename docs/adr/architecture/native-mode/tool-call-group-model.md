# ADR: Tool-call group model

## Status

Accepted.

## Context

Native Mode must treat tool calls as first-class render units. Completed tool-call bodies may later be grouped or frozen, but running, failed, and user-expanded tool calls must remain hydrated and visible.

This slice now also owns a completed-tool static summary treatment. The treatment keeps the original card in place, uses CSS containment rather than `display: none`, and rolls back whenever a tool call looks running, failed, or user-expanded.

## Decision

Add a `ToolCallGroupController` that indexes tool-like subtrees under a turn record, classifies groups as completed, running, failed, or user-expanded, and reports sanitized counts plus estimated node cost.

Completed groups are eligible for a ChatGPT-only summary controller only when the group is closed and has no active loading, spinner, busy, streaming, failed, retry, or user-expanded signal. The controller injects an ACSB-owned summary label and containment attributes while preserving ChatGPT-owned DOM.

The controller uses structural selectors only and never stores tool output text.

## Consequences

- Future Native Mode virtualization can pin running, failed, and user-expanded tool calls before grouping completed bodies.
- Diagnostics can reason about node cost without persisting content.
- No tool output is deleted or hidden by this slice.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
