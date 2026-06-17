# ADR: Runtime budget model

## Status

Accepted.

## Context

Native Mode needs shared budget accounting for observer, restore, tool-call, and resource work. Budget accounting should be available before live schedulers mutate the page.

## Decision

Add a small `RuntimeBudget` model that records observed duration, fixed budget, current over-budget state, and cumulative over-budget count.

## Consequences

- Future schedulers can share one bounded budget contract.
- Diagnostics remain numeric and content-free.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
