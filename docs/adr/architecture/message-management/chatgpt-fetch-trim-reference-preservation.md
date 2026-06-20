# ADR: ChatGPT fetch trim reference preservation

## Status

Accepted.

## Context

Fast Mode trims ChatGPT conversation API responses before the ChatGPT frontend renders the
conversation. The response `mapping` can contain node IDs that the frontend may still dereference
outside the current visible parent chain. Removing older mapping entries can therefore make the
host frontend read fields from an undefined node.

Observed frontend failures include errors shaped like reading `role` from undefined and using the
`in` operator on undefined while rendering ChatGPT conversation data. These errors are consistent
with a host application receiving an internally incomplete conversation mapping.

## Decision

ChatGPT tree-walk trimming keeps every original mapping node addressable in the response. The
current parent chain is still rewired so older visible turns are skipped, but orphaned older nodes
remain present for host-side lookups, branch metadata, and defensive rendering paths.

The extension must not fabricate message content or persist raw conversation data while doing this.

## Consequences

- ChatGPT can dereference original mapping IDs after Fast Mode trimming.
- The rendered current chain remains bounded to the configured recent-turn window.
- Network payload reduction is less aggressive for ChatGPT, but host compatibility is safer.
- DOM hiding remains the Stable Mode reveal mechanism and follows
  `stable-fast-logical-message-contract.md` for logical message counts.
- The retired full-conversation reload bypass must not return; exhausted or API-trimmed Stable
  batches hide the load control instead of disabling Fast loading and refreshing the page.
