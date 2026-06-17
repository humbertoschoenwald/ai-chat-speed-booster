# ADR: Mutation batch diagnostics

## Status

Accepted.

## Context

Native Mode and issue #24 require bounded mutation processing before any freezing, virtualization, or scroll compensation can safely ship. The content script currently observes the page body and scans added or removed subtrees for chat turns.

The first safe observer slice should improve ownership rules and observability without changing Legacy Mode rendering or hiding behavior.

## Decision

The DOM observer classifies mutation batches as small, heavy, or extreme, records sanitized scan diagnostics, skips extension-owned UI roots before subtree queries, and avoids rescanning the same element within a batch.

Direct message-turn matches are still handled first. Subtree queries only run for non-extension-owned roots that are not already scanned in the same batch.

## Consequences

- Extension-owned status and Load More UI mutations do not feed message-turn scans.
- Heavy observer work becomes visible through sanitized counters.
- This is a foundation for later Native Mode scheduling and #24 diagnostics.
- No message text, raw HTML, tool output, credentials, or conversation identifiers are stored.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
