# ADR: Stable and Fast logical message contract

## Status

Accepted.

## Context

Stable Mode is the portable runtime for every supported AI chat site. It must remain driven by
`sites.config.json` selectors and site metadata instead of hard-coded ChatGPT behavior. Native Mode
is the ChatGPT-only experimental runtime and must stay separate.

The extension previously mixed two concepts:

- DOM turn elements, such as a user bubble and an assistant bubble.
- User-visible chat messages, where one message means one user prompt and the assistant response
  that follows it. Internal tool, thinking, markdown, or nested response nodes are not separate
  user-visible messages.

This made Stable/Fast copy, counts, and batch sizing drift. It also encouraged a retired pattern
where a trimmed Fast Mode conversation exposed a load control that disabled trimming and refreshed
the page.

## Decision

Stable Mode owns DOM hiding and manual batch reveal. Its visible limit and Load More batch size are
logical message counts. The site configuration may declare how many managed DOM turn elements make
one logical message; ChatGPT-style user-plus-assistant layouts use two, while response-only layouts
can use one. The Stable engine remains generic and reads that shape from the site adapter metadata.

Stable Mode shows the newest initial batch first. Older managed turns are literally hidden from the
page flow until the user clicks Load More. Load More reveals exactly the configured next logical
batch and never expands to the full conversation.

Fast loading is not a separate user-visible mode inside Stable. When enabled in stored config, it
may trim the initial provider API response to reduce first paint cost, using the same logical
message unit metadata. It must not show a separate Fast Mode status, disable counts, or expose a
button that turns Fast loading off and reloads the page. If a conversation was API-trimmed and no
older DOM turns are available yet, Stable hides the Load More control rather than presenting a
misleading action.

Native Mode remains ChatGPT-only. Switching between Stable and Native may reload the active
ChatGPT tab so the provider DOM, MAIN-world fetch patch, and Native runtime never share stale
state.

## Consequences

- Popup status always reports Stable counts when Stable is effective, even when Fast loading is
  enabled internally.
- Native status copy cannot inherit Fast loading copy or Stable hidden-count wording.
- Stable tests must distinguish logical hidden message counts from physical hidden DOM element
  counts.
- The retired Fast Mode refresh/load-full bypass must not return.
- Future provider tuning belongs in site metadata, not in the Stable engine.
