# ADR: OpenAI Native (Imaginary) Mode Boundary

## Status

Proposed.

## Context

The extension currently has a robust legacy path for reducing long-chat rendering cost. The planned Native Mode is more precise and more fragile because it depends on ChatGPT frontend structure that can change without notice.

The planned repair must also respect browser-extension boundaries. It cannot delete user content, store private conversation text, or assume the host page will keep the same React tree, selectors, streaming state, tool-call markup, or composer behavior.

## Decision

Add OpenAI Native (Imaginary) Mode as an explicit experimental mode instead of replacing the legacy behavior.

Native Mode must be additive, reversible, selector-guarded, diagnostics-driven, and off or conservative by default. Conflicting legacy controls may be paused while Native Mode is active, but their saved values must be preserved.

Native Mode must not delete chat content. Persistent storage may contain only safe metadata such as measurements, timestamps, schema versions, and non-content structural keys. Full DOM freezing is allowed only as an ephemeral per-tab runtime technique and must be restored on demand.

Every invasive Native Mode behavior must have a user-facing setting or a conservative default, diagnostics, and a rollback path. This includes virtualization, editor input protection, telemetry contamination marking, resource pruning, tool-call grouping, stale layout recovery, and multi-tab scheduling.

## Consequences

Implementation work must preserve Legacy Mode and add new Native Mode slices in atomic commits. Any behavior that affects virtualization, editor input, telemetry marking, resource pruning, accessibility, full-fidelity restoration, or multi-tab scheduling needs documentation or ADR coverage.

The mode may fail open or disable itself when selector health is uncertain.

The implementation should treat Lighthouse-style performance and ten-tab ChatGPT stress behavior as engineering benchmarks, not as permission to game metrics or break ChatGPT functionality.
