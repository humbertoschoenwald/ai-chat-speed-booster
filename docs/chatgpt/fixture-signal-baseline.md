# ChatGPT Fixture Signal Baseline

This baseline is a non-authoritative regression aid for ChatGPT performance work. It captures the current fixture signal buckets used by Native-mode selector, scope, and render-budget tests.

## Review Rules

- Treat the numbers as fixture expectations, not live-site guarantees.
- Use these rows to decide whether a later optimization is improving the intended scope.
- If selector drift changes a count, review the fixture and explain why the new count is correct.
- Do not use full document counts for Native scheduling decisions; use conversation and canonical-turn scopes.


## Baseline Rows

| Fixture | Turn sections | Wrappers | Scroll roots | Tool groups | Code buckets | Empty turns | Page assets | Status/live nodes |
|---|---:|---:|---:|---:|---|---:|---:|---:|
| stable | 8 | 8 | 1 | 0 | none:8, small:0, medium:0, heavy:0 | 0 | 2 | 0 |
| native | 12 | 12 | 1 | 3 | none:7, small:2, medium:2, heavy:1 | 1 | 5 | 1 |
| timeout | 4 | 4 | 1 | 0 | none:4, small:0, medium:0, heavy:0 | 0 | 2 | 2 |
| in-operator | 6 | 6 | 1 | 2 | none:2, small:2, medium:2, heavy:0 | 0 | 1 | 0 |
| status | 3 | 3 | 1 | 0 | none:3, small:0, medium:0, heavy:0 | 1 | 1 | 2 |

## Future TODO Usage

Future performance TODOs should cite this baseline when changing selector ownership, message-role detection, snapshot gating, or render-budget heuristics. A changed fixture row is acceptable only when the new behavior is intentionally reviewed and covered by tests.
