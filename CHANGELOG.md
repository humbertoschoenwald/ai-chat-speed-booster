# Changelog

## Unreleased

### Features

- **native:** add retry state diagnostics (fa4b36f) by Humberto Schoenwald (@humbertoschoenwald)
- **native:** budget snapshots by render-unit cost (9416406) by Humberto Schoenwald (@humbertoschoenwald)
- **popup:** rename stable mode label (fd4b918) by Humberto Schoenwald (@humbertoschoenwald)
- **popup:** separate native and legacy controls (15fed41) by Humberto Schoenwald (@humbertoschoenwald)
- **native:** enforce chatgpt-only runtime (01d95f9) by Humberto Schoenwald (@humbertoschoenwald)
- **sites:** support perplexity adapter (ed4c3c5) by Humberto Schoenwald (@humbertoschoenwald)
- **native:** expose execution plan diagnostics (74510e0) by Humberto Schoenwald (@humbertoschoenwald)
- **native:** add site adapter engine (ad8de43) by Humberto Schoenwald (@humbertoschoenwald)
- **sites:** support grok adapter (#12) (ab402f8) by Humberto Schoenwald (@humbertoschoenwald)
- **sites:** support deepseek adapter (#14) (634faa7) by Humberto Schoenwald (@humbertoschoenwald)
- **counter:** add browser account counters (#25) (222a802) by Humberto Schoenwald (@humbertoschoenwald)
- **diagnostics:** add native overlay state model (3931dd5) by Humberto Schoenwald (@humbertoschoenwald)
- **sites:** support google ai mode adapter (#23) (d5b5d99) by Humberto Schoenwald (@humbertoschoenwald)
- **diagnostics:** add telemetry marker model (4386a58) by Humberto Schoenwald (@humbertoschoenwald)
- **diagnostics:** expose observer batch status (61da7e6) by Humberto Schoenwald (@humbertoschoenwald)
- **popup:** add native mode controls (ba83616) by Humberto Schoenwald (@humbertoschoenwald)
- **settings:** add openai native mode boundary (973df43) by Humberto Schoenwald (@humbertoschoenwald)

### Fixes

- **validate:** preserve chrome build and use ascii output (1cad666) by Humberto Schoenwald (@humbertoschoenwald)
- **clean:** preserve loaded chrome extension build (2dc73e5) by Humberto Schoenwald (@humbertoschoenwald)
- **chatgpt:** preserve fast mode mapping references (949c1b1) by Humberto Schoenwald (@humbertoschoenwald)
- **counter:** accept global failure elements (#30) (2e65b27) by Humberto Schoenwald (@humbertoschoenwald)
- **counter:** observe global rejected UI (#30) (cf08ac6) by Humberto Schoenwald (@humbertoschoenwald)
- **native:** disable conflicting virtualization subfeature (#24) (bab8cbc) by Humberto Schoenwald (@humbertoschoenwald)
- **counter:** cancel unaccepted requests (#30) (e4b20a1) by Humberto Schoenwald (@humbertoschoenwald)
- **lifecycle:** distinguish missing content script (#31) (940c839) by Humberto Schoenwald (@humbertoschoenwald)
- **fast-mode:** suppress misleading message counts (71479ae) by Humberto Schoenwald (@humbertoschoenwald)
- **settings:** default fast mode off (4d380b8) by Humberto Schoenwald (@humbertoschoenwald)
- **chatgpt:** track outer turn containers (ad369eb) by Humberto Schoenwald (@humbertoschoenwald)
- **chatgpt:** avoid undercounting virtualized messages (72e9256) by Humberto Schoenwald (@humbertoschoenwald)
- **ui:** show raw load-more count (0bf04aa) by Humberto Schoenwald (@humbertoschoenwald)
- **settings:** restore stable defaults on mode switch (b91caae) by Humberto Schoenwald (@humbertoschoenwald)
- **popup:** repair status regressions (6a2408e) by Humberto Schoenwald (@humbertoschoenwald)
- **chatgpt:** reapply legacy hiding after host reveal (#24) (d43fccd) by Humberto Schoenwald (@humbertoschoenwald)
- **requests:** delay accepted request storage (#30) (92db52d) by Humberto Schoenwald (@humbertoschoenwald)
- **lifecycle:** recover stale content bootstrap ownership (#31) (f028fb0) by Humberto Schoenwald (@humbertoschoenwald)
- **popup:** preserve Stable controls when switching Native (faec269) by Humberto Schoenwald (@humbertoschoenwald)
- **popup:** restore mode-specific native controls (5d7681e) by Humberto Schoenwald (@humbertoschoenwald)
- **popup:** hide native-only controls in stable mode (17e6393) by Humberto Schoenwald (@humbertoschoenwald)
- **sites:** match Perplexity www host (e82e15e) by Humberto Schoenwald (@humbertoschoenwald)
- **sites:** target google ai mode turns (#23) (9cea8b7) by Humberto Schoenwald (@humbertoschoenwald)
- **tests:** lazy resolve extension api (ad40490) by Humberto Schoenwald (@humbertoschoenwald)
- **counter:** type default request reporter (ec8fa5c) by Humberto Schoenwald (@humbertoschoenwald)
- **sites:** finish search ai mode adapter (#23) (e40c281) by Humberto Schoenwald (@humbertoschoenwald)
- **tests:** use installed Playwright test package (d7093d6) by Humberto Schoenwald (@humbertoschoenwald)
- **diagnostics:** bound native diagnostic details (f45307d) by Humberto Schoenwald (@humbertoschoenwald)
- **chatgpt:** aggregate virtualization conflict signals (#24) (dc1ac16) by Humberto Schoenwald (@humbertoschoenwald)
- **chatgpt:** add virtualization conflict detector (#24) (befba90) by Humberto Schoenwald (@humbertoschoenwald)
- **streaming:** add stale generation detector model (2c5b617) by Humberto Schoenwald (@humbertoschoenwald)
- **counter:** count only accepted chat requests (#30) (cf4eeb1) by Humberto Schoenwald (@humbertoschoenwald)
- **lifecycle:** degrade on observer callback errors (#31) (c1dd9dd) by Humberto Schoenwald (@humbertoschoenwald)
- **lifecycle:** guard duplicate content bootstrap (#31) (4607215) by Humberto Schoenwald (@humbertoschoenwald)
- **lifecycle:** clarify popup health states (#31) (06bea7f) by Humberto Schoenwald (@humbertoschoenwald)
- **lifecycle:** recover on page resume (#31) (84c7ed8) by Humberto Schoenwald (@humbertoschoenwald)
- **lifecycle:** report content health status (#31) (af9ca0e) by Humberto Schoenwald (@humbertoschoenwald)
- **lifecycle:** recover status indicator after host removal (#31) (29722ca) by Humberto Schoenwald (@humbertoschoenwald)

### Performance

- **validate:** default to chrome build checks (3ef1598) by Humberto Schoenwald (@humbertoschoenwald)
- **validate:** keep default checks fast (77830f5) by Humberto Schoenwald (@humbertoschoenwald)
- **validate:** reuse the initial build across checks (829f1ce) by Humberto Schoenwald (@humbertoschoenwald)
- **editor:** defer work during input latency windows (d27bacd) by Humberto Schoenwald (@humbertoschoenwald)
- **input:** record large paste plans (3a30154) by Humberto Schoenwald (@humbertoschoenwald)
- **native:** add ChatGPT quiet snapshots and token diagnostics (59aab79) by Humberto Schoenwald (@humbertoschoenwald)
- **chatgpt:** add text snapshot cache (ce34dca) by Humberto Schoenwald (@humbertoschoenwald)
- **popup:** render cached status immediately (aeac417) by Humberto Schoenwald (@humbertoschoenwald)
- **chatgpt:** add layout measurement cache (5573be9) by Humberto Schoenwald (@humbertoschoenwald)
- **chatgpt:** add full-fidelity layout plan (ca2ed40) by Humberto Schoenwald (@humbertoschoenwald)
- **chatgpt:** add native safety wrapper (211aa4e) by Humberto Schoenwald (@humbertoschoenwald)
- **native:** add execution plan gate (95b4918) by Humberto Schoenwald (@humbertoschoenwald)
- **native:** add chatgpt tuning profile (9f07209) by Humberto Schoenwald (@humbertoschoenwald)
- **virtualization:** add scroll offset policy (f12a45d) by Humberto Schoenwald (@humbertoschoenwald)
- **virtualization:** add size plan model (47ef7b3) by Humberto Schoenwald (@humbertoschoenwald)
- **virtualization:** add eligibility gate (26544f5) by Humberto Schoenwald (@humbertoschoenwald)
- **native:** add feature gate model (13128ad) by Humberto Schoenwald (@humbertoschoenwald)
- **native:** add scheduler counters (0f8ceb1) by Humberto Schoenwald (@humbertoschoenwald)
- **virtualization:** add restore policy model (edb5399) by Humberto Schoenwald (@humbertoschoenwald)
- **virtualization:** add turn virtualizer planner (ab08ccd) by Humberto Schoenwald (@humbertoschoenwald)
- **memory:** add page resource pruner model (36b1f3e) by Humberto Schoenwald (@humbertoschoenwald)
- **tabs:** add multi-tab coordinator model (d51acb4) by Humberto Schoenwald (@humbertoschoenwald)
- **input:** add input chunk planner model (c9ceb3c) by Humberto Schoenwald (@humbertoschoenwald)
- **toolcalls:** add tool-call group model (9bd21a8) by Humberto Schoenwald (@humbertoschoenwald)
- **storage:** add safe turn measurement cache model (2a90ad8) by Humberto Schoenwald (@humbertoschoenwald)
- **virtualization:** add frozen turn cache model (105bd04) by Humberto Schoenwald (@humbertoschoenwald)
- **observer:** add mutation batch diagnostics (5f3d4d6) by Humberto Schoenwald (@humbertoschoenwald)
- **native:** wire guarded native controller (522e328) by Humberto Schoenwald (@humbertoschoenwald)
- **native:** add scroll geometry diagnostics (239f63f) by Humberto Schoenwald (@humbertoschoenwald)
- **native:** add turn registry model (86295fb) by Humberto Schoenwald (@humbertoschoenwald)
- **input:** add native editor input guard (4f55797) by Humberto Schoenwald (@humbertoschoenwald)
- **messages:** index tracked message ids (d0d6bf6) by Humberto Schoenwald (@humbertoschoenwald)

### Tests

- **validate:** speed up full extension checks (4ae404f) by Humberto Schoenwald (@humbertoschoenwald)
- **mode:** cover issue parity across Stable and Native (cfb14e8) by Humberto Schoenwald (@humbertoschoenwald)
- **editor:** cover beforeinput guard in matrix (237c8a3) by Humberto Schoenwald (@humbertoschoenwald)
- **native:** count third scroll oscillation sample (#24) (7769e92) by Humberto Schoenwald (@humbertoschoenwald)
- **extension:** update test visibility flag (c43737d) by Humberto Schoenwald (@humbertoschoenwald)
- **counter:** cover per-site accepted counts (7858e48) by Humberto Schoenwald (@humbertoschoenwald)
- **extension:** register site regressions conditionally (3ae5456) by Humberto Schoenwald (@humbertoschoenwald)
- **native:** cover cache model boundaries (28b31e5) by Humberto Schoenwald (@humbertoschoenwald)
- **counter:** cover request lifecycle model (#30) (01e45ea) by Humberto Schoenwald (@humbertoschoenwald)
- **counter:** make request lifecycle reporter injectable (#30) (e3176aa) by Humberto Schoenwald (@humbertoschoenwald)
- **native:** cover native guard models (8c06aee) by Humberto Schoenwald (@humbertoschoenwald)
- **safari:** add compatibility validation track (aad54a2) by Humberto Schoenwald (@humbertoschoenwald)

### CI

- fix pnpm setup version (4699d29) by Humberto Schoenwald (@humbertoschoenwald)
- **release:** ignore release metadata changelog commit (d0f7829) by Humberto Schoenwald (@humbertoschoenwald)
- fix workflow setup order (e5109b5) by Humberto Schoenwald (@humbertoschoenwald)
- **release:** use Node 24 actions (4721ac8) by Humberto Schoenwald (@humbertoschoenwald)
- update workflow actions (dcc37c4) by Humberto Schoenwald (@humbertoschoenwald)
- **github:** add validation and release automation (6a7245b) by Humberto Schoenwald (@humbertoschoenwald)

### Build

- **validation:** expand pnpm validation gate (40aa19a) by Humberto Schoenwald (@humbertoschoenwald)
- **deps:** migrate to pnpm (1e04335) by Humberto Schoenwald (@humbertoschoenwald)

### Docs

- **chatgpt:** add master technical spec (6057f19) by Humberto Schoenwald (@humbertoschoenwald)
- **repo:** document maintainer setup (75d6aca) by Humberto Schoenwald (@humbertoschoenwald)
- **contributing:** split contributor guidance from README (347e5a6) by Humberto Schoenwald (@humbertoschoenwald)
- **adr:** normalize decision record taxonomy (43f404d) by Humberto Schoenwald (@humbertoschoenwald)
- add website link to README for easier access (6751f4a) by Noah Thiering (@Noah4ever)

### Refactors

- **native:** split provider adapter records (2ce356f) by Humberto Schoenwald (@humbertoschoenwald)

### Maintenance

- update changelog formatting (d3f0379) by Humberto Schoenwald (@humbertoschoenwald)
- **repo:** make hook installer portable (962fd06) by Humberto Schoenwald (@humbertoschoenwald)
- **repo:** update changelog helper (43f4a7e) by Humberto Schoenwald (@humbertoschoenwald)
- **repo:** update local hook setup (cfe1987) by Humberto Schoenwald (@humbertoschoenwald)
- **repo:** add local setup script (658d46c) by Humberto Schoenwald (@humbertoschoenwald)
- **repo:** add changelog updater (86bddc9) by Humberto Schoenwald (@humbertoschoenwald)
- **repo:** improve client readiness (041ac47) by Humberto Schoenwald (@humbertoschoenwald)
- **quality:** harden script robustness (3dcd13b) by Humberto Schoenwald (@humbertoschoenwald)

### Other

- Update version numbers for Chrome and Firefox links (4eeb4e1) by Noah Thiering (@Noah4ever)

## v1.4.5

### Features

- add version bump and packaging scripts, update .gitignore (cb23507) by Noah Thiering (@Noah4ever)

### Fixes

- remove unused variables to fix tsc --noEmit typecheck (b596bbf) by Noah Thiering (@Noah4ever)
- revert auto-load logic, prevent popup flash, and add version label (#29) (3deae04) by infpdev (@infpdev)

## v1.4.4

### Fixes

- ChatGPT scroll regressions, Auto Load opt-in, Hide-old toggle (#24) (ad9442d) by Noah Thiering (@Noah4ever)

### Other

- Update Chrome version to v1.4.3 in README (e3446b9) by Noah Thiering (@Noah4ever)

## v1.4.3

### Features

- weekly request counter for ChatGPT (#22) (f30a546) by Noah Thiering (@Noah4ever)
- add auto-load on top scroll and fix Excel table bug (8321bb4) by infpdev (@infpdev)

### Fixes

- auto-patch Safari signing and update install guide with screenshots (0ebe872) by Noah Thiering (@Noah4ever)

### Other

- Merge pull request #20 from infpdev/feat/auto-load (5d349ef) by Noah Thiering (@Noah4ever)
- Update Firefox version in README (13a6ede) by Noah Thiering (@Noah4ever)

## v1.4.1

### Fixes

- remove 'tabs' permission from manifest files and update to 1.4.1 (a40b618) by Noah Thiering (@Noah4ever)

### Other

- Update Chrome version to v1.4.0 in README (b178b89) by Noah Thiering (@Noah4ever)
- Update Firefox version in README (bbce6d0) by Noah Thiering (@Noah4ever)

## v1.4.0

### Features

- implement LRU caching for trimmed conversation responses (bb549c6) by Noah Thiering (@Noah4ever)

### Fixes

- update version to 1.4.0 (fc0c261) by Noah Thiering (@Noah4ever)

## v1.3.6

### Features

- **gemini:** add dynamic reset handling and Gemini support; bump version to 1.3.5 (c60fa37) by infpdev (@infpdev)

### Fixes

- remove previous message tracking and improve message initialization logic (5523e7b) by Noah Thiering (@Noah4ever)
- adjust message selectors for ChatGPT integration and update version to 1.3.6 (934f31e) by Noah Thiering (@Noah4ever)
- **gemini:** improve scroll handling for dynamic sites and update mock page generation (f42dd5a) by Noah Thiering (@Noah4ever)
- **gemini:** scrolling to the top on initial load and new messages (ff00104) by Noah Thiering (@Noah4ever)
- **gemini:** fix DOMObserver dynamic loading support and update README for clarity (03dc191) by infpdev (@infpdev)

### Docs

- add credits section for fetch-interception (38d69e7) by Noah Thiering (@Noah4ever)

### Other

- Update Chrome version to v1.3.4 in README (f802734) by Noah Thiering (@Noah4ever)
- Merge pull request #15 from infpdev/feat/gemini-support (9a17f09) by Noah Thiering (@Noah4ever)
- Revise installation section in README.md (edb1ca6) by Noah Thiering (@Noah4ever)
- Update Firefox version in README (022a8a8) by Noah Thiering (@Noah4ever)
- Update README with browser compatibility details closing #11 (e98f3b8) by Noah Thiering (@Noah4ever)

## v1.3.4

### Features

- add theme toggle with dark/light mode support (6704372) by infpdev (@infpdev)

### Fixes

- make theme toggle keyboard accessible (2fbeb47) by infpdev (@infpdev)

### Performance

- cache status indicator theme to avoid redundant style updates (99aaf3d) by infpdev (@infpdev)

### Maintenance

- update version to 1.3.4 in manifest and package files (0b80db1) by infpdev (@infpdev)

### Other

- Merge pull request #10 from infpdev/feat/theme-toggle (bfea54d) by Noah Thiering (@Noah4ever)

## v1.3.3

### Features

- load more button shows number of messages to be loaded (4cca323) (Ryan Holman)

### Tests

- updated a test to include message load count (8589bcc) (Ryan Holman)

### Maintenance

- automatic update of package-lock.json when I did npm install (4591054) (Ryan Holman)

### Other

- Merge pull request #8 from RyanHolmanClark/main (86cf9a9) by Noah Thiering (@Noah4ever)

## v1.3.2

### Other

- hide total count in status indicator when fast mode is on (fa79b61) by Noah Thiering (@Noah4ever)

## v1.3.1

### Features

- "Load full conversation" button when fetch-trimmed messages exhausted (dd3f05f) by Noah Thiering (@Noah4ever)

### Fixes

- stop subsequent fetches from erasing the trimmed flag (0839a8f) by Noah Thiering (@Noah4ever)
- use DOM attribute instead of localStorage for trimmed flag (d54b84a) by Noah Thiering (@Noah4ever)
- increase fetch interceptor BUFFER_ROUNDS from 10 to 100 (d8f6640) by Noah Thiering (@Noah4ever)
- use Math.floor for /2 display divisions to prevent fractional counts (ab1dac1) by Noah Thiering (@Noah4ever)
- align fetch interceptor limit with MessageManager's ×2 turn convention (e1ca688) by Noah Thiering (@Noah4ever)

### Performance

- comprehensive performance overhaul for fast mode (d7150de) by Noah Thiering (@Noah4ever)

## v1.3.0

### Features

- add Fast Mode toggle to popup and background handler (b0176a0) by Noah Thiering (@Noah4ever)
- add MAIN-world fetch interceptor for response trimming (d7aea4f) by Noah Thiering (@Noah4ever)
- add settings bridge content script (8fa5b33) by Noah Thiering (@Noah4ever)
- add configurable fetch intercept definitions per site (ee9d8a7) by Noah Thiering (@Noah4ever)
- add fetchInterceptEnabled to config types and defaults (6ea76d7) by Noah Thiering (@Noah4ever)

### Tests

- update status indicator test to match /2 display values (3db89a6) by Noah Thiering (@Noah4ever)

### Build

- register new content scripts in manifests and build pipeline (6b10985) by Noah Thiering (@Noah4ever)

### Maintenance

- bump version to 1.3.0 (f129c3c) by Noah Thiering (@Noah4ever)

## v1.2.0

### Features

- add installation guides for Chrome, Edge, Firefox, and Safari (eaaf662) by Noah Thiering (@Noah4ever)

### Fixes

- correct status values, improve indicator positioning, hide settings on unsupported sites (135e842) by infpdev (@infpdev)

### Refactors

- move UI selectors to sites.config.json, fix display bug (961634c) by Noah Thiering (@Noah4ever)

### Other

- Merge PR #5: fix status value bug, improve indicator positioning, preserve message limit, hide settings on unsupported sites (0c55db8) by Noah Thiering (@Noah4ever)

## v1.1.9

### Fixes

- shorten manifest description for Chrome Web Store limit (ae9d1c1) by Noah Thiering (@Noah4ever)

### Other

- Rename project references in README.md (1a30284) by Noah Thiering (@Noah4ever)

## v1.1.8

### Features

- overhaul selectors, SPA nav, visibility fixes, popup redesign (3dcb0b3) by Noah Thiering (@Noah4ever)
- green theme, rounded popup, and badge position picker (3b174b6) by Noah Thiering (@Noah4ever)
- redesign popup for generic AI, auto-save settings, fix scroll root (8df3c1b) by Noah Thiering (@Noah4ever)
- improve turn detection, conversation change handling, and status indicator sync (fee037d) by infpdev (@infpdev)

### Fixes

- re-apply visibility on addMessages and simplify status indicator (8989c58) by Noah Thiering (@Noah4ever)
- accumulate mutations across debounce to detect new message turns (9705365) by Noah Thiering (@Noah4ever)
- StatusIndicator finds actual scrolling element inside container (ea30edb) by Noah Thiering (@Noah4ever)
- overhaul site selectors and SPA navigation handling (f32c58e) by Noah Thiering (@Noah4ever)

### Docs

- update README defaults, mark Claude tested, remove duplicate section (96d84de) by Noah Thiering (@Noah4ever)

### Other

- Add image to README for ChatGPT Speed Booster (fbd4a6e) by Noah Thiering (@Noah4ever)
- Revise README build instructions (9fd6f96) by Noah Thiering (@Noah4ever)

## v1.1.7

### Docs

- add AMO source submission build instructions (3f4f1a1) by Noah Thiering (@Noah4ever)

## v1.1.6

### Fixes

- remove innerHTML usage for AMO validation (9f550a2) by Noah Thiering (@Noah4ever)

## v1.1.5

### Fixes

- make release zip validation robust (b22bf6f) by Noah Thiering (@Noah4ever)

## v1.1.4

### Fixes

- enforce release package checks and firefox data permissions (09081f7) by Noah Thiering (@Noah4ever)

## v1.1.3

### Other

- fix release packaging layout (a104019) by Noah Thiering (@Noah4ever)

## v1.1.2

### Features

- update Safari build instructions and add setup script (b099ad5) by Noah Thiering (@Noah4ever)
- update release workflow and update README (a41a4e8) by Noah Thiering (@Noah4ever)

### Fixes

- safari json trailing comma (caaa1b6) by Noah Thiering (@Noah4ever)
- safari setup (cf966c1) by Noah Thiering (@Noah4ever)

### Docs

- add Safari support setup and screenshots (bc4206b) by Noah Thiering (@Noah4ever)

## v1.1.1

### Features

- update readme (32924ed) by Noah Thiering (@Noah4ever)

## v1.1.0

### Features

- update popup styles and improve settings layout (8a1b18e) by Noah Thiering (@Noah4ever)
- new icons (ae13024) by Noah Thiering (@Noah4ever)
- add Safari support (e7178c0) by Noah Thiering (@Noah4ever)

### Docs

- update README (800e91f) by Noah Thiering (@Noah4ever)
- update README (57cd187) by Noah Thiering (@Noah4ever)

### Other

- Merge pull request #1 from Noah4ever/dev (5ac6a52) by Noah Thiering (@Noah4ever)

## v1.0.0

### Features

- initial extension with Chrome, Firefox, Edge, Safari support (4a6ea5d) by Noah Thiering (@Noah4ever)

### Other

- Initial commit (9a8a536) by Noah Thiering (@Noah4ever)
