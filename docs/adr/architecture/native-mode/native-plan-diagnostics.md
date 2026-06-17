# ADR: Native plan diagnostics

## Status

Accepted.

## Context

Native Mode must stay ChatGPT-only today while exposing enough diagnostics to prove that the shared engine and provider tuning profile are not accidentally running on other providers.

## Decision

Expose the Native execution plan through content status and popup diagnostics. The plan reports whether Native Mode can start, why it can or cannot start, the active safe feature list, blocked feature list, and the current ChatGPT work budgets.

## Consequences

- Planned providers can show a clear block reason instead of appearing silently broken.
- ChatGPT tuning budgets are visible without enabling risky live virtualization.
- The popup can distinguish adapter support from selector health, input protection, observer work, and execution-plan state.
