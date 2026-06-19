# ChatGPT Master Technical Spec

## Scope

This public specification consolidates the ChatGPT optimization plan for AI Chat Speed Booster. It captures observable UI evidence, implementation boundaries, and rejected ideas without including private planning material.

Observed model slug in current snapshots: `gpt-5-5-thinking`. Treat this as snapshot evidence, not a provider contract.

## Work Areas

- Remove unreliable token-progress UI from implementation scope.
- Keep stable and native mode styling isolated.
- Reload only for supported mode switches.
- Make native renderer mount and teardown explicit.
- Scope streaming and spinner checks to owned message turns.
- Add cooldown behavior after sync failures.
- Detect provider delivery-timeout UI and recover safely.
- Detect observable read-only or max-length states without inventing token counts.
- Keep stable-mode CSS sizing bounded.
- Make status writes safe when the status anchor is missing.

## HTML Findings

- Stable and native surfaces can overlap during transitions.
- Active tool-call UI can exist in stable-mode captures.
- Sidebar loading spinners can use the same visual classes as turn-level loading UI.
- Freeze guards must therefore be turn-scoped, not document-scoped.

## MUST

```text
MUST
- Keep renderer state mode-owned.
- Keep stable-mode and native-mode CSS isolated.
- Scope loading and freeze checks to the relevant message turn.
- Preserve active tool-call, retry, and composer UI.
- Treat provider HTML as unstable.
- Run repository validation after implementation changes.
```

## MUST NOT

```text
MUST NOT
- Do not calculate or display a conversation token progress bar from ChatGPT UI state.
- Do not use document-wide spinner checks as freeze predicates.
- Do not let native CSS affect stable mode.
- Do not hide active dynamic provider UI.
- Do not treat one HTML snapshot as a permanent provider contract.
```

## Rejected Token Progress Bar

A token-progress bar is rejected. ChatGPT does not expose an authoritative token ledger for hidden context, compacted history, tool traces, or provider-side truncation. A numeric progress UI would look precise while being unverifiable.

Use observable read-only or max-length provider signals instead, without showing a numeric context budget.

## Risk Register

```text
RISK
- Provider HTML can change without notice.
- CSS bleed can silently alter stable-mode UX.
- Delivery-timeout recovery can lose draft state if it is not guarded.
- Broad freeze predicates can hide active provider UI.
- Token-count estimates create a false accuracy promise.
```
