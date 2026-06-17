# ADR: Native editor input guard

## Status

Accepted.

## Context

Long ChatGPT sessions can make editor operations feel slow when background extension work competes with typing, paste, copy, cut, selection, or IME composition.

The first Native Mode input slice must not change Legacy Mode, mutate clipboard contents, chunk pasted text, hide running or failed tool calls, or virtualize turns. It should only detect protected editor activity and expose a bounded signal for later schedulers.

## Decision

Native Mode owns an `EditorInputOptimizer` that listens for editor-focused real-time events only while Native Mode is active. The guard records event type, timestamp, composition state, and deferred task count.

The controller exposes whether background work should defer during the quiet window after editor activity or while IME composition is active. Later mutation, virtualization, tool-call, and cache schedulers can use this signal without storing text or changing the editor's native behavior.

## Consequences

- Legacy `display:none!important` hiding remains unchanged.
- Small paste, copy, cut, selection, and IME composition remain native browser behavior.
- No clipboard text, message text, raw HTML, or conversation identifiers are stored.
- This creates the safe scheduling boundary required before any heavier Native Mode optimization.
