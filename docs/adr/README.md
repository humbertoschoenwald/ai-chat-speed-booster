# ADR taxonomy

Architecture decision records are grouped by lightweight domain folders instead of numeric prefixes.

Current taxonomy:

- `architecture/lifecycle/` for extension lifecycle and recovery decisions.
- `architecture/message-management/` for message tracking and bounded message-management changes.
- `architecture/native-mode/` for OpenAI Native mode boundaries, registries, geometry, and future virtualization foundations.
- `engineering/tooling/` for repository tooling, package-manager authority, validation, and build decisions.
- `experience/editor-input/` for editor interaction and input-protection decisions.

Naming rules:

- Use descriptive kebab-case file names.
- Use `# ADR: ...` headings without numeric prefixes.
- Add folders only when a decision does not fit an existing domain.
