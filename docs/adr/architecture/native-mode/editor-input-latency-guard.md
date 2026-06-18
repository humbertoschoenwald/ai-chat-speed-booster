# ADR: Editor input latency guard

## Status

Accepted.

## Context

Long ChatGPT sessions can make typing, paste, copy, cut, and selection feel slow because host editor work and extension DOM work share the same main thread. Large chats, tool-call subtrees, stale streaming state, and snapshot or visibility bookkeeping can compete with real-time input.

The extension must not store private clipboard text or message text for this guard. It should preserve Stable Mode behavior and Native Mode reversibility.

## Decision

Native Mode tracks editor activity as a protected real-time window. The guard listens for beforeinput, input, keydown, keyup, paste, copy, cut, composition, selectionchange, focusin, and focusout events on editable surfaces.

During protected windows, background work can be deferred through the existing DOM observer deferral path. IME composition always keeps work deferred. Large paste detection stores only paste length and chunk-count diagnostics; it never stores clipboard content. Small paste remains native and unchunked.

Diagnostics are limited to event type, timestamps, event count, protected-until time, deferred-task count, paste length, and paste chunk count.

## Consequences

- Typing and editor operations can take priority over mutation scanning and Native snapshot work.
- Copy, cut, and selection activity do not trigger unbounded restoration or scans.
- Large pasted input can request a protected yield window without storing pasted content.
- Stable Mode `.acsb-hidden` behavior remains unchanged.
