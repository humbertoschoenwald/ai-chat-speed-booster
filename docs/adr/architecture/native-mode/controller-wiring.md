# ADR: Native controller wiring

## Status

Accepted.

## Context

Native Mode now has a configuration boundary, selector guard, diagnostics, and editor-input guard. The next safe step is to wire the controller into the content script without enabling virtualization, freezing, placeholders, scroll compensation, or tool-call grouping.

Legacy Mode must remain the default and must keep its existing `.acsb-hidden` / `display:none!important` behavior.

## Decision

The content entrypoint owns one `NativeModeController` per supported page. It creates the controller after site detection, updates it whenever extension config changes, stops it during unload, and includes only sanitized state in status responses.

The status payload may expose whether Native Mode is active, whether selector health passed, and whether editor input is currently protected. It does not expose message text, raw HTML, tool output, credentials, raw conversation identifiers, or DOM references.

## Consequences

- Native Mode can be enabled, disabled, and inspected without changing Legacy Mode output.
- Selector-health failure fails open and leaves the page on Legacy behavior.
- Future schedulers can use the controller without adding risky virtualization in this slice.
