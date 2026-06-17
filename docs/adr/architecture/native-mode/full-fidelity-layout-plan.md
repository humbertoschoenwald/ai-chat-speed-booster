# ADR: ChatGPT full-fidelity layout plan

## Status

Accepted.

## Context

ChatGPT Native Mode must not behave like the stable mode hiding path. The user should be able to move from the first turn to the latest turn with every message conceptually available. Native Mode may cache layout metadata and decide what is immediately hydrated, but it must not treat offscreen content as hidden or lost.

Long sessions still need bounded work. The browser needs a start-to-end scroll model so Native Mode can reason about the full chat height, viewport range, overscan, pinned turns, and restorable cache candidates without relying on hard hiding.

## Decision

Add a ChatGPT-only full-fidelity layout plan. It computes deterministic start-to-end turn geometry from measured turn heights and a viewport window. The plan exposes:

- total scroll height,
- per-turn top, height, and bottom offsets,
- visible or pinned turn keys,
- cacheable offscreen turn keys,
- lookup by scroll offset.

This model does not mutate the DOM, hide messages, detach nodes, store text, store HTML, or persist conversation identifiers.

## Consequences

- Native Mode can build toward a powerful cache while preserving full-fidelity navigation.
- Layout math is explicit and testable before live virtualization or restoration ships.
- Running, failed, focused, selected, or otherwise pinned turns can remain immediately available even when far from the viewport.
- The stable mode hiding path remains separate.
