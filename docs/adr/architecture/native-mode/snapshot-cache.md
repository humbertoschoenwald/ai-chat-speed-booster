# ADR: ChatGPT snapshot cache

## Status

Accepted.

## Decision

Add a ChatGPT-only in-memory snapshot cache for lightweight readable turn previews. The cache is bounded by total bytes, per-entry bytes, and age. It renders escaped text-only markup and is cleared with the page session.

## Consequences

- Native Mode can later show lightweight readable previews for old turns.
- Persistent caches remain metadata-only.
- Rich original turns still need guarded restore behavior before this is used as a live page mutation feature.
