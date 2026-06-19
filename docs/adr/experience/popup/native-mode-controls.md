# ADR: Native mode popup controls

## Status

Accepted.

## Context

Native Mode needs user-facing controls before aggressive behavior ships. The popup must expose the mode boundary without deleting or overwriting existing Legacy settings.

Legacy Mode remains the default and keeps existing Fast Mode, Auto Load, Hide Old Turns, visible limit, batch size, status indicator, theme, and request-counter behavior.

## Decision

Expose Native Mode as a single experimental toggle on ChatGPT only rather than a prominent mode
selector. Most users do not need to reason about architecture names; the popup should make the risk
clear and keep the rest of the surface as ordinary boolean controls.

Non-ChatGPT sites must not show Native Mode controls, warnings, or diagnostics yet. Their popup
surface stays Stable-only until that provider has a tested native adapter and a provider-specific
ADR accepts the added behavior.

Fast Mode, Auto Load, Hide Old Turns, visible-count controls, and the floating status badge are
Stable-only controls. They are hidden and disabled while Native Mode is effectively active so their
saved Stable values cannot leak into Native status copy or runtime behavior.

Delivery-timeout auto-refresh is mode-neutral and stays visible in both Stable and Native Mode.

Native Mode shows guarded diagnostics and an experimental warning. Switching between Stable and
Native requires a page reload so the two runtimes do not mix in the same ChatGPT document.

## Consequences

- Users can opt into Native Mode without losing Legacy values.
- The popup makes experimental Native Mode status visible without presenting it as the main product
  workflow.
- Gemini, Claude, Grok, Perplexity, DeepSeek, and Search AI Mode do not expose unsupported Native
  concepts.
- Existing Legacy controls remain present and stored values are preserved.
- Native Mode cannot display Fast Mode count-disabled status text.
- No chat text, raw HTML, tool output, or conversation identifiers are shown or stored by the popup controls.
