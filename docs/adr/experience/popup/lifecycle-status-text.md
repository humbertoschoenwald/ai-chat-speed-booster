# ADR: Popup lifecycle status text

## Status

Accepted.

## Context

Issue #31 requires the popup to distinguish more states than a generic loading or unavailable message. The content script now exposes sanitized lifecycle states and health fields, but the popup still needs to render those states clearly.

This change must not alter Legacy Mode hiding, Native Mode virtualization, request counting, or chat-page behavior.

## Decision

The popup renders lifecycle-aware status text for initializing, active, recovering, degraded, stopped, unsupported, and unavailable content-script states.

The visible count remains the primary active-state display. Lifecycle prefixes are added only when the content script reports a non-active health state or when the popup cannot reach the content script.

## Consequences

- Users can tell whether the content script is initializing, recovering, degraded, stopped, unsupported, or unavailable.
- Issue #31 recovery work has clearer user-facing feedback.
- No message text, raw HTML, tool output, credentials, or conversation identifiers are displayed or stored.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
