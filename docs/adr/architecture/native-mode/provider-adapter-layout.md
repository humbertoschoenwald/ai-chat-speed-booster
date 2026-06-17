# ADR: Native provider adapter layout

## Status

Accepted.

## Context

Native Mode needs a stable engine while allowing each provider to evolve independently. ChatGPT is the only enabled Native target today, but the registry should already make future provider work explicit.

## Decision

Keep one provider adapter file per supported site under `src/content/native/<provider>/`. The central registry imports those adapters and decides whether each provider is enabled or planned.

## Consequences

- ChatGPT-specific tuning can grow under `src/content/native/chatgpt/` without leaking into other providers.
- Planned providers have explicit adapter records while remaining blocked from Native Mode.
- DOM-only Legacy support remains unchanged for non-ChatGPT providers.
