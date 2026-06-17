# ADR: ChatGPT native tuning profile

## Status

Accepted.

## Context

The Native engine should remain site-agnostic, but ChatGPT is the first and only page that should receive Native Mode tuning today. Provider-specific budgets and selector assumptions must live outside the shared engine so they do not contaminate Claude, Gemini, DeepSeek, Grok, or Search AI Mode.

## Decision

Add a ChatGPT tuning profile under `src/content/native/chatgpt/`. The profile records ChatGPT-specific selector assumptions, work budgets, enabled safe features, and blocked live features.

The profile is declarative. It does not mutate the page, freeze turns, compensate scroll, prune resources, or auto-recover generation state.

## Consequences

- ChatGPT-specific fine tuning has a dedicated home.
- The shared Native engine can read tuning metadata without hard-coding ChatGPT selectors globally.
- Risky live features remain blocked until they have separate implementation and coverage.
- Other site adapters remain planned and continue using DOM-only Legacy behavior.
