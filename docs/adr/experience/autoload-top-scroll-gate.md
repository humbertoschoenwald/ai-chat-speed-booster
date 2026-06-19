# ADR: Auto Load Top Scroll Gate

## Status

Accepted.

## Context

Auto Load Beta reveals an older turn when the user reaches the top of a long conversation. A
previous implementation tried to prevent repeated triggers by scrolling the container back down
after revealing a turn. That made some conversations feel blocked before the actual beginning.

## Decision

Auto Load uses a small scroll gate: reveal only when hidden turns remain, the scroll position is
near the top, and the cooldown has elapsed. The gate never mutates scroll position. Browser scroll
anchoring and the host page own viewport stability after the reveal.

## Consequences

- Users can continue scrolling to the real beginning of the conversation.
- Repeated top triggers are throttled without hiding the top behind a corrective scroll.
- The scroll policy is covered by a pure model test instead of timing-sensitive browser behavior.
