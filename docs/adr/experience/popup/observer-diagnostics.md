# ADR: Popup observer diagnostics

## Status

Accepted.

## Context

Mutation batch diagnostics are useful only if they can be inspected without a debugger. Native Mode already exposes guarded diagnostics in the popup, and the content script can now report sanitized observer batch counters.

The popup must not expose raw DOM, message text, HTML, tool output, credentials, or conversation identifiers.

## Decision

The content status payload includes the last observer batch class, batch size, duration, and over-budget count. The popup renders a compact observer summary inside the Native diagnostics panel.

The observer summary is diagnostic only. It does not change observer scheduling, Legacy Mode hiding, request counting, virtualization, or scroll behavior.

## Consequences

- Heavy mutation batches become visible in the UI for future Native Mode and issue #24 work.
- Diagnostics stay sanitized and content-free.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
