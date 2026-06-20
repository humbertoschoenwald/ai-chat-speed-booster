# ADR: Native Mode Boundary

## Status

Accepted.

## Context

The extension currently has a robust legacy path for reducing long-chat rendering cost. The planned Native Mode is more precise and more fragile because it depends on ChatGPT frontend structure that can change without notice.

The planned repair must also respect browser-extension boundaries. It cannot delete user content, store private conversation text, or assume the host page will keep the same React tree, selectors, streaming state, tool-call markup, or composer behavior.

## Decision

Add Native Mode as an explicit experimental mode instead of replacing the legacy behavior.

Native Mode must be additive, reversible, selector-guarded, diagnostics-driven, and off or
conservative by default. Conflicting legacy controls may be paused while Native Mode is active, but
their saved values must be preserved.

Native Mode is currently ChatGPT-only. Runtime policy must coerce any saved Native preference back
to Stable on every other site, and the popup must hide Native controls completely outside ChatGPT.

Native Mode must not delete chat content. Persistent storage may contain only safe metadata such as measurements, timestamps, schema versions, and non-content structural keys. Full DOM freezing is allowed only as an ephemeral per-tab runtime technique and must be restored on demand.

Every invasive Native Mode behavior must have a user-facing setting or a conservative default, diagnostics, and a rollback path. This includes virtualization, editor input protection, telemetry contamination marking, resource pruning, tool-call grouping, stale layout recovery, and multi-tab scheduling.

Stable Mode and Native Mode are separate runtime paths. Fast loading is an internal Stable
acceleration layer, not a third popup mode. Native Mode derives an effective runtime configuration
that disables Stable-only Fast loading, Auto Load, Hide Old Turns, and floating status behavior
without overwriting the user's saved Stable preferences. The popup must render status text from the
effective runtime mode, not from the saved Fast-loading preference.

Switching between Stable and Native schedules a page reload so provider DOM state, fetch trimming,
and native runtime state cannot coexist in one ChatGPT document.

Delivery-timeout auto-refresh is not a Stable-only control. It may run in either effective mode
after a structural ChatGPT delivery-timeout signal remains visible for the configured grace period.

## Consequences

Implementation work must preserve Legacy Mode and add new Native Mode slices in atomic commits. Any behavior that affects virtualization, editor input, telemetry marking, resource pruning, accessibility, full-fidelity restoration, or multi-tab scheduling needs documentation or ADR coverage.

The mode may fail open or disable itself when selector health is uncertain.

The implementation should treat Lighthouse-style performance and ten-tab ChatGPT stress behavior as engineering benchmarks, not as permission to game metrics or break ChatGPT functionality.

Architecture-boundary tests must prevent the generic content entrypoint from importing ChatGPT
detectors, native snapshot renderers, token estimators, or turn-specific provider logic directly.
Provider-specific behavior belongs behind the ChatGPT content runtime adapter. Adding a Native Mode
surface for another provider requires its own adapter tests and ADR update.
