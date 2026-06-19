# Changelog

## Unreleased

### Features

#### Counter

- add browser account counters (#25) ([222a802](https://github.com/Noah4ever/ai-chat-speed-booster/commit/222a802)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Diagnostics

- add native overlay state model ([3931dd5](https://github.com/Noah4ever/ai-chat-speed-booster/commit/3931dd5)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add telemetry marker model ([4386a58](https://github.com/Noah4ever/ai-chat-speed-booster/commit/4386a58)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- expose observer batch status ([61da7e6](https://github.com/Noah4ever/ai-chat-speed-booster/commit/61da7e6)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Native

- add retry state diagnostics ([fa4b36f](https://github.com/Noah4ever/ai-chat-speed-booster/commit/fa4b36f)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- budget snapshots by render-unit cost ([9416406](https://github.com/Noah4ever/ai-chat-speed-booster/commit/9416406)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- enforce chatgpt-only runtime ([01d95f9](https://github.com/Noah4ever/ai-chat-speed-booster/commit/01d95f9)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- expose execution plan diagnostics ([74510e0](https://github.com/Noah4ever/ai-chat-speed-booster/commit/74510e0)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add site adapter engine ([ad8de43](https://github.com/Noah4ever/ai-chat-speed-booster/commit/ad8de43)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Popup

- rename stable mode label ([fd4b918](https://github.com/Noah4ever/ai-chat-speed-booster/commit/fd4b918)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- separate native and legacy controls ([15fed41](https://github.com/Noah4ever/ai-chat-speed-booster/commit/15fed41)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add native mode controls ([ba83616](https://github.com/Noah4ever/ai-chat-speed-booster/commit/ba83616)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Settings

- add openai native mode boundary ([973df43](https://github.com/Noah4ever/ai-chat-speed-booster/commit/973df43)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Sites

- support perplexity adapter ([ed4c3c5](https://github.com/Noah4ever/ai-chat-speed-booster/commit/ed4c3c5)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- support grok adapter (#12) ([ab402f8](https://github.com/Noah4ever/ai-chat-speed-booster/commit/ab402f8)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- support deepseek adapter (#14) ([634faa7](https://github.com/Noah4ever/ai-chat-speed-booster/commit/634faa7)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- support google ai mode adapter (#23) ([d5b5d99](https://github.com/Noah4ever/ai-chat-speed-booster/commit/d5b5d99)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

### Fixes

#### Chatgpt

- preserve fast mode mapping references ([949c1b1](https://github.com/Noah4ever/ai-chat-speed-booster/commit/949c1b1)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- track outer turn containers ([ad369eb](https://github.com/Noah4ever/ai-chat-speed-booster/commit/ad369eb)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- avoid undercounting virtualized messages ([72e9256](https://github.com/Noah4ever/ai-chat-speed-booster/commit/72e9256)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- reapply legacy hiding after host reveal (#24) ([d43fccd](https://github.com/Noah4ever/ai-chat-speed-booster/commit/d43fccd)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- aggregate virtualization conflict signals (#24) ([dc1ac16](https://github.com/Noah4ever/ai-chat-speed-booster/commit/dc1ac16)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add virtualization conflict detector (#24) ([befba90](https://github.com/Noah4ever/ai-chat-speed-booster/commit/befba90)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Clean

- preserve loaded chrome extension build ([2dc73e5](https://github.com/Noah4ever/ai-chat-speed-booster/commit/2dc73e5)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Counter

- accept global failure elements (#30) ([2e65b27](https://github.com/Noah4ever/ai-chat-speed-booster/commit/2e65b27)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- observe global rejected UI (#30) ([cf08ac6](https://github.com/Noah4ever/ai-chat-speed-booster/commit/cf08ac6)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- cancel unaccepted requests (#30) ([e4b20a1](https://github.com/Noah4ever/ai-chat-speed-booster/commit/e4b20a1)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- type default request reporter ([ec8fa5c](https://github.com/Noah4ever/ai-chat-speed-booster/commit/ec8fa5c)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- count only accepted chat requests (#30) ([cf4eeb1](https://github.com/Noah4ever/ai-chat-speed-booster/commit/cf4eeb1)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Diagnostics

- bound native diagnostic details ([f45307d](https://github.com/Noah4ever/ai-chat-speed-booster/commit/f45307d)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Fast Mode

- suppress misleading message counts ([71479ae](https://github.com/Noah4ever/ai-chat-speed-booster/commit/71479ae)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Lifecycle

- distinguish missing content script (#31) ([940c839](https://github.com/Noah4ever/ai-chat-speed-booster/commit/940c839)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- recover stale content bootstrap ownership (#31) ([f028fb0](https://github.com/Noah4ever/ai-chat-speed-booster/commit/f028fb0)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- degrade on observer callback errors (#31) ([c1dd9dd](https://github.com/Noah4ever/ai-chat-speed-booster/commit/c1dd9dd)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- guard duplicate content bootstrap (#31) ([4607215](https://github.com/Noah4ever/ai-chat-speed-booster/commit/4607215)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- clarify popup health states (#31) ([06bea7f](https://github.com/Noah4ever/ai-chat-speed-booster/commit/06bea7f)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- recover on page resume (#31) ([84c7ed8](https://github.com/Noah4ever/ai-chat-speed-booster/commit/84c7ed8)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- report content health status (#31) ([af9ca0e](https://github.com/Noah4ever/ai-chat-speed-booster/commit/af9ca0e)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- recover status indicator after host removal (#31) ([29722ca](https://github.com/Noah4ever/ai-chat-speed-booster/commit/29722ca)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Native

- disable conflicting virtualization subfeature (#24) ([bab8cbc](https://github.com/Noah4ever/ai-chat-speed-booster/commit/bab8cbc)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Popup

- repair status regressions ([6a2408e](https://github.com/Noah4ever/ai-chat-speed-booster/commit/6a2408e)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- preserve Stable controls when switching Native ([faec269](https://github.com/Noah4ever/ai-chat-speed-booster/commit/faec269)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- restore mode-specific native controls ([5d7681e](https://github.com/Noah4ever/ai-chat-speed-booster/commit/5d7681e)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- hide native-only controls in stable mode ([17e6393](https://github.com/Noah4ever/ai-chat-speed-booster/commit/17e6393)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Requests

- delay accepted request storage (#30) ([92db52d](https://github.com/Noah4ever/ai-chat-speed-booster/commit/92db52d)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Settings

- default fast mode off ([4d380b8](https://github.com/Noah4ever/ai-chat-speed-booster/commit/4d380b8)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- restore stable defaults on mode switch ([b91caae](https://github.com/Noah4ever/ai-chat-speed-booster/commit/b91caae)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Sites

- match Perplexity www host ([e82e15e](https://github.com/Noah4ever/ai-chat-speed-booster/commit/e82e15e)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- target google ai mode turns (#23) ([9cea8b7](https://github.com/Noah4ever/ai-chat-speed-booster/commit/9cea8b7)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- finish search ai mode adapter (#23) ([e40c281](https://github.com/Noah4ever/ai-chat-speed-booster/commit/e40c281)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Streaming

- add stale generation detector model ([2c5b617](https://github.com/Noah4ever/ai-chat-speed-booster/commit/2c5b617)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Tests

- lazy resolve extension api ([ad40490](https://github.com/Noah4ever/ai-chat-speed-booster/commit/ad40490)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- use installed Playwright test package ([d7093d6](https://github.com/Noah4ever/ai-chat-speed-booster/commit/d7093d6)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Ui

- show raw load-more count ([0bf04aa](https://github.com/Noah4ever/ai-chat-speed-booster/commit/0bf04aa)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Validate

- preserve chrome build and use ascii output ([1cad666](https://github.com/Noah4ever/ai-chat-speed-booster/commit/1cad666)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

### Performance

#### Chatgpt

- add text snapshot cache ([ce34dca](https://github.com/Noah4ever/ai-chat-speed-booster/commit/ce34dca)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add layout measurement cache ([5573be9](https://github.com/Noah4ever/ai-chat-speed-booster/commit/5573be9)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add full-fidelity layout plan ([ca2ed40](https://github.com/Noah4ever/ai-chat-speed-booster/commit/ca2ed40)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add native safety wrapper ([211aa4e](https://github.com/Noah4ever/ai-chat-speed-booster/commit/211aa4e)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Editor

- defer work during input latency windows ([d27bacd](https://github.com/Noah4ever/ai-chat-speed-booster/commit/d27bacd)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Input

- record large paste plans ([3a30154](https://github.com/Noah4ever/ai-chat-speed-booster/commit/3a30154)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add input chunk planner model ([c9ceb3c](https://github.com/Noah4ever/ai-chat-speed-booster/commit/c9ceb3c)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add native editor input guard ([4f55797](https://github.com/Noah4ever/ai-chat-speed-booster/commit/4f55797)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Memory

- add page resource pruner model ([36b1f3e](https://github.com/Noah4ever/ai-chat-speed-booster/commit/36b1f3e)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Messages

- index tracked message ids ([d0d6bf6](https://github.com/Noah4ever/ai-chat-speed-booster/commit/d0d6bf6)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Native

- add ChatGPT quiet snapshots and token diagnostics ([59aab79](https://github.com/Noah4ever/ai-chat-speed-booster/commit/59aab79)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add execution plan gate ([95b4918](https://github.com/Noah4ever/ai-chat-speed-booster/commit/95b4918)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add chatgpt tuning profile ([9f07209](https://github.com/Noah4ever/ai-chat-speed-booster/commit/9f07209)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add feature gate model ([13128ad](https://github.com/Noah4ever/ai-chat-speed-booster/commit/13128ad)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add scheduler counters ([0f8ceb1](https://github.com/Noah4ever/ai-chat-speed-booster/commit/0f8ceb1)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- wire guarded native controller ([522e328](https://github.com/Noah4ever/ai-chat-speed-booster/commit/522e328)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add scroll geometry diagnostics ([239f63f](https://github.com/Noah4ever/ai-chat-speed-booster/commit/239f63f)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add turn registry model ([86295fb](https://github.com/Noah4ever/ai-chat-speed-booster/commit/86295fb)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Observer

- add mutation batch diagnostics ([5f3d4d6](https://github.com/Noah4ever/ai-chat-speed-booster/commit/5f3d4d6)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Popup

- render cached status immediately ([aeac417](https://github.com/Noah4ever/ai-chat-speed-booster/commit/aeac417)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Storage

- add safe turn measurement cache model ([2a90ad8](https://github.com/Noah4ever/ai-chat-speed-booster/commit/2a90ad8)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Tabs

- add multi-tab coordinator model ([d51acb4](https://github.com/Noah4ever/ai-chat-speed-booster/commit/d51acb4)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Toolcalls

- add tool-call group model ([9bd21a8](https://github.com/Noah4ever/ai-chat-speed-booster/commit/9bd21a8)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Validate

- default to chrome build checks ([3ef1598](https://github.com/Noah4ever/ai-chat-speed-booster/commit/3ef1598)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- keep default checks fast ([77830f5](https://github.com/Noah4ever/ai-chat-speed-booster/commit/77830f5)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- reuse the initial build across checks ([829f1ce](https://github.com/Noah4ever/ai-chat-speed-booster/commit/829f1ce)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Virtualization

- add scroll offset policy ([f12a45d](https://github.com/Noah4ever/ai-chat-speed-booster/commit/f12a45d)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add size plan model ([47ef7b3](https://github.com/Noah4ever/ai-chat-speed-booster/commit/47ef7b3)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add eligibility gate ([26544f5](https://github.com/Noah4ever/ai-chat-speed-booster/commit/26544f5)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add restore policy model ([edb5399](https://github.com/Noah4ever/ai-chat-speed-booster/commit/edb5399)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add turn virtualizer planner ([ab08ccd](https://github.com/Noah4ever/ai-chat-speed-booster/commit/ab08ccd)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add frozen turn cache model ([105bd04](https://github.com/Noah4ever/ai-chat-speed-booster/commit/105bd04)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

### Tests

#### Counter

- cover per-site accepted counts ([7858e48](https://github.com/Noah4ever/ai-chat-speed-booster/commit/7858e48)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- cover request lifecycle model (#30) ([01e45ea](https://github.com/Noah4ever/ai-chat-speed-booster/commit/01e45ea)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- make request lifecycle reporter injectable (#30) ([e3176aa](https://github.com/Noah4ever/ai-chat-speed-booster/commit/e3176aa)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Editor

- cover beforeinput guard in matrix ([237c8a3](https://github.com/Noah4ever/ai-chat-speed-booster/commit/237c8a3)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Extension

- update test visibility flag ([c43737d](https://github.com/Noah4ever/ai-chat-speed-booster/commit/c43737d)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- register site regressions conditionally ([3ae5456](https://github.com/Noah4ever/ai-chat-speed-booster/commit/3ae5456)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Mode

- cover issue parity across Stable and Native ([cfb14e8](https://github.com/Noah4ever/ai-chat-speed-booster/commit/cfb14e8)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Native

- count third scroll oscillation sample (#24) ([7769e92](https://github.com/Noah4ever/ai-chat-speed-booster/commit/7769e92)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- cover cache model boundaries ([28b31e5](https://github.com/Noah4ever/ai-chat-speed-booster/commit/28b31e5)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- cover native guard models ([8c06aee](https://github.com/Noah4ever/ai-chat-speed-booster/commit/8c06aee)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Safari

- add compatibility validation track ([aad54a2](https://github.com/Noah4ever/ai-chat-speed-booster/commit/aad54a2)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Validate

- speed up full extension checks ([4ae404f](https://github.com/Noah4ever/ai-chat-speed-booster/commit/4ae404f)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

### CI

- fix pnpm setup version ([4699d29](https://github.com/Noah4ever/ai-chat-speed-booster/commit/4699d29)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- fix workflow setup order ([e5109b5](https://github.com/Noah4ever/ai-chat-speed-booster/commit/e5109b5)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- update workflow actions ([dcc37c4](https://github.com/Noah4ever/ai-chat-speed-booster/commit/dcc37c4)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Github

- add validation and release automation ([6a7245b](https://github.com/Noah4ever/ai-chat-speed-booster/commit/6a7245b)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Release

- ignore release metadata changelog commit ([d0f7829](https://github.com/Noah4ever/ai-chat-speed-booster/commit/d0f7829)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- use Node 24 actions ([4721ac8](https://github.com/Noah4ever/ai-chat-speed-booster/commit/4721ac8)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

### Build

#### Deps

- migrate to pnpm ([1e04335](https://github.com/Noah4ever/ai-chat-speed-booster/commit/1e04335)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Validation

- expand pnpm validation gate ([40aa19a](https://github.com/Noah4ever/ai-chat-speed-booster/commit/40aa19a)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

### Docs

- add website link to README for easier access ([6751f4a](https://github.com/Noah4ever/ai-chat-speed-booster/commit/6751f4a)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

#### Adr

- normalize decision record taxonomy ([43f404d](https://github.com/Noah4ever/ai-chat-speed-booster/commit/43f404d)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Chatgpt

- add master technical spec ([6057f19](https://github.com/Noah4ever/ai-chat-speed-booster/commit/6057f19)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Contributing

- split contributor guidance from README ([347e5a6](https://github.com/Noah4ever/ai-chat-speed-booster/commit/347e5a6)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Repo

- document maintainer setup ([75d6aca](https://github.com/Noah4ever/ai-chat-speed-booster/commit/75d6aca)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

### Refactors

#### Native

- split provider adapter records ([2ce356f](https://github.com/Noah4ever/ai-chat-speed-booster/commit/2ce356f)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

### Maintenance

- update changelog formatting ([d3f0379](https://github.com/Noah4ever/ai-chat-speed-booster/commit/d3f0379)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Quality

- harden script robustness ([3dcd13b](https://github.com/Noah4ever/ai-chat-speed-booster/commit/3dcd13b)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Repo

- make hook installer portable ([962fd06](https://github.com/Noah4ever/ai-chat-speed-booster/commit/962fd06)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- update changelog helper ([43f4a7e](https://github.com/Noah4ever/ai-chat-speed-booster/commit/43f4a7e)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- update local hook setup ([cfe1987](https://github.com/Noah4ever/ai-chat-speed-booster/commit/cfe1987)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add local setup script ([658d46c](https://github.com/Noah4ever/ai-chat-speed-booster/commit/658d46c)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add changelog updater ([86bddc9](https://github.com/Noah4ever/ai-chat-speed-booster/commit/86bddc9)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- improve client readiness ([041ac47](https://github.com/Noah4ever/ai-chat-speed-booster/commit/041ac47)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

### Other

- Update version numbers for Chrome and Firefox links ([4eeb4e1](https://github.com/Noah4ever/ai-chat-speed-booster/commit/4eeb4e1)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.4.5

### Features

- add version bump and packaging scripts, update .gitignore ([cb23507](https://github.com/Noah4ever/ai-chat-speed-booster/commit/cb23507)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Fixes

- remove unused variables to fix tsc --noEmit typecheck ([b596bbf](https://github.com/Noah4ever/ai-chat-speed-booster/commit/b596bbf)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- revert auto-load logic, prevent popup flash, and add version label (#29) ([3deae04](https://github.com/Noah4ever/ai-chat-speed-booster/commit/3deae04)) by **[infpdev (@infpdev)](https://github.com/infpdev)**

## v1.4.4

### Fixes

- ChatGPT scroll regressions, Auto Load opt-in, Hide-old toggle (#24) ([ad9442d](https://github.com/Noah4ever/ai-chat-speed-booster/commit/ad9442d)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Other

- Update Chrome version to v1.4.3 in README ([e3446b9](https://github.com/Noah4ever/ai-chat-speed-booster/commit/e3446b9)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.4.3

### Features

- weekly request counter for ChatGPT (#22) ([f30a546](https://github.com/Noah4ever/ai-chat-speed-booster/commit/f30a546)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- add auto-load on top scroll and fix Excel table bug ([8321bb4](https://github.com/Noah4ever/ai-chat-speed-booster/commit/8321bb4)) by **[infpdev (@infpdev)](https://github.com/infpdev)**

### Fixes

- auto-patch Safari signing and update install guide with screenshots ([0ebe872](https://github.com/Noah4ever/ai-chat-speed-booster/commit/0ebe872)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Other

- Merge pull request from infpdev/feat/auto-load ([issue #20](https://github.com/Noah4ever/ai-chat-speed-booster/issues/20)) ([5d349ef](https://github.com/Noah4ever/ai-chat-speed-booster/commit/5d349ef)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- Update Firefox version in README ([13a6ede](https://github.com/Noah4ever/ai-chat-speed-booster/commit/13a6ede)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.4.1

### Fixes

- remove 'tabs' permission from manifest files and update to 1.4.1 ([a40b618](https://github.com/Noah4ever/ai-chat-speed-booster/commit/a40b618)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Other

- Update Chrome version to v1.4.0 in README ([b178b89](https://github.com/Noah4ever/ai-chat-speed-booster/commit/b178b89)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- Update Firefox version in README ([bbce6d0](https://github.com/Noah4ever/ai-chat-speed-booster/commit/bbce6d0)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.4.0

### Features

- implement LRU caching for trimmed conversation responses ([bb549c6](https://github.com/Noah4ever/ai-chat-speed-booster/commit/bb549c6)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Fixes

- update version to 1.4.0 ([fc0c261](https://github.com/Noah4ever/ai-chat-speed-booster/commit/fc0c261)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.3.6

### Features

#### Gemini

- add dynamic reset handling and Gemini support; bump version to 1.3.5 ([c60fa37](https://github.com/Noah4ever/ai-chat-speed-booster/commit/c60fa37)) by **[infpdev (@infpdev)](https://github.com/infpdev)**

### Fixes

- remove previous message tracking and improve message initialization logic ([5523e7b](https://github.com/Noah4ever/ai-chat-speed-booster/commit/5523e7b)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- adjust message selectors for ChatGPT integration and update version to 1.3.6 ([934f31e](https://github.com/Noah4ever/ai-chat-speed-booster/commit/934f31e)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

#### Gemini

- improve scroll handling for dynamic sites and update mock page generation ([f42dd5a](https://github.com/Noah4ever/ai-chat-speed-booster/commit/f42dd5a)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- scrolling to the top on initial load and new messages ([ff00104](https://github.com/Noah4ever/ai-chat-speed-booster/commit/ff00104)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- fix DOMObserver dynamic loading support and update README for clarity ([03dc191](https://github.com/Noah4ever/ai-chat-speed-booster/commit/03dc191)) by **[infpdev (@infpdev)](https://github.com/infpdev)**

### Docs

- add credits section for fetch-interception ([38d69e7](https://github.com/Noah4ever/ai-chat-speed-booster/commit/38d69e7)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Other

- Update Chrome version to v1.3.4 in README ([f802734](https://github.com/Noah4ever/ai-chat-speed-booster/commit/f802734)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- Merge pull request from infpdev/feat/gemini-support ([issue #15](https://github.com/Noah4ever/ai-chat-speed-booster/issues/15)) ([9a17f09](https://github.com/Noah4ever/ai-chat-speed-booster/commit/9a17f09)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- Revise installation section in README.md ([edb1ca6](https://github.com/Noah4ever/ai-chat-speed-booster/commit/edb1ca6)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- Update Firefox version in README ([022a8a8](https://github.com/Noah4ever/ai-chat-speed-booster/commit/022a8a8)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- Update README with browser compatibility details closing ([issue #11](https://github.com/Noah4ever/ai-chat-speed-booster/issues/11)) ([e98f3b8](https://github.com/Noah4ever/ai-chat-speed-booster/commit/e98f3b8)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.3.4

### Features

- add theme toggle with dark/light mode support ([6704372](https://github.com/Noah4ever/ai-chat-speed-booster/commit/6704372)) by **[infpdev (@infpdev)](https://github.com/infpdev)**

### Fixes

- make theme toggle keyboard accessible ([2fbeb47](https://github.com/Noah4ever/ai-chat-speed-booster/commit/2fbeb47)) by **[infpdev (@infpdev)](https://github.com/infpdev)**

### Performance

- cache status indicator theme to avoid redundant style updates ([99aaf3d](https://github.com/Noah4ever/ai-chat-speed-booster/commit/99aaf3d)) by **[infpdev (@infpdev)](https://github.com/infpdev)**

### Maintenance

- update version to 1.3.4 in manifest and package files ([0b80db1](https://github.com/Noah4ever/ai-chat-speed-booster/commit/0b80db1)) by **[infpdev (@infpdev)](https://github.com/infpdev)**

### Other

- Merge pull request from infpdev/feat/theme-toggle ([issue #10](https://github.com/Noah4ever/ai-chat-speed-booster/issues/10)) ([bfea54d](https://github.com/Noah4ever/ai-chat-speed-booster/commit/bfea54d)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.3.3

### Features

- load more button shows number of messages to be loaded ([4cca323](https://github.com/Noah4ever/ai-chat-speed-booster/commit/4cca323)) by **Ryan Holman**

### Tests

- updated a test to include message load count ([8589bcc](https://github.com/Noah4ever/ai-chat-speed-booster/commit/8589bcc)) by **Ryan Holman**

### Maintenance

- automatic update of package-lock.json when I did npm install ([4591054](https://github.com/Noah4ever/ai-chat-speed-booster/commit/4591054)) by **Ryan Holman**

### Other

- Merge pull request from RyanHolmanClark/main ([issue #8](https://github.com/Noah4ever/ai-chat-speed-booster/issues/8)) ([86cf9a9](https://github.com/Noah4ever/ai-chat-speed-booster/commit/86cf9a9)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.3.2

### Other

- hide total count in status indicator when fast mode is on ([fa79b61](https://github.com/Noah4ever/ai-chat-speed-booster/commit/fa79b61)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.3.1

### Features

- "Load full conversation" button when fetch-trimmed messages exhausted ([dd3f05f](https://github.com/Noah4ever/ai-chat-speed-booster/commit/dd3f05f)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Fixes

- stop subsequent fetches from erasing the trimmed flag ([0839a8f](https://github.com/Noah4ever/ai-chat-speed-booster/commit/0839a8f)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- use DOM attribute instead of localStorage for trimmed flag ([d54b84a](https://github.com/Noah4ever/ai-chat-speed-booster/commit/d54b84a)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- increase fetch interceptor BUFFER_ROUNDS from 10 to 100 ([d8f6640](https://github.com/Noah4ever/ai-chat-speed-booster/commit/d8f6640)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- use Math.floor for /2 display divisions to prevent fractional counts ([ab1dac1](https://github.com/Noah4ever/ai-chat-speed-booster/commit/ab1dac1)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- align fetch interceptor limit with MessageManager's ×2 turn convention ([e1ca688](https://github.com/Noah4ever/ai-chat-speed-booster/commit/e1ca688)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Performance

- comprehensive performance overhaul for fast mode ([d7150de](https://github.com/Noah4ever/ai-chat-speed-booster/commit/d7150de)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.3.0

### Features

- add Fast Mode toggle to popup and background handler ([b0176a0](https://github.com/Noah4ever/ai-chat-speed-booster/commit/b0176a0)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- add MAIN-world fetch interceptor for response trimming ([d7aea4f](https://github.com/Noah4ever/ai-chat-speed-booster/commit/d7aea4f)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- add settings bridge content script ([8fa5b33](https://github.com/Noah4ever/ai-chat-speed-booster/commit/8fa5b33)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- add configurable fetch intercept definitions per site ([ee9d8a7](https://github.com/Noah4ever/ai-chat-speed-booster/commit/ee9d8a7)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- add fetchInterceptEnabled to config types and defaults ([6ea76d7](https://github.com/Noah4ever/ai-chat-speed-booster/commit/6ea76d7)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Tests

- update status indicator test to match /2 display values ([3db89a6](https://github.com/Noah4ever/ai-chat-speed-booster/commit/3db89a6)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Build

- register new content scripts in manifests and build pipeline ([6b10985](https://github.com/Noah4ever/ai-chat-speed-booster/commit/6b10985)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Maintenance

- bump version to 1.3.0 ([f129c3c](https://github.com/Noah4ever/ai-chat-speed-booster/commit/f129c3c)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.2.0

### Features

- add installation guides for Chrome, Edge, Firefox, and Safari ([eaaf662](https://github.com/Noah4ever/ai-chat-speed-booster/commit/eaaf662)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Fixes

- correct status values, improve indicator positioning, hide settings on unsupported sites ([135e842](https://github.com/Noah4ever/ai-chat-speed-booster/commit/135e842)) by **[infpdev (@infpdev)](https://github.com/infpdev)**

### Refactors

- move UI selectors to sites.config.json, fix display bug ([961634c](https://github.com/Noah4ever/ai-chat-speed-booster/commit/961634c)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Other

- Merge PR: fix status value bug, improve indicator positioning, preserve message limit, hide settings on unsupported sites ([issue #5](https://github.com/Noah4ever/ai-chat-speed-booster/issues/5)) ([0c55db8](https://github.com/Noah4ever/ai-chat-speed-booster/commit/0c55db8)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.1.9

### Fixes

- shorten manifest description for Chrome Web Store limit ([ae9d1c1](https://github.com/Noah4ever/ai-chat-speed-booster/commit/ae9d1c1)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Other

- Rename project references in README.md ([1a30284](https://github.com/Noah4ever/ai-chat-speed-booster/commit/1a30284)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.1.8

### Features

- overhaul selectors, SPA nav, visibility fixes, popup redesign ([3dcb0b3](https://github.com/Noah4ever/ai-chat-speed-booster/commit/3dcb0b3)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- green theme, rounded popup, and badge position picker ([3b174b6](https://github.com/Noah4ever/ai-chat-speed-booster/commit/3b174b6)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- redesign popup for generic AI, auto-save settings, fix scroll root ([8df3c1b](https://github.com/Noah4ever/ai-chat-speed-booster/commit/8df3c1b)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- improve turn detection, conversation change handling, and status indicator sync ([fee037d](https://github.com/Noah4ever/ai-chat-speed-booster/commit/fee037d)) by **[infpdev (@infpdev)](https://github.com/infpdev)**

### Fixes

- re-apply visibility on addMessages and simplify status indicator ([8989c58](https://github.com/Noah4ever/ai-chat-speed-booster/commit/8989c58)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- accumulate mutations across debounce to detect new message turns ([9705365](https://github.com/Noah4ever/ai-chat-speed-booster/commit/9705365)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- StatusIndicator finds actual scrolling element inside container ([ea30edb](https://github.com/Noah4ever/ai-chat-speed-booster/commit/ea30edb)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- overhaul site selectors and SPA navigation handling ([f32c58e](https://github.com/Noah4ever/ai-chat-speed-booster/commit/f32c58e)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Docs

- update README defaults, mark Claude tested, remove duplicate section ([96d84de](https://github.com/Noah4ever/ai-chat-speed-booster/commit/96d84de)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Other

- Add image to README for ChatGPT Speed Booster ([fbd4a6e](https://github.com/Noah4ever/ai-chat-speed-booster/commit/fbd4a6e)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- Revise README build instructions ([9fd6f96](https://github.com/Noah4ever/ai-chat-speed-booster/commit/9fd6f96)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.1.7

### Docs

- add AMO source submission build instructions ([3f4f1a1](https://github.com/Noah4ever/ai-chat-speed-booster/commit/3f4f1a1)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.1.6

### Fixes

- remove innerHTML usage for AMO validation ([9f550a2](https://github.com/Noah4ever/ai-chat-speed-booster/commit/9f550a2)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.1.5

### Fixes

- make release zip validation robust ([b22bf6f](https://github.com/Noah4ever/ai-chat-speed-booster/commit/b22bf6f)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.1.4

### Fixes

- enforce release package checks and firefox data permissions ([09081f7](https://github.com/Noah4ever/ai-chat-speed-booster/commit/09081f7)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.1.3

### Other

- fix release packaging layout ([a104019](https://github.com/Noah4ever/ai-chat-speed-booster/commit/a104019)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.1.2

### Features

- update Safari build instructions and add setup script ([b099ad5](https://github.com/Noah4ever/ai-chat-speed-booster/commit/b099ad5)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- update release workflow and update README ([a41a4e8](https://github.com/Noah4ever/ai-chat-speed-booster/commit/a41a4e8)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Fixes

- safari json trailing comma ([caaa1b6](https://github.com/Noah4ever/ai-chat-speed-booster/commit/caaa1b6)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- safari setup ([cf966c1](https://github.com/Noah4ever/ai-chat-speed-booster/commit/cf966c1)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Docs

- add Safari support setup and screenshots ([bc4206b](https://github.com/Noah4ever/ai-chat-speed-booster/commit/bc4206b)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.1.1

### Features

- update readme ([32924ed](https://github.com/Noah4ever/ai-chat-speed-booster/commit/32924ed)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.1.0

### Features

- update popup styles and improve settings layout ([8a1b18e](https://github.com/Noah4ever/ai-chat-speed-booster/commit/8a1b18e)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- new icons ([ae13024](https://github.com/Noah4ever/ai-chat-speed-booster/commit/ae13024)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- add Safari support ([e7178c0](https://github.com/Noah4ever/ai-chat-speed-booster/commit/e7178c0)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Docs

- update README ([800e91f](https://github.com/Noah4ever/ai-chat-speed-booster/commit/800e91f)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- update README ([57cd187](https://github.com/Noah4ever/ai-chat-speed-booster/commit/57cd187)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Other

- Merge pull request from Noah4ever/dev ([issue #1](https://github.com/Noah4ever/ai-chat-speed-booster/issues/1)) ([5ac6a52](https://github.com/Noah4ever/ai-chat-speed-booster/commit/5ac6a52)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.0.0

### Features

- initial extension with Chrome, Firefox, Edge, Safari support ([4a6ea5d](https://github.com/Noah4ever/ai-chat-speed-booster/commit/4a6ea5d)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Other

- Initial commit ([9a8a536](https://github.com/Noah4ever/ai-chat-speed-booster/commit/9a8a536)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
