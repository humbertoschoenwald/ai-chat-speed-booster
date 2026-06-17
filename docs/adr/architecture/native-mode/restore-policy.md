# ADR: Restore policy

## Status

Accepted.

## Context

Native Mode must preserve full-fidelity access for focus, selection, copy, browser find, accessibility, disable, selector uncertainty, and diagnostics export. Restore decisions need to exist before live freezing is wired.

## Decision

Add a content-free `RestorePolicy` that turns frozen or placeholder turn records into restore decisions based on explicit triggers.

The policy is decision-only. It does not read message text, move DOM nodes, insert placeholders, or change scroll position.

## Consequences

- Future freeze/restore behavior has a single restore trigger contract.
- Accessibility, copy, find, and disable paths fail open by restoring content.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
