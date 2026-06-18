# ADR: Native render-unit budget

## Status

Accepted.

## Context

Local HTML diagnostics showed that message count is not a reliable proxy for runtime cost. A single tool-heavy assistant turn can contain hundreds of nodes, many buttons, many SVGs, and many tool-message nodes. Native Mode therefore needs a render-unit cost signal in addition to turn count.

## Decision

Native Mode computes an in-memory render-unit budget during ChatGPT snapshot synchronization. The budget combines turn node cost with ToolCallGroupController cost and derives the live snapshot window from total estimated render cost.

The trigger is the existing Native ChatGPT snapshot sync path. The scheduler remains bounded by the existing background-work deferral guard: the sync path does not run while editor input or protected Native work is active.

The data model stores only counts and costs:

- turn count,
- estimated turn node cost,
- estimated tool node cost,
- running, failed, completed, and total tool-call groups,
- chosen live window size.

It does not store raw text, HTML, tool output, credentials, or raw conversation IDs.

## Rollback

If Native Mode is disabled, unsupported, or conflict-disabled, the renderer restores hydrated content, clears the turn registry and tool-call groups, and drops the render-unit budget snapshot.

## Diagnostics

The popup Native diagnostics now include render cost, turn cost, tool cost, tool group count, and live window size. These values prove that Native Mode is budgeting by render-unit cost, not only by message count.

## Validation

Model tests cover a tool-heavy turn shrinking the live window and normal low-cost turns preserving the configured Native window.
