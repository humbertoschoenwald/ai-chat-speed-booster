# Changelog

## Unreleased

### Tests

- **safari:** add compatibility validation track ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (aad54a2)

### Build

- **deps:** migrate to pnpm ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (1e04335)

### Docs

- add website link to README for easier access ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (6751f4a)

### Other

- Update README.md ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (c79b34d)
- Update version numbers for Chrome and Firefox links ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (4eeb4e1)

## v1.4.5

### Features

- add version bump and packaging scripts, update .gitignore ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (cb23507)

### Fixes

- remove unused variables to fix tsc --noEmit typecheck ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (b596bbf)
- revert auto-load logic, prevent popup flash, and add version label (#29) ([infpdev (@infpdev)](https://github.com/infpdev)) (3deae04)

## v1.4.4

### Fixes

- ChatGPT scroll regressions, Auto Load opt-in, Hide-old toggle (#24) ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (ad9442d)

### Other

- Update Chrome version to v1.4.3 in README ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (e3446b9)
- Update README.md ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (b8efa6a)

## v1.4.3

### Features

- weekly request counter for ChatGPT (#22) ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (f30a546)
- add auto-load on top scroll and fix Excel table bug ([infpdev (@infpdev)](https://github.com/infpdev)) (8321bb4)

### Fixes

- auto-patch Safari signing and update install guide with screenshots ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (0ebe872)

### Other

- Merge pull request #20 from infpdev/feat/auto-load ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (5d349ef)
- Update README.md ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (51d8d3f)
- Update Firefox version in README ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (13a6ede)

## v1.4.1

### Fixes

- remove 'tabs' permission from manifest files and update to 1.4.1 ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (a40b618)

### Other

- Update Chrome version to v1.4.0 in README ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (b178b89)
- Update Firefox version in README ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (bbce6d0)

## v1.4.0

### Features

- implement LRU caching for trimmed conversation responses ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (bb549c6)

### Fixes

- update version to 1.4.0 ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (fc0c261)

## v1.3.6

### Features

- **gemini:** add dynamic reset handling and Gemini support; bump version to 1.3.5 ([infpdev (@infpdev)](https://github.com/infpdev)) (c60fa37)

### Fixes

- remove previous message tracking and improve message initialization logic ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (5523e7b)
- adjust message selectors for ChatGPT integration and update version to 1.3.6 ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (934f31e)
- **gemini:** improve scroll handling for dynamic sites and update mock page generation ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (f42dd5a)
- **gemini:** scrolling to the top on initial load and new messages ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (ff00104)
- **gemini:** fix DOMObserver dynamic loading support and update README for clarity ([infpdev (@infpdev)](https://github.com/infpdev)) (03dc191)

### Docs

- add credits section for fetch-interception ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (38d69e7)

### Other

- Update Chrome version to v1.3.4 in README ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (f802734)
- Merge pull request #15 from infpdev/feat/gemini-support ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (9a17f09)
- Revise installation section in README.md ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (edb1ca6)
- Update Firefox version in README ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (022a8a8)
- Update README with browser compatibility details closing #11 ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (e98f3b8)

## v1.3.4

### Features

- add theme toggle with dark/light mode support ([infpdev (@infpdev)](https://github.com/infpdev)) (6704372)

### Fixes

- make theme toggle keyboard accessible ([infpdev (@infpdev)](https://github.com/infpdev)) (2fbeb47)

### Performance

- cache status indicator theme to avoid redundant style updates ([infpdev (@infpdev)](https://github.com/infpdev)) (99aaf3d)

### Maintenance

- update version to 1.3.4 in manifest and package files ([infpdev (@infpdev)](https://github.com/infpdev)) (0b80db1)

### Other

- Merge pull request #10 from infpdev/feat/theme-toggle ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (bfea54d)

## v1.3.3

### Features

- load more button shows number of messages to be loaded (Ryan Holman) (4cca323)

### Tests

- updated a test to include message load count (Ryan Holman) (8589bcc)

### Maintenance

- automatic update of package-lock.json when I did npm install (Ryan Holman) (4591054)

### Other

- Merge pull request #8 from RyanHolmanClark/main ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (86cf9a9)

## v1.3.2

### Other

- hide total count in status indicator when fast mode is on ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (fa79b61)

## v1.3.1

### Features

- "Load full conversation" button when fetch-trimmed messages exhausted ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (dd3f05f)

### Fixes

- stop subsequent fetches from erasing the trimmed flag ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (0839a8f)
- use DOM attribute instead of localStorage for trimmed flag ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (d54b84a)
- increase fetch interceptor BUFFER_ROUNDS from 10 to 100 ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (d8f6640)
- use Math.floor for /2 display divisions to prevent fractional counts ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (ab1dac1)
- align fetch interceptor limit with MessageManager's ×2 turn convention ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (e1ca688)

### Performance

- comprehensive performance overhaul for fast mode ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (d7150de)

## v1.3.0

### Features

- add Fast Mode toggle to popup and background handler ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (b0176a0)
- add MAIN-world fetch interceptor for response trimming ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (d7aea4f)
- add settings bridge content script ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (8fa5b33)
- add configurable fetch intercept definitions per site ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (ee9d8a7)
- add fetchInterceptEnabled to config types and defaults ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (6ea76d7)

### Tests

- update status indicator test to match /2 display values ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (3db89a6)

### Build

- register new content scripts in manifests and build pipeline ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (6b10985)

### Maintenance

- bump version to 1.3.0 ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (f129c3c)

## v1.2.0

### Features

- add installation guides for Chrome, Edge, Firefox, and Safari ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (eaaf662)

### Fixes

- correct status values, improve indicator positioning, hide settings on unsupported sites ([infpdev (@infpdev)](https://github.com/infpdev)) (135e842)

### Refactors

- move UI selectors to sites.config.json, fix display bug ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (961634c)

### Other

- Merge PR #5: fix status value bug, improve indicator positioning, preserve message limit, hide settings on unsupported sites ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (0c55db8)

## v1.1.9

### Fixes

- shorten manifest description for Chrome Web Store limit ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (ae9d1c1)

### Other

- Rename project references in README.md ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (1a30284)

## v1.1.8

### Features

- overhaul selectors, SPA nav, visibility fixes, popup redesign ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (3dcb0b3)
- green theme, rounded popup, and badge position picker ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (3b174b6)
- redesign popup for generic AI, auto-save settings, fix scroll root ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (8df3c1b)
- improve turn detection, conversation change handling, and status indicator sync ([infpdev (@infpdev)](https://github.com/infpdev)) (fee037d)

### Fixes

- re-apply visibility on addMessages and simplify status indicator ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (8989c58)
- accumulate mutations across debounce to detect new message turns ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (9705365)
- StatusIndicator finds actual scrolling element inside container ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (ea30edb)
- overhaul site selectors and SPA navigation handling ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (f32c58e)

### Docs

- update README defaults, mark Claude tested, remove duplicate section ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (96d84de)

### Other

- Update README.md ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (b23182f)
- Add image to README for ChatGPT Speed Booster ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (fbd4a6e)
- Revise README build instructions ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (9fd6f96)
- Update README.md ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (a454e49)

## v1.1.7

### Docs

- add AMO source submission build instructions ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (3f4f1a1)

## v1.1.6

### Fixes

- remove innerHTML usage for AMO validation ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (9f550a2)

## v1.1.5

### Fixes

- make release zip validation robust ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (b22bf6f)

## v1.1.4

### Fixes

- enforce release package checks and firefox data permissions ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (09081f7)

## v1.1.3

### Other

- fix release packaging layout ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (a104019)

## v1.1.2

### Features

- update Safari build instructions and add setup script ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (b099ad5)
- update release workflow and update README ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (a41a4e8)

### Fixes

- safari json trailing comma ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (caaa1b6)
- safari setup ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (cf966c1)

### Docs

- add Safari support setup and screenshots ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (bc4206b)

## v1.1.1

### Features

- update readme ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (32924ed)

## v1.1.0

### Features

- update popup styles and improve settings layout ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (8a1b18e)
- new icons ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (ae13024)
- add Safari support ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (e7178c0)

### Docs

- update README ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (800e91f)
- update README ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (57cd187)

### Other

- Merge pull request #1 from Noah4ever/dev ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (5ac6a52)

## v1.0.0

### Features

- initial extension with Chrome, Firefox, Edge, Safari support ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (4a6ea5d)

### Other

- Initial commit ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (9a8a536)
