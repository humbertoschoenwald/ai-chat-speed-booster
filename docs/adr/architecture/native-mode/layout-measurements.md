# ADR: ChatGPT layout measurements

## Status

Accepted.

## Decision

Record only safe turn measurements for ChatGPT Native layout planning: key, height, pin state, and timestamp. These measurements rebuild the full scroll model for a known turn order.

## Consequences

- Native Mode can warm start-to-end scroll geometry.
- The records do not include page text or HTML.
- Stable Mode remains separate.
