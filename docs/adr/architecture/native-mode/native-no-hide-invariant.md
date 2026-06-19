# Native no-hide invariant

## Status

Accepted.

## Context

Native mode must improve long ChatGPT conversation responsiveness without making provider-owned message content disappear. Hiding or replacing React-managed message children can confuse provider reconciliation, break streaming or tool-call UI, and make stable mode harder to reason about after a mode switch.

## Decision

Native mode must preserve provider-owned message DOM. It must not hide message children, replace message turns with alternate text snapshots, or depend on invisible React-managed content to keep layout stable.

Safe optimization surfaces are limited to non-destructive behavior:

- readonly text caching for diagnostics and future scheduling decisions,
- turn-level containment that does not hide content,
- observer throttling and mutation batching,
- visible-turn prioritization,
- tool-call summary handling that preserves active state and restores expanded content,
- cleanup paths that remove only extension-owned artifacts.

## Follow-up implementation map

- Turn content visibility should apply only safe containment and prioritization.
- Height caching should preserve layout without replacing provider nodes.
- DOM phase batching and scroll scheduling should reduce work without hiding active UI.
- Tool-call compaction must skip active, running, failed, or user-expanded tool calls.

## Consequences

The extension may trade some theoretical maximum performance for correctness and native-feeling behavior. This keeps ChatGPT content visible, preserves React ownership, and makes stable/native mode transitions safer.
