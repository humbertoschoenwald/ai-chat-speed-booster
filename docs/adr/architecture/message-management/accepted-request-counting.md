# ADR: Accepted request counting

## Status

Accepted.

## Context

Issue #30 reports that failed or invalid requests can increment the weekly request counter. The previous implementation incremented as soon as a user-message DOM turn appeared, but a user turn represents an attempted prompt rather than an accepted request.

The counter must avoid storing raw prompt text and should not recount old history after reload or conversation reset.

## Decision

Add a content-side request lifecycle tracker. It records pending attempts when new user turns appear, then schedules the weekly counter increment only when a later non-failure response turn appears for a pending attempt. The scheduled increment is delayed so a stream error, rejected send, or limit state can cancel the pending accepted count before it reaches storage.

Duplicate DOM mutations are deduped with WeakSets. Structural failure indicators such as alert roles, error test ids, limit test ids, and error/danger classes consume a pending slot or cancel the most recent delayed accepted count without incrementing the accepted counter.

## Consequences

- Accepted request counting is more conservative and no longer increments immediately on user-turn insertion.
- Failed or rejected attempts can be represented as zero accepted requests when structural failure UI is observed.
- No message text, raw HTML, tool output, credentials, or conversation identifiers are stored.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.
