# ADR: pnpm Package Manager Authority

## Status

Proposed.

## Context

The repository was originally npm-authoritative through `package-lock.json` and npm-based validation commands. Dependency validation later exposed an esbuild advisory, and the validation surface also needed to align with shared Schoenwald command configuration under `commands/config/data`.

## Decision

Adopt pnpm as the repository package-manager authority.

The migration commit must add a pnpm engine floor, add `pnpm-lock.yaml`, update package scripts and validation commands from npm/npx to pnpm/pnpm exec, and remove `package-lock.json` in the same atomic change.

Dependency version updates must be a separate commit after pnpm is authoritative.

Validation must fail closed if both npm and pnpm lockfiles are present after migration. The repo-local validation command surface should use shared Schoenwald config files from `commands/config/data` where applicable.

## Consequences

Future install instructions, README commands, CI workflow commands, and local validation commands should use pnpm.

If a future dependency audit requires an unsafe or breaking update, the update must be documented and committed independently from package-manager authority changes.

The migration is not complete until `package-lock.json` is removed, `pnpm-lock.yaml` is tracked, validation passes, and generated output remains untracked.

## Bibliography

See `docs/bibliography/package-manager-and-validation.md`.
