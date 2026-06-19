# Contributing

Thanks for helping improve AI Chat Speed Booster. This guide covers the normal local setup and commands for contributors.

The repository uses pnpm as its package manager. The package-manager decision is documented in [docs/adr/engineering/tooling/pnpm-package-manager-authority.md](docs/adr/engineering/tooling/pnpm-package-manager-authority.md).

## Requirements

- Node.js 18 or newer
- pnpm 10 or newer
- Git
- Playwright browsers, installed by the validation command when needed
- macOS and Xcode only if you are working on Safari support

## Install pnpm

If you already have pnpm 10 or newer, you can skip this step:

```bash
pnpm --version
```

With Corepack:

```bash
corepack enable
corepack prepare pnpm@10 --activate
```

Or with npm:

```bash
npm install -g pnpm@10
```

## Prepare the repo

```bash
git clone https://github.com/Noah4ever/ai-chat-speed-booster.git
cd ai-chat-speed-booster
pnpm install --frozen-lockfile
```

For a contribution branch:

```bash
git checkout -b fix/short-description
```

Keep generated outputs out of commits. The repo already ignores build outputs such as `dist/`, package zips, Playwright reports, auth profiles, and local logs.

## Useful commands

| Command | Purpose |
| --- | --- |
| `pnpm run build` | Clean generated output, build Chrome, then build all browser targets |
| `pnpm run build:chrome` | Build only the Chrome extension into `dist/chrome/` |
| `pnpm run build:firefox` | Build only the Firefox extension into `dist/firefox/` |
| `pnpm run build:edge` | Build only the Edge extension into `dist/edge/` |
| `pnpm run build:safari` | Build only the Safari extension files into `dist/safari/` |
| `pnpm run build:all` | Build Chrome, Firefox, Edge, and Safari |
| `pnpm run typecheck` | Run TypeScript without emitting files |
| `pnpm run lint` | Check package and command-surface invariants |
| `pnpm test` | Run build and extension Playwright tests |
| `pnpm run validate` | Run the full project validation gate |
| `pnpm run hooks:install` | Install the optional local Git hook |

The repository does not require contributors to install extra local lint tools beyond the dependencies installed by pnpm.

## Local Git hook

Maintainers can install the optional local Git hook with:

```bash
pnpm run hooks:install
```

The installer writes a local `post-commit` hook. After normal commits, the hook refreshes CHANGELOG.md and creates a changelog-only follow-up commit when the file changes. That keeps `git push` from failing just because a changelog commit had to be created.

## Validation

Before opening a pull request, run:

```bash
pnpm run validate
```

That command runs:

- `pnpm run build`
- `pnpm run typecheck`
- `pnpm run lint`
- Playwright browser installation when needed
- `pnpm run test:auth`
- `pnpm run test:build`
- `pnpm run test:extension`
- `pnpm run test:integration`
- `pnpm run diagnose:scroll`

`test:auth` skips automatically when no interactive terminal is available. To refresh the saved auth profile for live-site tests, run it interactively:

```bash
AUTH_SETUP_INTERACTIVE=1 pnpm run test:auth
```

`diagnose:scroll` skips automatically unless you provide a URL:

```bash
SCROLL_DIAGNOSTIC_URL="https://chatgpt.com/..." pnpm run diagnose:scroll
```

## Test suites

```bash
pnpm run test:build       # validate dist/ outputs only
pnpm run test:extension   # extension tests on mock pages
pnpm run test:safari      # Safari build and manifest compatibility
pnpm run test:integration # live site tests
```

Validation and extension tests run Chromium hidden by default. To see the temporary test browser windows:

```bash
SHOW_TEST_BROWSER=1 pnpm test
```

## Safari development

Safari requires a local Xcode conversion flow:

```bash
pnpm run test:safari
pnpm run safari:setup
open "safari-app/AI Chat Speed Booster/AI Chat Speed Booster.xcodeproj"
```

For full setup details, see [docs/install/safari.md](docs/install/safari.md).

## Adding a new AI chat site

All site definitions live in [sites.config.json](sites.config.json).

Add an entry to the array:

```json
{
    "id": "mysite",
    "name": "My AI Chat",
    "hostnames": ["mysite.com"],
    "urlPatterns": ["*://mysite.com/*"],
    "selectors": {
        "messageTurn": ".message-selector",
        "scrollContainer": ".scroll-container"
    },
    "messageIdAttribute": "data-message-id"
}
```

Then rebuild. The build script injects the URL patterns into all browser manifests.

### Finding selectors

1. Open the AI chat in your browser
2. Right-click on a message and inspect it
3. Find the repeating element wrapping each message turn for `messageTurn`
4. Find the scrollable container for `scrollContainer`
5. Add `scrollContainerAlt` if the site has a fallback scroll container
6. Set `messageIdAttribute` if messages have a unique ID attribute

## Release packaging

Maintainers can use these scripts when preparing a release.

### Bump the version

```bash
pnpm run bump 1.4.5
```

This updates `package.json` and the browser manifests, stages those files, commits the version bump, and creates the matching tag.

Flags:

- `pnpm run bump 1.4.5 -- --dry` previews the changes
- `pnpm run bump 1.4.5 -- --no-tag` commits without creating a tag

### Package release zips

Fetch tags before generating release metadata:

```bash
git fetch --tags --force
```

Then package:

```bash
pnpm run package
```

The script writes release zips into `deploys/`:

| File | Purpose |
| --- | --- |
| `chrome-v<version>.zip` | Chrome Web Store upload |
| `firefox-v<version>.zip` | Firefox AMO upload |
| `firefox-source-v<version>.zip` | Source archive for Firefox AMO review |

The source zip is produced from `git archive HEAD`, so commit the version bump before packaging.

## Firefox source submission

This project is built from TypeScript source files and bundled with esbuild.

Build environment:

- Linux, macOS, or Windows
- Node.js 18 or newer
- pnpm 10 or newer

Reproducible Firefox build:

```bash
git clone https://github.com/Noah4ever/ai-chat-speed-booster.git
cd ai-chat-speed-booster
pnpm install --frozen-lockfile
pnpm run build:firefox
```

The Firefox extension output is generated in `dist/firefox/`.
The file to load or package is `dist/firefox/manifest.json`.

Build script used by this project: `scripts/build.mjs`

## Pull request checklist

- Keep the change focused
- Add or update tests when behavior changes
- Run `pnpm run validate`
- Do not commit generated output, local auth profiles, or logs
- Describe the user-visible change in the pull request
