# ADR: Input chunk planner

## Status

Accepted.

## Context

Editor input is a protected real-time path. Native Mode needs a safe planning boundary before any future large-input scheduling can run.

The planner must not read, store, mutate, or emit clipboard contents.

## Decision

Add an `InputChunkPlanner` that decides from length and IME composition state whether future input scheduling should be chunked. It reports only total length, chunk count, and chunk size.

This slice is planning-only. It does not intercept clipboard contents, dispatch synthetic input, mutate the editor, or change paste behavior.

## Consequences

- Future Native Mode input scheduling has a bounded plan model.
- IME composition stays protected because chunking is disabled while composing.
- Diagnostics remain content-free.
- Legacy `.acsb-hidden` / `display:none!important` behavior remains unchanged.

## Update: optimizer diagnostics

The editor input optimizer records only paste length and planned chunk count. It does not store pasted text and does not mutate clipboard contents. Large paste plans open a protected background-work window so observer, snapshot, cache, and layout work can yield while the host editor processes the paste.
