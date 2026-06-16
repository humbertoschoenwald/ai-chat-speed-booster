# Safari compatibility track

Safari support is validated separately from the Chrome, Firefox, and Edge extension flow. This keeps WebKit and Xcode-specific work from blocking the core extension release path.

## Validation commands

Run the Safari build and manifest compatibility checks with:

```bash
pnpm run test:safari
```

The command builds `dist/safari` and runs the Safari compatibility Playwright project. It does not run the Xcode converter and does not produce or commit `safari-app` output.

Run the Xcode conversion only when a manual Safari package check is needed:

```bash
pnpm run safari:setup
```

## Compatibility scope

The Safari track checks that the generated Safari manifest keeps a Safari-specific shape, that content scripts keep deterministic injection order, and that generated Xcode output remains untracked.

Native Mode must stay conservative on Safari. Safari-sensitive behavior must be feature-detected before activation, and any unsupported Native Mode path must fail open or disable itself instead of changing existing legacy behavior.

## Commit boundary

Safari validation changes can be committed independently from Native Mode implementation work. Generated `dist`, `safari-app`, test results, reports, and local diagnostics must stay out of the repository.
