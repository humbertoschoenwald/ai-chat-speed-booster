# ADR: ChatGPT Native runtime boundary

## Status

Accepted.

## Context

Native Mode is not a more aggressive version of Legacy Mode. Legacy Mode can hide old turns, auto-load hidden turns, render a floating status badge, and optionally bridge Fast Mode fetch trimming. Native Mode must use its own runtime path and must not inherit those Legacy controls.

Native Mode is also not ready for every supported AI site. ChatGPT is the only enabled Native provider today.

## Decision

Derive a runtime config from saved settings and the current site before content behavior runs.

- If the saved mode is Native and the current site is ChatGPT, Native Mode runs with Legacy controls disabled: fetch interception, auto-load, hard DOM hiding, and the floating status badge are all off.
- If the saved mode is Native on any non-ChatGPT site, the runtime falls back to Legacy Mode for that page.
- The MAIN-world bridge also disables Fast Mode while ChatGPT Native Mode is active.

## Consequences

- Native Mode cannot accidentally apply ChatGPT-specific tuning to other providers.
- Native Mode cannot accidentally reuse Legacy hiding or Fast Mode behavior.
- Existing DOM-only adapters continue to work through Legacy Mode.
- Request counters remain per site and are not part of the Legacy-control shutdown.

## Popup separation

The popup must not present Native Mode as a variant of Legacy Mode. When the effective mode is Native, Legacy-only controls for Fast Mode, Auto Load, hard hiding, visible-count limits, batch-size loading, and the floating status badge are hidden and disabled. The per-site request counter remains outside that Legacy-only block. The old Native target selector is hidden; ChatGPT is the only enabled Native target today.
