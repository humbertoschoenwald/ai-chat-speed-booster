# ADR: Native execution plan

## Status

Accepted.

## Context

Native Mode should not start features directly from a user setting. The engine needs a bounded plan that combines extension state, site adapter support, and provider tuning metadata before any native subsystem can run.

## Decision

Add a `NativeExecutionPlan` model. The plan decides whether Native Mode can start, which features are active, which features are blocked, and which work budgets are available.

For now, only ChatGPT can produce a startable plan. Planned providers produce blocked plans with no active features and no runtime budgets.

## Consequences

- Feature startup has one auditable gate before page-specific tuning runs.
- Planned providers cannot accidentally run ChatGPT tuning.
- Risky live features stay blocked until they receive separate implementation, diagnostics, and tests.
