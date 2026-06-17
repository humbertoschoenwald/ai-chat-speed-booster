# ADR: Diagnostic event bounds

## Status

Accepted.

## Context

Native Mode records small event details for selector, lifecycle, and recovery work. Those details must stay bounded before they are shown in popup or status surfaces.

## Decision

Native diagnostics now normalize retained event fields and cap retained strings to a fixed short length.

## Consequences

- Diagnostic events stay small.
- Future Native Mode subsystems can report concise state.
- Legacy Mode hiding, request counting, virtualization, and chat DOM behavior remain unchanged.
