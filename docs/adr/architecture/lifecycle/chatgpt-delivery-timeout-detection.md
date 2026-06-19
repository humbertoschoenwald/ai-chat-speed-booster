# ChatGPT Delivery Timeout Detection

Status: accepted

## Context

Saved ChatGPT HTML evidence showed a retryable message-delivery failure rendered as an assistant message error surface. Product code must not store raw saved chat HTML or private conversation text in the public repository, so only structural findings are preserved here.

The observed product-safe signature is:

- an assistant message container using `data-message-author-role="assistant"`;
- an error-styled container containing `text-token-text-error` in its class list;
- a retry button with `data-testid="regenerate-thread-error-button"`;
- visible copy equivalent to `Message delivery timed out. Please try again.`.

## Decision

AI Chat Speed Booster detects ChatGPT delivery-timeout state through a small ChatGPT-specific detector. The detector prefers structural signals: the retry button near an assistant error container. Visible text is only a fallback and is not sufficient by itself.

The first implementation only marks the content lifecycle as degraded and exposes diagnostic status fields. It does not automatically refresh the page, retry generation, or claim exact SSE or conversation-limit behavior.

## Safety Rules

- Do not persist raw chat HTML, message text, conversation IDs, or private content in repo files.
- Treat host selectors and Statsig or boot payload values as unstable reverse-engineered evidence, not stable API contracts.
- Do not claim exact token, conversation-length, retry, or timeout limits from this evidence.
- Any future reload or refresh recovery must preserve composer draft text before the page can change.
- Automatic recovery must be conservative and covered by tests before it can be enabled.

## Consequences

The popup/status diagnostics can surface a recoverable ChatGPT delivery-timeout condition without relying on private content. Future recovery work can build on this detector, but must stay opt-in or conservative until draft-preservation and reload behavior are fully validated.
