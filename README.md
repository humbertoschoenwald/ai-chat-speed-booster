# AI Chat Speed Booster

<!-- ADR: docs/adr/engineering/tooling/pnpm-package-manager-authority.md -->

[![CI](https://github.com/Noah4ever/ai-chat-speed-booster/actions/workflows/ci.yml/badge.svg)](https://github.com/Noah4ever/ai-chat-speed-booster/actions/workflows/ci.yml)
[![Release](https://github.com/Noah4ever/ai-chat-speed-booster/actions/workflows/release.yml/badge.svg)](https://github.com/Noah4ever/ai-chat-speed-booster/actions/workflows/release.yml)
![Node.js 18+](https://img.shields.io/badge/node-%3E%3D18-339933)
![pnpm 10+](https://img.shields.io/badge/pnpm-%3E%3D10-f69220)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)
![Playwright](https://img.shields.io/badge/tests-Playwright-2ead33)
![esbuild](https://img.shields.io/badge/bundler-esbuild-ffcf00)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Website:** [projects.thiering.org/ai-chat-speed-booster](https://projects.thiering.org/ai-chat-speed-booster/)

Keeps long AI chat conversations responsive by showing only recent messages first, then letting you load older ones when you need them.

Works on **ChatGPT**, **Claude**, **Gemini**, and any AI chat app you add to the config.

## Install from the extension store

Use your browser's official extension store when available. Store installs update automatically.

| Browser | Version | Link |
| --- | --- | --- |
| Chrome | v1.4.5 | [Chrome Web Store](https://chromewebstore.google.com/detail/ai-chat-speed-booster/fgefgkfmapdjjjdekejanelknedclfik) |
| Firefox | v1.4.5 | [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/ai-chat-speed-booster/?utm_source=addons.mozilla.org&utm_medium=referral&utm_content=search) |

Store listings can lag behind a release because review can take time.

## Safari install

Safari requires a local Xcode build instead of a normal extension-store install.

Start here: [Safari install guide](docs/install/safari.md)

You will need macOS, Xcode, Node.js 18+, pnpm 10+, and a free Apple ID.

## Manual install

Manual installs are useful when your browser store does not have the extension yet. Manually installed versions do not update automatically.

1. Go to [Releases](https://github.com/Noah4ever/ai-chat-speed-booster/releases)
2. Download the zip for your browser
3. Follow your browser guide:
    - [Chrome install guide](docs/install/chrome.md)
    - [Firefox install guide](docs/install/firefox.md)
    - [Edge install guide](docs/install/edge.md)
    - [Safari install guide](docs/install/safari.md)

## How it works

- Shows the latest messages first (default: 3)
- Hides older messages
- Adds a "Load more" button at the top to reveal older messages in batches
- Keeps the visible window capped as new messages arrive
- Caches up to 5 recent chats (LRU) for faster switching
- Trims chat/API data before rendering to reduce load time and improve responsiveness

## Settings

Set these from the popup:

| Setting | Default | Range |
| --- | --- | --- |
| Visible messages | 3 | 1-200 |
| Load more batch | 3 | 1-50 |
| Status indicator | On | On/Off |
| Badge position | Top right | 4 corners |

## Browser support

- Chrome
- Firefox
- Edge
- Safari

## Privacy

- No message content is read or sent anywhere
- No analytics or tracking
- Settings are stored locally in browser storage

## CI/CD and tests

This project uses Node.js, pnpm, TypeScript, esbuild, Playwright, and GitHub Actions.

- CI runs validation on pushes and pull requests to `main`
- Release automation runs validation again for version tags and publishes GitHub release artifacts
- Playwright checks build outputs, browser-extension behavior, live-site integration, and Safari compatibility

For local setup, build commands, tests, release packaging, and site-config contributions, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Credits

Fast Mode in this project uses a fetch-interception approach that trims API responses before the app renders them. Earlier work in this area includes [Speed Booster for ChatGPT](https://chromewebstore.google.com/detail/speed-booster-for-chatgpt/finipiejpmpccemiedioehhpgcafnndo) by BGSN.

## License

MIT
