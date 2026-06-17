# ADR: Spacer plan

## Status

Accepted.

## Context

Native Mode needs a measured geometry plan before any page-changing behavior ships. This plan should be data-only and derived from existing turn measurement metadata.

## Decision

Add a `SpacerPlan` model that converts a measured turn record into a key plus a rounded pixel height.

## Consequences

- Future geometry-preserving work has a simple metadata contract.
- Unmeasured turns produce no spacer plan.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
