# Changelog

## Unreleased

### Features

- **native:** add retry state diagnostics ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (fa4b36f)
- **native:** budget snapshots by render-unit cost ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (9416406)
- **popup:** rename stable mode label ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (fd4b918)
- **popup:** separate native and legacy controls ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (15fed41)
- **native:** enforce chatgpt-only runtime ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (01d95f9)
- **sites:** support perplexity adapter ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (ed4c3c5)
- **native:** expose execution plan diagnostics ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (74510e0)
- **native:** add site adapter engine ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (ad8de43)
- **sites:** support grok adapter (#12) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (ab402f8)
- **sites:** support deepseek adapter (#14) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (634faa7)
- **counter:** add browser account counters (#25) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (222a802)
- **diagnostics:** add native overlay state model ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (3931dd5)
- **sites:** support google ai mode adapter (#23) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (d5b5d99)
- **diagnostics:** add telemetry marker model ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (4386a58)
- **diagnostics:** expose observer batch status ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (61da7e6)
- **popup:** add native mode controls ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (ba83616)
- **settings:** add openai native mode boundary ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (973df43)

### Fixes

- **validate:** preserve chrome build and use ascii output ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (1cad666)
- **clean:** preserve loaded chrome extension build ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (2dc73e5)
- **chatgpt:** preserve fast mode mapping references ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (949c1b1)
- **counter:** accept global failure elements (#30) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (2e65b27)
- **counter:** observe global rejected UI (#30) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (cf08ac6)
- **native:** disable conflicting virtualization subfeature (#24) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (bab8cbc)
- **counter:** cancel unaccepted requests (#30) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (e4b20a1)
- **lifecycle:** distinguish missing content script (#31) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (940c839)
- **fast-mode:** suppress misleading message counts ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (71479ae)
- **settings:** default fast mode off ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (4d380b8)
- **chatgpt:** track outer turn containers ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (ad369eb)
- **chatgpt:** avoid undercounting virtualized messages ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (72e9256)
- **ui:** show raw load-more count ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (0bf04aa)
- **settings:** restore stable defaults on mode switch ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (b91caae)
- **popup:** repair status regressions ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (6a2408e)
- **chatgpt:** reapply legacy hiding after host reveal (#24) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (d43fccd)
- **requests:** delay accepted request storage (#30) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (92db52d)
- **lifecycle:** recover stale content bootstrap ownership (#31) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (f028fb0)
- **popup:** preserve Stable controls when switching Native ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (faec269)
- **popup:** restore mode-specific native controls ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (5d7681e)
- **popup:** hide native-only controls in stable mode ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (17e6393)
- **sites:** match Perplexity www host ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (e82e15e)
- **sites:** target google ai mode turns (#23) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (9cea8b7)
- **tests:** lazy resolve extension api ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (ad40490)
- **counter:** type default request reporter ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (ec8fa5c)
- **sites:** finish search ai mode adapter (#23) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (e40c281)
- **tests:** use installed Playwright test package ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (d7093d6)
- **diagnostics:** bound native diagnostic details ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (f45307d)
- **chatgpt:** aggregate virtualization conflict signals (#24) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (dc1ac16)
- **chatgpt:** add virtualization conflict detector (#24) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (befba90)
- **streaming:** add stale generation detector model ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (2c5b617)
- **counter:** count only accepted chat requests (#30) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (cf4eeb1)
- **lifecycle:** degrade on observer callback errors (#31) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (c1dd9dd)
- **lifecycle:** guard duplicate content bootstrap (#31) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (4607215)
- **lifecycle:** clarify popup health states (#31) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (06bea7f)
- **lifecycle:** recover on page resume (#31) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (84c7ed8)
- **lifecycle:** report content health status (#31) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (af9ca0e)
- **lifecycle:** recover status indicator after host removal (#31) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (29722ca)

### Performance

- **validate:** default to chrome build checks ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (3ef1598)
- **validate:** keep default checks fast ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (77830f5)
- **validate:** reuse the initial build across checks ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (829f1ce)
- **editor:** defer work during input latency windows ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (d27bacd)
- **input:** record large paste plans ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (3a30154)
- **native:** add ChatGPT quiet snapshots and token diagnostics ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (59aab79)
- **chatgpt:** add text snapshot cache ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (ce34dca)
- **popup:** render cached status immediately ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (aeac417)
- **chatgpt:** add layout measurement cache ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (5573be9)
- **chatgpt:** add full-fidelity layout plan ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (ca2ed40)
- **chatgpt:** add native safety wrapper ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (211aa4e)
- **native:** add execution plan gate ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (95b4918)
- **native:** add chatgpt tuning profile ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (9f07209)
- **virtualization:** add scroll offset policy ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (f12a45d)
- **virtualization:** add size plan model ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (47ef7b3)
- **virtualization:** add eligibility gate ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (26544f5)
- **native:** add feature gate model ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (13128ad)
- **native:** add scheduler counters ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (0f8ceb1)
- **virtualization:** add restore policy model ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (edb5399)
- **virtualization:** add turn virtualizer planner ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (ab08ccd)
- **memory:** add page resource pruner model ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (36b1f3e)
- **tabs:** add multi-tab coordinator model ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (d51acb4)
- **input:** add input chunk planner model ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (c9ceb3c)
- **toolcalls:** add tool-call group model ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (9bd21a8)
- **storage:** add safe turn measurement cache model ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (2a90ad8)
- **virtualization:** add frozen turn cache model ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (105bd04)
- **observer:** add mutation batch diagnostics ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (5f3d4d6)
- **native:** wire guarded native controller ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (522e328)
- **native:** add scroll geometry diagnostics ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (239f63f)
- **native:** add turn registry model ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (86295fb)
- **input:** add native editor input guard ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (4f55797)
- **messages:** index tracked message ids ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (d0d6bf6)

### Tests

- **validate:** speed up full extension checks ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (4ae404f)
- **mode:** cover issue parity across Stable and Native ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (cfb14e8)
- **editor:** cover beforeinput guard in matrix ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (237c8a3)
- **native:** count third scroll oscillation sample (#24) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (7769e92)
- **extension:** update test visibility flag ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (c43737d)
- **counter:** cover per-site accepted counts ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (7858e48)
- **extension:** register site regressions conditionally ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (3ae5456)
- **native:** cover cache model boundaries ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (28b31e5)
- **counter:** cover request lifecycle model (#30) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (01e45ea)
- **counter:** make request lifecycle reporter injectable (#30) ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (e3176aa)
- **native:** cover native guard models ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (8c06aee)
- **safari:** add compatibility validation track ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (aad54a2)

### CI

- fix pnpm setup version ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (4699d29)
- **release:** ignore release metadata changelog commit ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (d0f7829)
- fix workflow setup order ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (e5109b5)
- **release:** use Node 24 actions ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (4721ac8)
- update workflow actions ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (dcc37c4)
- **github:** add validation and release automation ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (6a7245b)

### Build

- **validation:** expand pnpm validation gate ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (40aa19a)
- **deps:** migrate to pnpm ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (1e04335)

### Docs

- **chatgpt:** add master technical spec ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (6057f19)
- **repo:** document maintainer setup ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (75d6aca)
- **contributing:** split contributor guidance from README ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (347e5a6)
- **adr:** normalize decision record taxonomy ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (43f404d)
- add website link to README for easier access ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (6751f4a)

### Refactors

- **native:** split provider adapter records ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (2ce356f)

### Maintenance

- **repo:** make hook installer portable ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (962fd06)
- **repo:** update changelog helper ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (43f4a7e)
- **repo:** update local hook setup ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (cfe1987)
- **repo:** add local setup script ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (658d46c)
- **repo:** add changelog updater ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (86bddc9)
- **repo:** improve client readiness ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (041ac47)
- **quality:** harden script robustness ([Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)) (3dcd13b)

### Other

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

## v1.4.3

### Features

- weekly request counter for ChatGPT (#22) ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (f30a546)
- add auto-load on top scroll and fix Excel table bug ([infpdev (@infpdev)](https://github.com/infpdev)) (8321bb4)

### Fixes

- auto-patch Safari signing and update install guide with screenshots ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (0ebe872)

### Other

- Merge pull request #20 from infpdev/feat/auto-load ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (5d349ef)
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

- Add image to README for ChatGPT Speed Booster ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (fbd4a6e)
- Revise README build instructions ([Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)) (9fd6f96)

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
