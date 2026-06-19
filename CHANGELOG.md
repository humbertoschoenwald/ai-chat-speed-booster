# Changelog

## Unreleased

### Features

#### Chatgpt

- reload after mode switch ([aa742f7](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/aa742f703f23f0c20dd1a21ed92dee592cbdb0c7)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Counter

- add browser account counters (#25) ([222a802](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/222a802d16d9d22c5601eb610357632ca1783a1d)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Diagnostics

- add native overlay state model ([3931dd5](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/3931dd5c25a748071eb7eecf92635f267661c56d)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add telemetry marker model ([4386a58](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/4386a5806cebe6e4d6a69c5f54e6fa651ed0279d)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- expose observer batch status ([61da7e6](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/61da7e6f0b12e42367493085c97ab765f45bd997)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Native

- add retry state diagnostics ([fa4b36f](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/fa4b36f20d3c49aee3e8f6b79cefcd180da28169)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- budget snapshots by render-unit cost ([9416406](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/941640689c658b9108907de1a7e5fd7a5a385d9b)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- enforce chatgpt-only runtime ([01d95f9](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/01d95f940bd1cc59a2f2181216acb6cd9c619433)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- expose execution plan diagnostics ([74510e0](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/74510e04fa6e53c37615e234a83bb807997b5648)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add site adapter engine ([ad8de43](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/ad8de4329403b54873ec26c18bbf78709ed25e49)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Popup

- rename stable mode label ([fd4b918](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/fd4b918f998eda6a38c65314dd1fcdf6c331f8a4)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- separate native and legacy controls ([15fed41](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/15fed41929cf6877bea1c4942fcfc82318420a38)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add native mode controls ([ba83616](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/ba83616d5294e06d521f69174a17c790d3e9d1d4)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Settings

- add openai native mode boundary ([973df43](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/973df43344f6d4045fa0902d4746337f04ae5db5)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Sites

- support perplexity adapter ([ed4c3c5](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/ed4c3c56164f0d243bb2dade2d017b1d2b38a7ac)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- support grok adapter (#12) ([ab402f8](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/ab402f81a963ad18579b0bfaa76bd0fb8bf1480c)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- support deepseek adapter (#14) ([634faa7](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/634faa73de8de0fd6c0531b056983d57ecaacae2)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- support google ai mode adapter (#23) ([d5b5d99](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/d5b5d997eb0273740f40c845d7ce48dc194cbba9)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

### Fixes

#### Chatgpt

- add native sync failure cooldown ([2e8c099](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/2e8c099ff7a3dc5306162252357c2aecd4d5f19a)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- guard native snapshot freezing ([c5ce050](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/c5ce050caf0328b982c733a8937c674ee22cef9f)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- isolate stable boot artifact cleanup ([9e2adf2](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/9e2adf2bebadbe2884f506eccc8ca70e1be94cd3)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- prevent native CSS bleed in stable mode ([f107713](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/f107713e0f8b6716d8c3c6870f9b27aa67cab8e9)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- preserve fast mode mapping references ([949c1b1](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/949c1b15b72fb3d56bba0fd2c1b760e867f30801)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- track outer turn containers ([ad369eb](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/ad369ebec9c894b04dd28f6c31e92d32e4081950)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- avoid undercounting virtualized messages ([72e9256](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/72e9256ed90f2102e21701892a7bf6d53341a8a4)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- reapply legacy hiding after host reveal (#24) ([d43fccd](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/d43fccd9520326004712eaa9f3014cb1969df395)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- aggregate virtualization conflict signals (#24) ([dc1ac16](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/dc1ac168d742f4c802438eada96fa4cd5eb38ae9)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add virtualization conflict detector (#24) ([befba90](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/befba909b2fa07e667ddad071fe60f62893171b4)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Clean

- preserve loaded chrome extension build ([2dc73e5](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/2dc73e572c1eb81a0e94769140ff2d74898b1ccb)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Counter

- accept global failure elements (#30) ([2e65b27](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/2e65b27df689bf3eada1dd7a51f6741fed8a359c)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- observe global rejected UI (#30) ([cf08ac6](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/cf08ac67c7a00165621af19728996920e4c3e47e)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- cancel unaccepted requests (#30) ([e4b20a1](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/e4b20a1b44636027d748825032da16abe9db37f3)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- type default request reporter ([ec8fa5c](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/ec8fa5cd3f801702fed86db67dde1372fae7cfb8)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- count only accepted chat requests (#30) ([cf4eeb1](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/cf4eeb14322d15f18d4068bd01392e7b5da9f0fc)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Diagnostics

- bound native diagnostic details ([f45307d](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/f45307dc4d384cf960ce9fa5ba1b4b1b870df914)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Fast Mode

- suppress misleading message counts ([71479ae](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/71479aef4e6e60beb5c8046af2870b94d778a79d)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Lifecycle

- distinguish missing content script (#31) ([940c839](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/940c839326a13548f7701c899c73432b13f86d7e)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- recover stale content bootstrap ownership (#31) ([f028fb0](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/f028fb06e61b8c4d949139c0f21336f1c4a4d585)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- degrade on observer callback errors (#31) ([c1dd9dd](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/c1dd9dd0659260d91e7ee0aa6e1b20514cf5bc8a)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- guard duplicate content bootstrap (#31) ([4607215](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/4607215b93b700f931b44c44d2311461ee1aa7e7)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- clarify popup health states (#31) ([06bea7f](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/06bea7fa011950a1931863206ddee8ea4c62fca8)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- recover on page resume (#31) ([84c7ed8](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/84c7ed8a9efa8112391a5be04292bfac2a754808)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- report content health status (#31) ([af9ca0e](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/af9ca0e3f964f32684d0793726aea8e62630151a)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- recover status indicator after host removal (#31) ([29722ca](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/29722ca61cfaf51058717e835fbdba5d2763a1b2)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Native

- disable conflicting virtualization subfeature (#24) ([bab8cbc](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/bab8cbcbb8dc5d4e5fab169aa13d40dc55b30dfe)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Popup

- repair status regressions ([6a2408e](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/6a2408ed0649b41ad6a16223e450d3dcb78bd6d0)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- preserve Stable controls when switching Native ([faec269](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/faec26986e5431f280797165678b1ae804595ff4)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- restore mode-specific native controls ([5d7681e](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/5d7681ef78ef1366ed06c362109dc17c5bd32bab)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- hide native-only controls in stable mode ([17e6393](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/17e63939973333cd225df53fe768966486afa94b)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Requests

- delay accepted request storage (#30) ([92db52d](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/92db52d13db93dbce6a7e3912f71f5a2319a14c3)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Settings

- default fast mode off ([4d380b8](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/4d380b827046e6cb76064038ab0f2067fa73a771)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- restore stable defaults on mode switch ([b91caae](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/b91caae5f4f43f74c06abc26348d191e87b8f8a0)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Sites

- match Perplexity www host ([e82e15e](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/e82e15ea43679c16a80fdf748b5942339a54dedd)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- target google ai mode turns (#23) ([9cea8b7](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/9cea8b781c4c7c3f1b767a99515a3a493b4a0906)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- finish search ai mode adapter (#23) ([e40c281](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/e40c2816ab51edeff1c76f59d051a6b4c519572e)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Streaming

- add stale generation detector model ([2c5b617](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/2c5b61788d20ba10c4c2832c9a1e8bd11ed5bf64)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Tests

- lazy resolve extension api ([ad40490](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/ad404901db0064690c4a9b935f0c2f1be28a9584)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- use installed Playwright test package ([d7093d6](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/d7093d6934fe459ea3723926f7a47e359db6d8a1)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Ui

- show raw load-more count ([0bf04aa](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/0bf04aa7f8694b62a38f77f5e34dd5a70387d978)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Validate

- preserve chrome build and use ascii output ([1cad666](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/1cad66601333c95e6612b3a16a6c2e4057ea7964)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

### Performance

#### Chatgpt

- add text snapshot cache ([ce34dca](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/ce34dca410b2b1f0d8735d999bb917848a4c0d7c)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add layout measurement cache ([5573be9](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/5573be92d60c051f4bebf2f21b608c0d30b5b26d)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add full-fidelity layout plan ([ca2ed40](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/ca2ed40cf66669c19e414835941e0a6b0f0e4cd9)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add native safety wrapper ([211aa4e](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/211aa4ef60e85c5f39385bac0df330ba3c8866dd)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Editor

- defer work during input latency windows ([d27bacd](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/d27bacdd2cf047c799f869ee37c2170193e3f3d8)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Input

- record large paste plans ([3a30154](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/3a301541b3004a1a571bd6b3b13cad40cd4bf9d1)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add input chunk planner model ([c9ceb3c](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/c9ceb3cbeb2b5b1eabc9a931da6f666a2a55e33d)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add native editor input guard ([4f55797](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/4f55797e4886d7d17455a7bff77505788f433ec4)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Memory

- add page resource pruner model ([36b1f3e](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/36b1f3ee2ba89fbacb70c028762836d576de9091)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Messages

- index tracked message ids ([d0d6bf6](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/d0d6bf6b5f555b281aa869f215bb181e073eafdf)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Native

- add ChatGPT quiet snapshots and token diagnostics ([59aab79](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/59aab79ea672a75c7b6993e07b34153802966ffd)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add execution plan gate ([95b4918](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/95b49184563293509de81215fcd0f8f7d595a775)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add chatgpt tuning profile ([9f07209](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/9f07209db35fa4c31c9c64e746ce37bcf26d2f44)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add feature gate model ([13128ad](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/13128adc6937ee0acf3a8c01b7ae970f6157a501)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add scheduler counters ([0f8ceb1](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/0f8ceb167dc684f1be3a7364aca9c25a99184b9f)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- wire guarded native controller ([522e328](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/522e328576b397af9597f164acc8ab92e2b8e0fd)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add scroll geometry diagnostics ([239f63f](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/239f63f42df48ffbb9df50f18b8ed45147af6525)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add turn registry model ([86295fb](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/86295fb1b3fa7da1d6c87108949702826c9db194)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Observer

- add mutation batch diagnostics ([5f3d4d6](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/5f3d4d64e5da9426b191b52efde6f3ccc086674a)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Popup

- render cached status immediately ([aeac417](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/aeac417439a79d0710dcb0b6698e799fc71e97bd)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Storage

- add safe turn measurement cache model ([2a90ad8](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/2a90ad8862e23a09bc1d56afabee76d11c20ae48)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Tabs

- add multi-tab coordinator model ([d51acb4](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/d51acb49ec9a444e78bda76364e6745251c52a28)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Toolcalls

- add tool-call group model ([9bd21a8](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/9bd21a83d4754198731c3d3881af1e5573089cc2)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Validate

- default to chrome build checks ([3ef1598](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/3ef1598e1f79dff596760a18dcde2a258bed4c70)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- keep default checks fast ([77830f5](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/77830f532a54263b6f4f6ba2d4e2f9f5e54cceae)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- reuse the initial build across checks ([829f1ce](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/829f1cec2ed7fc547990455ad59647317af4100f)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Virtualization

- add scroll offset policy ([f12a45d](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/f12a45df14f0f045fb902738a14227695d13a29b)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add size plan model ([47ef7b3](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/47ef7b3fb089533a70dc7ca0a89647ad907c953b)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add eligibility gate ([26544f5](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/26544f57fc6b75c40722e160c90333062e58a53d)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add restore policy model ([edb5399](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/edb53998ef2428a22fb287983b6043bb4f5232ef)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add turn virtualizer planner ([ab08ccd](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/ab08ccdc518237e838fca0c1622eca3298a3f36d)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add frozen turn cache model ([105bd04](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/105bd0460cd06ac167b3231b638bbb9449a97c6d)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

### Tests

#### Counter

- cover per-site accepted counts ([7858e48](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/7858e482f7eaef1ef05cbb17f97b844cf934e110)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- cover request lifecycle model (#30) ([01e45ea](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/01e45ea76ce628cb64b394cc08e47c3ab7265878)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- make request lifecycle reporter injectable (#30) ([e3176aa](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/e3176aaf9a1766ceebe32e5eaca7e8114264c639)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Editor

- cover beforeinput guard in matrix ([237c8a3](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/237c8a368dbe78bdfe1d0c96acdcf6d26fea269b)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Extension

- update test visibility flag ([c43737d](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/c43737d0081b7d0c427e0e85fd6032e5dea0b0c2)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- register site regressions conditionally ([3ae5456](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/3ae54563d46ac66c7d87e5773bff6f5068d6869e)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Mode

- cover issue parity across Stable and Native ([cfb14e8](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/cfb14e84dbba43118ac089126a2146de972fa61c)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Native

- count third scroll oscillation sample (#24) ([7769e92](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/7769e9272e8f826e09a3127928f310437db51047)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- cover cache model boundaries ([28b31e5](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/28b31e5296e7b49e2543a276e9cd4ecfd463eae9)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- cover native guard models ([8c06aee](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/8c06aee4466bb7e8b169f8b33f854bfaff621010)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Safari

- add compatibility validation track ([aad54a2](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/aad54a22ee443c4e132c18002d2f55f683f3d782)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Validate

- speed up full extension checks ([4ae404f](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/4ae404fcb6ef49d6210b0f136678f76634a4f14e)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

### CI

- fix pnpm setup version ([4699d29](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/4699d290722152a5d175b2a590d0f7eb74faa700)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- fix workflow setup order ([e5109b5](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/e5109b5b33ae9f7fcc02ff8ade75f29bfd2b7f6d)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- update workflow actions ([dcc37c4](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/dcc37c4d5d9e2697b7fddf4e3fe81923b4f258de)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Github

- add validation and release automation ([6a7245b](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/6a7245b23ae93c8a14b6de74890fde3b64291ba5)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Release

- ignore release metadata changelog commit ([d0f7829](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/d0f7829956e2a8cf506545b00ceb4ce5e23cb633)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- use Node 24 actions ([4721ac8](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/4721ac84fc75685d85845bd886e1836a33435df5)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

### Build

#### Deps

- migrate to pnpm ([1e04335](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/1e04335f38f52ab75530defb9f19cd7e61936985)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Validation

- expand pnpm validation gate ([40aa19a](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/40aa19a3ca4c029fa734513c9f3f28fb535bb9ac)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

### Docs

- add website link to README for easier access ([6751f4a](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/6751f4ae0079042ece2c2e9eae2ef70ccb70b7eb)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

#### Adr

- normalize decision record taxonomy ([43f404d](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/43f404d488274ea081e9d33df856181277bd08d2)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Chatgpt

- reject token progress UI ([31fd22c](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/31fd22ce9ae786d6144ff717c2381a44909c20f9)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add master technical spec ([6057f19](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/6057f190e38fa87f0420551cacb93b0c53986c0d)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Contributing

- split contributor guidance from README ([347e5a6](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/347e5a6247bf41d3290f27b7f1f7804ff86c735d)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Repo

- document maintainer setup ([75d6aca](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/75d6acab90484cb15bbf815a01a69e17406f08d2)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

### Refactors

#### Chatgpt

- centralize native renderer lifecycle ([fef27fe](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/fef27fefb19c91821a286a2192c6d61728764ff2)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Native

- split provider adapter records ([2ce356f](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/2ce356f15deb091504494f7420492b9e1a576029)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

### Maintenance

- update changelog formatting ([d3f0379](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/d3f03797a621aeda3cd1d864b81b23de338787f2)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Quality

- harden script robustness ([3dcd13b](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/3dcd13b5c6cf51dd9aa1eebbad6cbdd9ee67fcee)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

#### Repo

- make hook installer portable ([962fd06](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/962fd06270966cd17f8fc0668c7f0021ecb73493)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- update changelog helper ([43f4a7e](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/43f4a7e7338450bfdf24d5023e3488d4692f7cca)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- update local hook setup ([cfe1987](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/cfe1987f9d2317525163cb0663e2fad4ea71d2de)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add local setup script ([658d46c](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/658d46ce7c8174c13fd3bc7bced5382c9e77e8bb)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- add changelog updater ([86bddc9](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/86bddc9644ef4773fce35e00581621044aac84fd)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**
- improve client readiness ([041ac47](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/041ac47e3d569de3d6e0f172df7a44c3feceb62c)) by **[Humberto Schoenwald (@humbertoschoenwald)](https://github.com/humbertoschoenwald)**

### Other

- Update version numbers for Chrome and Firefox links ([4eeb4e1](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/4eeb4e15b7042a225dbffe38225d331abd2b6f01)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.4.5

### Features

- add version bump and packaging scripts, update .gitignore ([cb23507](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/cb235077485e7763f25b0d67a5926fa0bcb6c900)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Fixes

- remove unused variables to fix tsc --noEmit typecheck ([b596bbf](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/b596bbf752b86bbf93925d836eb891bec659952e)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- revert auto-load logic, prevent popup flash, and add version label (#29) ([3deae04](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/3deae0469dd6ed4e6838477d1a3132358d9b4317)) by **[infpdev (@infpdev)](https://github.com/infpdev)**

## v1.4.4

### Fixes

- ChatGPT scroll regressions, Auto Load opt-in, Hide-old toggle (#24) ([ad9442d](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/ad9442d4f8c908419c6c33c83f46aac7beb1ad57)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Other

- Update Chrome version to v1.4.3 in README ([e3446b9](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/e3446b924e35dd4ff01d96ca6ebb07ca36294b65)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.4.3

### Features

- weekly request counter for ChatGPT (#22) ([f30a546](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/f30a546fb66fa220af7f6fcdce6912760e564009)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- add auto-load on top scroll and fix Excel table bug ([8321bb4](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/8321bb4d1d19c0a931e83977f41bab550cf47400)) by **[infpdev (@infpdev)](https://github.com/infpdev)**

### Fixes

- auto-patch Safari signing and update install guide with screenshots ([0ebe872](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/0ebe8721cdb71dc99e45e26196b61dca7f76784b)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Other

- Merge pull request from infpdev/feat/auto-load ([issue #20](https://github.com/humbertoschoenwald/ai-chat-speed-booster/issues/20)) ([5d349ef](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/5d349ef251339fff56365498f5cdac47052e7f58)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- Update Firefox version in README ([13a6ede](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/13a6ede976d22a533f5980ce5855df20dfb516cb)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.4.1

### Fixes

- remove 'tabs' permission from manifest files and update to 1.4.1 ([a40b618](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/a40b6189d47250e5949a999c351c72539b87e7e6)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Other

- Update Chrome version to v1.4.0 in README ([b178b89](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/b178b890a1b5bc4bc6b14a740915d2b2c06690ef)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- Update Firefox version in README ([bbce6d0](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/bbce6d062393cf795dc4477f54c37c5ad5f08950)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.4.0

### Features

- implement LRU caching for trimmed conversation responses ([bb549c6](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/bb549c6ec7f5253fcff922bace36129c94782e69)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Fixes

- update version to 1.4.0 ([fc0c261](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/fc0c261625221efc27377e5a95b89ae8a02f3e00)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.3.6

### Features

#### Gemini

- add dynamic reset handling and Gemini support; bump version to 1.3.5 ([c60fa37](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/c60fa377305806cefc6fb75027427dc1f7d73c1c)) by **[infpdev (@infpdev)](https://github.com/infpdev)**

### Fixes

- remove previous message tracking and improve message initialization logic ([5523e7b](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/5523e7b22c906e653703f193efb33914e5b013f5)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- adjust message selectors for ChatGPT integration and update version to 1.3.6 ([934f31e](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/934f31e344d4ba2284bfe0e836ebcf3b45680b83)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

#### Gemini

- improve scroll handling for dynamic sites and update mock page generation ([f42dd5a](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/f42dd5a0e5357fa8881864cd730595d17ca2b99b)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- scrolling to the top on initial load and new messages ([ff00104](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/ff00104ed0ab58e9a57f0f41255ced9ce42f3b46)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- fix DOMObserver dynamic loading support and update README for clarity ([03dc191](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/03dc19140db8a2eb83a5a228fbfb0a7d21abd013)) by **[infpdev (@infpdev)](https://github.com/infpdev)**

### Docs

- add credits section for fetch-interception ([38d69e7](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/38d69e7bc526e678d44a88464c06dfb66bddcad2)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Other

- Update Chrome version to v1.3.4 in README ([f802734](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/f802734a9703fcb6f8818835e219702a9b466ee1)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- Merge pull request from infpdev/feat/gemini-support ([issue #15](https://github.com/humbertoschoenwald/ai-chat-speed-booster/issues/15)) ([9a17f09](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/9a17f0938de6ab1ef0b331091292852bdff92adb)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- Revise installation section in README.md ([edb1ca6](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/edb1ca620c3c674b364ea5a7a70d7978455e8b10)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- Update Firefox version in README ([022a8a8](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/022a8a891dfcec2e28b9dd795b02b32bfb75992c)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- Update README with browser compatibility details closing ([issue #11](https://github.com/humbertoschoenwald/ai-chat-speed-booster/issues/11)) ([e98f3b8](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/e98f3b8972e53523a3b4cc7bab0c4ae812ba522c)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.3.4

### Features

- add theme toggle with dark/light mode support ([6704372](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/6704372d2526c298371848dfcf48679e00c66c6f)) by **[infpdev (@infpdev)](https://github.com/infpdev)**

### Fixes

- make theme toggle keyboard accessible ([2fbeb47](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/2fbeb4771f09f14767ed18a1ed2fe274cedd2da0)) by **[infpdev (@infpdev)](https://github.com/infpdev)**

### Performance

- cache status indicator theme to avoid redundant style updates ([99aaf3d](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/99aaf3d775cd38c07210ac57f267578289f5639d)) by **[infpdev (@infpdev)](https://github.com/infpdev)**

### Maintenance

- update version to 1.3.4 in manifest and package files ([0b80db1](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/0b80db115e8817273ecb204f58b6623feaf9f5b3)) by **[infpdev (@infpdev)](https://github.com/infpdev)**

### Other

- Merge pull request from infpdev/feat/theme-toggle ([issue #10](https://github.com/humbertoschoenwald/ai-chat-speed-booster/issues/10)) ([bfea54d](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/bfea54d4c52962b48f33cba100e1a5b329d25ae3)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.3.3

### Features

- load more button shows number of messages to be loaded ([4cca323](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/4cca323b60774a94d73f3a0ef43e3887bad88290)) by **[Ryan Holman (@RyanHolmanClark)](https://github.com/RyanHolmanClark)**

### Tests

- updated a test to include message load count ([8589bcc](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/8589bccba428217a5d268dbef6240852c410fdbc)) by **[Ryan Holman (@RyanHolmanClark)](https://github.com/RyanHolmanClark)**

### Maintenance

- automatic update of package-lock.json when I did npm install ([4591054](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/4591054ae87b416bf339676ee722a401e8fae2aa)) by **[Ryan Holman (@RyanHolmanClark)](https://github.com/RyanHolmanClark)**

### Other

- Merge pull request from RyanHolmanClark/main ([issue #8](https://github.com/humbertoschoenwald/ai-chat-speed-booster/issues/8)) ([86cf9a9](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/86cf9a986dbe7930cd1d5db5ba71849fa9de87cb)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.3.2

### Other

- hide total count in status indicator when fast mode is on ([fa79b61](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/fa79b617e0d8eacea6b42be76c3f108d1773fd83)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.3.1

### Features

- "Load full conversation" button when fetch-trimmed messages exhausted ([dd3f05f](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/dd3f05fc1701e46db777a0d107f9c65139fa6b1a)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Fixes

- stop subsequent fetches from erasing the trimmed flag ([0839a8f](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/0839a8fd692b77ed3d074652e825ab82870c2317)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- use DOM attribute instead of localStorage for trimmed flag ([d54b84a](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/d54b84a1a247c1162292f17a9990357197c826b8)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- increase fetch interceptor BUFFER_ROUNDS from 10 to 100 ([d8f6640](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/d8f66406c1d393b25725e420a887208d39514290)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- use Math.floor for /2 display divisions to prevent fractional counts ([ab1dac1](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/ab1dac105982499a6fda51fd6f1cd3dcef229ae3)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- align fetch interceptor limit with MessageManager's ×2 turn convention ([e1ca688](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/e1ca6883f0afe78daabe5669dd681ffd85c3b390)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Performance

- comprehensive performance overhaul for fast mode ([d7150de](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/d7150decf746f7226bfa68c5b23927292029837e)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.3.0

### Features

- add Fast Mode toggle to popup and background handler ([b0176a0](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/b0176a00f94e40d7bd2918856da480853bf79b8e)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- add MAIN-world fetch interceptor for response trimming ([d7aea4f](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/d7aea4fc2693f54fc968668d1d3eb8c5fe28913b)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- add settings bridge content script ([8fa5b33](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/8fa5b33ea4c9c2a421c35bcbce870ee26da14162)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- add configurable fetch intercept definitions per site ([ee9d8a7](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/ee9d8a7aab0b145ebff0b959f2bbc17635a20a67)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- add fetchInterceptEnabled to config types and defaults ([6ea76d7](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/6ea76d732498ae5b278dc4ab6314c922a750d64f)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Tests

- update status indicator test to match /2 display values ([3db89a6](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/3db89a6a7ee5258ebb3a512d85b93ed995a98f1f)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Build

- register new content scripts in manifests and build pipeline ([6b10985](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/6b109854f7fee5149ef3a364d5bf03c81b479c36)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Maintenance

- bump version to 1.3.0 ([f129c3c](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/f129c3c5b2620e64a6be34fe0a4963d3e99e6969)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.2.0

### Features

- add installation guides for Chrome, Edge, Firefox, and Safari ([eaaf662](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/eaaf66230db755a942f9d4a8cfa935f1f016abd9)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Fixes

- correct status values, improve indicator positioning, hide settings on unsupported sites ([135e842](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/135e84226da0f4b00e2be051a81c731c2cdcddb4)) by **[infpdev (@infpdev)](https://github.com/infpdev)**

### Refactors

- move UI selectors to sites.config.json, fix display bug ([961634c](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/961634cd3cbabaeeae73d46e7e6dd2a406c68e27)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Other

- Merge PR: fix status value bug, improve indicator positioning, preserve message limit, hide settings on unsupported sites ([issue #5](https://github.com/humbertoschoenwald/ai-chat-speed-booster/issues/5)) ([0c55db8](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/0c55db86e973546c8d520e9040fab2a3ab7ff1e1)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.1.9

### Fixes

- shorten manifest description for Chrome Web Store limit ([ae9d1c1](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/ae9d1c1231c61c153f2bc3bef72a61cb90028daf)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Other

- Rename project references in README.md ([1a30284](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/1a30284a1fc6263786c69942f01ea8aee1ef14d7)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.1.8

### Features

- overhaul selectors, SPA nav, visibility fixes, popup redesign ([3dcb0b3](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/3dcb0b36d9d76e5572d0382275c4b9d10614a1ce)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- green theme, rounded popup, and badge position picker ([3b174b6](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/3b174b613577ffe724e4d3f2e338dceb5245179d)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- redesign popup for generic AI, auto-save settings, fix scroll root ([8df3c1b](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/8df3c1bd408e12557f5378c33cc2a6193f979a5f)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- improve turn detection, conversation change handling, and status indicator sync ([fee037d](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/fee037d547bb64bf7a3fa67dad633be5caa9eefa)) by **[infpdev (@infpdev)](https://github.com/infpdev)**

### Fixes

- re-apply visibility on addMessages and simplify status indicator ([8989c58](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/8989c58e51c88cb51dab59fe2d326fdd839eb754)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- accumulate mutations across debounce to detect new message turns ([9705365](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/970536556596703bbfab7cce53e76b4adfe5b871)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- StatusIndicator finds actual scrolling element inside container ([ea30edb](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/ea30edb5baae5f4b534e653037c49e22a37e4168)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- overhaul site selectors and SPA navigation handling ([f32c58e](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/f32c58ef5726b6b934f27df4821cf7f6bbec8669)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Docs

- update README defaults, mark Claude tested, remove duplicate section ([96d84de](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/96d84ded820d29144f825de9753a10587fe947a0)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Other

- Add image to README for ChatGPT Speed Booster ([fbd4a6e](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/fbd4a6ea78f6f550f4b044eacfc52bc6a98676b3)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- Revise README build instructions ([9fd6f96](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/9fd6f96896a41a6005b1ff93cea4f15b29859c72)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.1.7

### Docs

- add AMO source submission build instructions ([3f4f1a1](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/3f4f1a16411d01529b0a52ae48cf93d8e364ea15)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.1.6

### Fixes

- remove innerHTML usage for AMO validation ([9f550a2](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/9f550a2dbf3725a55a9101ca178359a06ca4cca8)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.1.5

### Fixes

- make release zip validation robust ([b22bf6f](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/b22bf6f3d2da831d4e5bb8c660dffb97757c0332)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.1.4

### Fixes

- enforce release package checks and firefox data permissions ([09081f7](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/09081f7e2673877733be6311fe6f48c0b5da3732)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.1.3

### Other

- fix release packaging layout ([a104019](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/a1040197a9398378aa9cde8cd85b9e43116c4436)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.1.2

### Features

- update Safari build instructions and add setup script ([b099ad5](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/b099ad5f2777f31026a8a61161ff7bf0d0f06c19)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- update release workflow and update README ([a41a4e8](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/a41a4e858a164f7f40b5eb3f1a4d0b359a1635ed)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Fixes

- safari json trailing comma ([caaa1b6](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/caaa1b64d53a0e15c461436dc5748d952bbfedde)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- safari setup ([cf966c1](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/cf966c1a1449e89c98c79809490df934f1077409)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Docs

- add Safari support setup and screenshots ([bc4206b](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/bc4206b76416d1e52b4d585acccaecfb237f397d)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.1.1

### Features

- update readme ([32924ed](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/32924ede94d966a7b6108a105ae183ad0f6ef10a)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.1.0

### Features

- update popup styles and improve settings layout ([8a1b18e](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/8a1b18ec9443d7057d15b087da0ba90239fc15b3)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- new icons ([ae13024](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/ae13024444dae57a6aad098ab1c0be3e48fc51e0)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- add Safari support ([e7178c0](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/e7178c05086d60f10a3aec23e79bf0f4dea18736)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Docs

- update README ([800e91f](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/800e91f58646813b82cc471fd7b415c5b83c8690)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
- update README ([57cd187](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/57cd187bf5734be5d4cca6dd6a6107dbdd1d271f)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Other

- Merge pull request from Noah4ever/dev ([issue #1](https://github.com/humbertoschoenwald/ai-chat-speed-booster/issues/1)) ([5ac6a52](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/5ac6a5276e13f5b7c979981742ba77296679537a)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

## v1.0.0

### Features

- initial extension with Chrome, Firefox, Edge, Safari support ([4a6ea5d](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/4a6ea5d9430ae6202c6bcfabceab0f2e1fa3fdb7)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**

### Other

- Initial commit ([9a8a536](https://github.com/humbertoschoenwald/ai-chat-speed-booster/commit/9a8a536e04e92f7bd0f5f9e0b56e2022ea3a2efb)) by **[Noah Thiering (@Noah4ever)](https://github.com/Noah4ever)**
