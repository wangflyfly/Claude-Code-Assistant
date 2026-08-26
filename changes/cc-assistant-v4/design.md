# Design: CC Assistant v4（社区 Skill 目录 + GitHub Pages + 课程阶段映射）

## Context

**现状**：v3 把「学 Claude Code 的能力」做成模块化课程（`cc-assistant/modules/`，core ~ capstone 共 11 模块，不含 m0-onboarding），课程教学引擎写在 `cc-assistant/SKILL.md`，由 Claude 运行时执行。课程之外大量优质社区 skill 无聚合入口；项目开源后网友推荐 skill 无机制化路径。

**约束**：

- 全程本地、零上传（课程侧）；网页为公开静态站（发布源 = `site/`，仅用户主动访问时读取仓库内静态文件）
- 收录范围仅 Claude Code skills（SKILL.md 形态）
- 无后端、无前端框架、无数据库
- 合入权始终在维护者
- **跨 change 协调**：v3 正在 `executing`、拥有 `cc-assistant/modules/*.md` 与根 CLAUDE.md 的 Project 段指针 / Architecture 更新权；v4 只**追加**根 CLAUDE.md 目录子系统说明段，课程集成改动**待 v3 模块文件稳定后执行**，不提前改动正在被 v3 编辑的文件

**Stakeholders**：课程学习者（想按模块找更多好 skill）、社区贡献者（想推荐 skill）、维护者（审核收录）、CI（自动校验与再生成）。

## Goals

- G1：`catalog/catalog.json` 为唯一事实源，无第二份人工维护的目录数据
- G2：社区贡献走「PR 模板 → CI 校验 → 维护者审核」机制化路径
- G3：主题词表与课程映射独立于课程结构，课程改模块不破坏目录
- G4：GitHub Pages 静态站按主题 / 课程模块筛选浏览，无需人工改动即自动展示新收录
- G5：v3 课程每模块内置本地快照展示对应主题社区 skill，运行时不联网
- G6：保持 v3「全程本地、零上传」哲学

## Decisions

### D1 数据流：catalog → sync 脚本 → 三个机器生成产物

**Choice**：`catalog/sync-catalog.mjs` 以 `catalog/catalog.json` + `catalog/course-mapping.json` 为输入，机器生成三个产物：

1. `site/data/catalog.json`（网页数据副本）
2. `site/data/course-mapping.json`（模块 → 主题，网页课程阶段筛选需要——`site/` 是发布源，客户端无法读取 `site/` 外的 `catalog/`，必须随站带一份）
3. `cc-assistant/modules/_community-skills.md`（课程快照，按主题分组，随课程分发）

**Rationale**：单一事实源 + 机器生成，杜绝二次人工录入；网页、快照、CI 三者共享同一数据，天然一致。
**Alternatives**：

- 网页直接读 `catalog/course-mapping.json`（拒绝：发布源限定 `site/`，`catalog/` 不随站公开）
- 手工维护 `site/data/`（拒绝：漂移风险，违反「网页无需人工改动」成功标准）
- 运行时从远端拉取目录（拒绝：破坏课程侧零上传；目录只做发现不做托管分发）

> **spec 同步**：REQ-CIV-003 / 004 / 005 措辞扩展为「site/data/ 数据文件（catalog.json 与 course-mapping.json）」以匹配本决策。

### D2 同步时机：CI 合入再生成 + 本地双模式

**Choice**：合入 `main` 后由 CI `sync` job 重新生成产物并提交（workflow 用 GITHUB_TOKEN 提交，GitHub 防递归触发，不会再次触发 push 事件）；维护者 / 贡献者本地可用 `node catalog/sync-catalog.mjs`（生成）与 `node catalog/sync-catalog.mjs --check`（校验一致性，退出码 0 = 一致）。
**Rationale**：满足「合入后网页无需人工改动即自动展示」；`--check` 支撑 REQ-CIV-004 防漂移与 REQ-CIV-005 本地可跑。
**Alternatives**：

- 仅维护者本地手动跑（拒绝：依赖记忆，易漏生成）
- 仅 PR 时校验不生成（拒绝：合入后产物不会自动更新，违背成功标准）

### D3 产物入库提交（不 gitignore）

**Choice**：`site/data/catalog.json`、`site/data/course-mapping.json`、`cc-assistant/modules/_community-skills.md` 均为**必须入库提交**的生成产物（GitHub Pages 只服务已提交文件）；`.gitignore` 仅加说明注释（如 `# site/data 与 _community-skills.md 为入库生成产物，勿手工编辑`），不忽略它们。
**Rationale**：Pages 基于提交的仓库内容发布；CI 合入再生成保证不落后；`.gitignore` 注释防止他人误加忽略。
**Alternatives**：加入 `.gitignore`（拒绝：Pages 将无法服务）；生成但每次 CI 重建站点（拒绝：本设计无站点构建链）。

### D4 主题词表：独立机器可读唯一源 + 初始集合

**Choice**：`catalog/topics.json` 为唯一机器可读词表（每主题 `id` + `description`）；`catalog/topics.md` 仅人类可读说明 + 扩充流程；校验判据以 `topics.json` 为准。**初始集合**由 11 个课程模块主题推导，starter 集（tasks 阶段定稿）大致为：`core-workflow`、`skills`、`rules`、`hooks`、`mcp`、`memory`、`plugins`、`sdk`、`subagent`、`headless`、`plan-mode`、`engineering`、`project-workflow`。扩充流程：新增主题 = 提 PR 改 `topics.json` + `topics.md`，走同一 CI 校验 + 维护者审核。
**Rationale**：词表与课程结构解耦，课程改模块只改映射不碰词表；机器可读唯一源使 CI 可机械校验。
**Alternatives**：把主题硬编码进 `catalog.json`（拒绝：无法独立于课程演进）；`topics.md` 作为校验源（拒绝：人类文档不可做机械判据，REQ-CMP-001）。

### D5 课程映射：模块级、无 phase 粒度

**Choice**：`catalog/course-mapping.json` 把 11 个模块键（文件名 slug，剔除 `m0-onboarding`）各映射到非空主题子集；只到模块级，不做 phase（进阶/高阶）粒度。CI 校验（REQ-CIV-002 / REQ-CMP-004）：映射键与 `cc-assistant/modules/*.md` 文件名一致，且引用的主题 ∈ `topics.json`。**初始映射值**由 T4 依各模块教学内容推导定稿（每模块映射其涉及的主题），design 不预置具体赋值、以 REQ 约束覆盖非空性与词表归属。
**Rationale**：课程改模块（增删/改名）只改映射，`catalog.json` 条目不动；phase 差异由课程侧自行消化，避免目录承载课程教学维度。
**Alternatives**：模块 → phase 双维映射（拒绝：REQ-CMP-005，超出目录职责）。

### D6 课程集成：短小节引用本地快照

**Choice**：每个 v3 课程模块文件（core ~ capstone，不含 m0）新增一个短「社区好 skill」小节：列出本模块映射主题，引用本地快照 `_community-skills.md` 对应主题小节（如「本模块主题（hooks / engineering）相关社区 skill 见 `_community-skills.md` 的 §hooks §engineering」）。快照按主题分组列出 skill（name + 一句话描述 + install 提示 + repo）。**执行时机**：本任务在 v4 执行序列中**最后**——必须等 v3 模块文件稳定（v3 处于 executing、拥有这些文件）后再落地；落地前先与 v3 协调确认模块文件已冻结。
**Rationale**：模块文件 token 精简（只加短小节，不整篇内联）；快照单文件可维护；课程运行时不联网。
**Alternatives**：

- 每模块内联复制推荐条目（拒绝：token 膨胀、多处维护）
- 运行时联网查目录（拒绝：破坏零上传）
- 仅在 SKILL.md 编排层统一展示（拒绝：proposal 明确按模块展示，学习者学某模块时看到对应推荐）

### D7 网页信息架构：纯静态、无框架

**Choice**：`site/index.html` + `site/assets/{app.js,style.css}` 客户端 fetch `site/data/catalog.json` 与 `site/data/course-mapping.json` 渲染：

- 筛选：主题标签 chips + 课程模块下拉（模块下拉由 course-mapping 推导模块 → 主题 → 匹配 skill）
- skill 卡片：name、description、author、topics、repo 链接、install、license
- 免责声明横幅（REQ-CON-005）
- 本地验证需 HTTP 服务（`python -m http.server`），`file://` 下 fetch 受 CORS 限制

**Rationale**：满足 REQ-SIT-002~005；无构建工具链、无后端；客户端读取 + 筛选足够 v1。
**Alternatives**：引入前端框架（拒绝：proposal out——纯静态）；服务端渲染（拒绝：无后端）。

### D8 收录策略：「校验 + 审核即收录」

**Choice**：结构校验 + 维护者审核通过即收录，不做实验/精选分级；网页与指南含免责声明（「收录不构成质量/安全背书」）。
**Rationale**：proposal out 范围明确；分级若引入须回写范围，v4 不做。
**Alternatives**：引入分级（拒绝：超出范围，且初期维护者无精力运营分级）。

### D9 CI 双 job：PR 校验只读 + 合入同步

**Choice**：`.github/workflows/catalog-ci.yml`，脚本双分工——`catalog/validate.mjs` 做结构校验，`catalog/sync-catalog.mjs` 做生成三产物 + `--check` 防漂移：

- `validate`（on: pull_request，paths: catalog/**）：只读校验——跑 `node catalog/validate.mjs`（JSON 合法、schema 结构、id 唯一、topics ⊆ topics.json、必填字段、course-mapping 键与模块一致）+ `node catalog/sync-catalog.mjs --check`（已提交产物与 catalog 无漂移）。**不执行** sync 写文件。
- `sync`（on: push: main，paths: catalog/**）：跑 `node catalog/sync-catalog.mjs` 重新生成三产物（site/data 两文件 + 课程快照），提交并推送。

**Rationale**：PR 阶段只校验不落盘，避免在 untrusted PR 数据上执行生成逻辑（供应链防护）；合入后再生成满足「自动展示新 skill」。
**Alternatives**：在 PR 上直接跑 sync 并留产物（拒绝：PR 数据不可信，且会污染 PR 分支）；单一 job 复用（拒绝：触发条件与职责不同，分开清晰）。

### D10 自荐条目

**Choice**：`catalog.json` 首条收录 `cc-assistant` 自身（`author` 为维护者，其余字段按 REQ-CAT-002）。
**Rationale**：REQ-CAT-005；狗粮（dogfood）——catalog 首个条目就是项目自己，示范字段规范。

## Risks And Trade-Offs

- **R1 Pages 初始化依赖人工配置**：仓库首次需在 GitHub 设置里把 Pages 发布源指向 `site/`（分支 + `/site`）。缓解：README / CONTRIBUTING 写清设置步骤；`site/.nojekyll` 关闭 Jekyll 避免解析冲突。
- **R2 合入同步产生额外提交**：每个目录变更合入会多一个 CI 生成的提交。缓解：只用 GITHUB_TOKEN 提交（不递归触发）；提交信息固定（如 `chore(catalog): sync generated products`），可接受。
- **R3 主题词表质量依赖初始集**：初始集合定错会导致后续重命名。缓解：初始集由模块主题推导并在 tasks 阶段审一遍；扩充走 PR + 维护者审核；词表与 catalog 条目解耦，改名成本可控。
- **R4 课程集成依赖 v3 稳定**：v4 的课程集成任务是跨 change 协调点，若 v3 模块文件持续变动，该任务须等待。缓解：该任务排 v4 执行序列最后；落地前显式确认 v3 模块冻结；模块集成只读快照不改目录结构，v3 改动风险面小。
- **R5 纯静态站点能力有限**：无后端搜索/排序扩展受限。缓解：v1 范围明确（主题 + 模块筛选足够）；后续可扩展，不影响数据层。
- **R6 公共目录的信任边界**：网页公开列出第三方 skill，链接指向外部仓库。缓解：免责声明管理预期；CI 只做结构校验；收录判据（REQ-CAT-004 SKILL.md 形态 + 维护者审核清单 REQ-CON-003）；PR 校验不执行 untrusted 生成逻辑。
- **R7 同步脚本确定性**：生成产物必须确定（稳定排序、键序），否则每次 CI 都产生无关 diff。缓解：脚本输出排序稳定；`--check` 在 PR 校验中兜底，diff 即失败。

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
