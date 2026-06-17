# Site support notes

- Search AI mode is matched only when its required query flag is present.
- Ordinary search pages are intentionally unsupported.
- Existing chat adapters remain separate.
- Fetch trimming is not enabled for the search AI adapter.

## DeepSeek

DeepSeek support is DOM-only. The adapter uses DeepSeek's virtual-list item roots (`.ds-virtual-list-visible-items > [data-virtual-list-item-key]`) as message turns and `.ds-virtual-list.ds-scroll-area` as the scroll container.

Generic selectors such as `[class*="message"]`, `[role="article"]`, and `[data-message-id]` are intentionally avoided because they either do not exist or match inner message content instead of full turns. Fetch trimming is not enabled for DeepSeek until the conversation endpoints are verified.
