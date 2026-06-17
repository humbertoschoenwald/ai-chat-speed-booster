# ADR: Tracked message id index

## Status

Accepted.

## Context

Long chat sessions can contain many managed turns. The DOM observer asks whether a discovered turn id is already tracked before adding it. Before this ADR, that check scanned the tracked message array.

This is a safe performance slice. It does not change Legacy Mode hiding, Load More behavior, Fast Mode fetch trimming, or Native Mode virtualization.

## Decision

`MessageManager` keeps a dedicated id-to-message map alongside the existing element-to-message map. The map is updated when messages are tracked, removed, initialized, or destroyed.

`hasTrackedMessageId` now uses the id map instead of scanning the message array.

## Consequences

- DOMObserver dedupe checks are bounded by map lookup instead of turn count.
- Legacy `display:none!important` behavior remains unchanged.
- This reduces one small repeated cost before any risky Native Mode virtualization work.
