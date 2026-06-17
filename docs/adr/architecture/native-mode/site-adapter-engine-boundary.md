# ADR: Native site adapter engine boundary

## Status

Accepted.

## Context

Native Mode needs a stable cross-site engine, but it must not optimize every supported chat surface immediately. ChatGPT is the first target for site-specific tuning. Other adapters can keep DOM-only Legacy behavior until their Native Mode selectors, render loops, and recovery rules are proven.

## Decision

Split Native Mode into two layers:

- A site-agnostic Native engine that decides whether Native Mode can start for the current site.
- Site-specific adapters under `src/content/native/<site>/` for fine-tuned behavior.

Only the ChatGPT adapter is enabled today. Claude, Gemini, DeepSeek, Grok, and Search AI Mode are registered as planned adapters. Planned adapters intentionally block Native Mode while preserving their existing DOM-only extension support.

## Consequences

- Native Mode cannot accidentally contaminate or tune non-ChatGPT pages.
- Future adapters have a clear registration point and capability contract.
- ChatGPT-specific optimizations can move under `src/content/native/chatgpt/` without becoming global behavior.
- Legacy Mode and DOM-only site support remain unchanged for other providers.
