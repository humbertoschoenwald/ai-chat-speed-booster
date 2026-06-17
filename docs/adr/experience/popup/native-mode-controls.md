# ADR: Native mode popup controls

## Status

Accepted.

## Context

Native Mode needs user-facing controls before aggressive behavior ships. The popup must expose the mode boundary without deleting or overwriting existing Legacy settings.

Legacy Mode remains the default and keeps existing Fast Mode, Auto Load, Hide Old Turns, visible limit, batch size, status indicator, theme, and request-counter behavior.

## Decision

Add a performance-mode selector with Stable and Native options. Native Mode reveals guarded panels for diagnostics, Tool Calls / MCP, Native overrides, and Safety / Reset.

The panels are intentionally descriptive while the risky features remain disabled. They explain what is not active yet: virtualization, freezing, scroll compensation, and completed tool-call grouping.

## Consequences

- Users can opt into Native Mode without losing Legacy values.
- The popup makes experimental Native Mode status visible before virtualization work begins.
- Existing Legacy controls remain present and stored values are preserved.
- No chat text, raw HTML, tool output, or conversation identifiers are shown or stored by the popup controls.
