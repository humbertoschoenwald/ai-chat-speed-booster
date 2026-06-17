# ADR: ChatGPT native safety wrapper

## Status

Accepted.

## Context

The generic Native feature gate can decide whether work is allowed from basic runtime state. ChatGPT still needs a stricter site-specific safety layer because this is the first provider being tuned deeply.

## Decision

Add a ChatGPT safety wrapper under `src/content/native/chatgpt/`. It inherits generic Native feature decisions, then blocks live page-mutation features that are not ready for production tuning.

The safe large-input planning path remains available during protected input because it does not store clipboard text or mutate the page by itself.

## Consequences

- ChatGPT can be tuned more aggressively without making live virtualization global.
- Risky features such as turn freezing, restoration, tool grouping, resource cleanup, and telemetry marking stay blocked until separately implemented and tested.
- The shared Native engine remains generic while ChatGPT owns stricter policy.
