# ADR: Content health status

## Status

Accepted.

## Context

Issue #31 reports extension loading, disappearance, or recovery ambiguity during long sessions. The popup and diagnostics need a low-risk health signal before larger lifecycle recovery work adds idempotent bootstrap and page-resume checks.

The status signal must not change Legacy Mode rendering or Native Mode virtualization behavior.

## Decision

The content entrypoint tracks a sanitized lifecycle state, boot time, last UI refresh timestamp, overlay presence, and last recoverable error class. Status responses include these fields along with existing message counts and Native Mode guard state.

The health payload does not include message text, raw HTML, tool output, credentials, raw conversation IDs, DOM references, or selector-matched content.

## Consequences

- Popup and regression tests can distinguish active, recovering, degraded, unsupported, and stopped states in later slices.
- Status can report whether extension-owned UI is currently mounted.
- This provides issue #31 diagnostics without changing Legacy `display:none!important` behavior.
