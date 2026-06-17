# ADR: Browser account counters

## Status

Accepted.

## Context

Weekly counter continuity can be improved without adding an application service.

## Decision

Mirror weekly request counters into the browser-provided account storage area when it exists. Local storage remains the primary copy. Current-week local and account values are merged by keeping the higher count.

## Consequences

- Signed-in compatible browser installs can share counter metadata.
- Other environments keep the local-only fallback.
- Stored data is limited to site id, week start, and count.
