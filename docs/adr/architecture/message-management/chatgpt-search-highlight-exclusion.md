# ADR: ChatGPT Search Highlight Exclusion

## Status

Accepted.

## Context

ChatGPT can render conversation search or highlight mirrors inside the thread. Those mirrors can
reuse conversation-turn-like section attributes while living under a search-result/highlight
container. They are not the canonical conversation turns and can expose flattened text outside the
normal assistant or user message layout.

The extension must not store private chat HTML, raw conversation text, or saved page snapshots as
fixtures. Regression coverage should use a minimal synthetic structure that captures only the
stable DOM relationship needed for the bug.

## Decision

The ChatGPT site profile excludes message-turn candidates under ancestors whose class contains
`convSearchResultHighlightRoot`. The content observer and direct load-more anchoring paths both use
the same message-turn filter before managing, counting, hiding, or anchoring turns.

## Consequences

- Search/highlight mirrors are left entirely under ChatGPT control.
- The extension manages only canonical conversation turns for hiding, load-more placement, and
  status counts.
- Regression tests avoid private HTML while preserving the DOM shape that caused the flattened-text
  bug.
