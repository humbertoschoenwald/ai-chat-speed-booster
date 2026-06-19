#!/usr/bin/env node
/**
 * License: MIT. See LICENSE in the repository root.
 * Responsibility: keep old pre-push hook installs safe after the hook moved to post-commit.
 * Boundary: no files are changed by this compatibility shim.
 * ADR: docs/adr/engineering/tooling/pnpm-package-manager-authority.md.
 */

console.log("pre-push changelog: no-op. Run pnpm run hooks:install to use the post-commit changelog hook.");
process.exit(0);
