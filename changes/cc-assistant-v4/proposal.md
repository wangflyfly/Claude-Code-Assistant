# Proposal: CC Assistant v4（社区 Skill 目录 + GitHub Pages + 课程阶段映射）

## Why

v3 把「学 Claude Code 的能力」做成了模块化课程，但课程之外有大量优质社区 skill 没人聚合：学习者学完某个模块想找「这个能力相关的更多好 skill」没有入口；项目开源后，网友想推荐好 skill 也没有机制化路径（只能提 issue / 闲聊）。需要一个**社区 Skill 目录**：一份机器可读的集中配置当唯一事实源，网页直接消费它展示，网友能通过 PR 直接贡献，课程各阶段能按需看到对应推荐——且保持 v3「全程本地、零上传」的哲学不被破坏。

## What Changes

在仓库内新增一个**社区 Skill 目录子系统**（独立于课程教学引擎），四条线：

- **集中式 catalog 配置文件**：`catalog/catalog.json` 作为唯一事实源，一条 skill 一条记录（`id` / `name` / `description` / `author` / `install` / `repo` / `license` / `topics`），配 JSON Schema（`catalog/catalog.schema.json`）约束结构。**不存任何课程字段**——课程归属完全由映射层推导。
- **社区 PR 贡献流程**：PR 模板引导网友按格式加条目 + CI 自动校验（JSON 合法、schema 合规、`id` 唯一、`topics` 在词表内、必填字段齐全、license 可核对）+ 维护者审核清单。
- **独立主题标签 + 课程映射**：`catalog/topics.json` 定义独立于课程的主题词表（**机器可读，唯一词表源**；`catalog/topics.md` 为人类可读说明与扩充流程）；`catalog/course-mapping.json` 把 v3 课程模块（core ~ capstone，**不含 m0-onboarding**）映射到主题标签。目录不被课程结构绑死——课程改模块只改映射文件，catalog 条目不动。
- **GitHub Pages 静态站 + 课程内置快照**：静态站以**专用 `site/` 目录**为发布源（内部产物 `changes/`、`specs/` 不随站公开），`site/index.html` + `assets/` 客户端读取 `site/data/` 数据文件（catalog.json 与 course-mapping.json 副本），按主题 / 课程阶段筛选浏览，无后端；`site/data/` 数据文件与课程快照由同步脚本 `catalog/sync-catalog.mjs` 从 `catalog/catalog.json` + `catalog/course-mapping.json` **机器生成**（CI 合入时自动再生成并提交，防漂移）。课程侧快照产物 `cc-assistant/modules/_community-skills.md` 随课程分发，v3 各模块据此展示对应主题的社区 skill 推荐，不联网拉取。

## Scope

### In

- `catalog/catalog.json`（集中配置，唯一事实源）+ `catalog/catalog.schema.json`（JSON Schema 结构校验）
- `catalog/topics.json`（独立主题词表，机器可读唯一源）+ `catalog/topics.md`（词表说明 + 扩充流程）
- `catalog/course-mapping.json`（v3 模块 → 主题标签映射；仅 11 个课程模块，不含 m0-onboarding）
- 社区 PR 贡献流程：`.github/PULL_REQUEST_TEMPLATE/`（skill 条目 PR 模板 + 维护者审核清单）+ `.github/workflows/catalog-ci.yml`（PR 校验 job + 合入同步 job）+ `catalog/CONTRIBUTING.md`（贡献指南）
- GitHub Pages 静态站（发布源 = `site/`）：`site/index.html` + `site/assets/`（CSS/JS）客户端读取 `site/data/` 数据文件（catalog.json 与 course-mapping.json），按主题 / 课程阶段筛选浏览；`site/data/` 由同步脚本机器生成（CI 再生成并校验，防人工二次录入）
- 课程内置快照：`catalog/sync-catalog.mjs`（生成脚本）+ `cc-assistant/modules/_community-skills.md`（快照产物，随课程分发）
- v3 课程集成：各课程模块文件新增「社区好 skill」推荐小节，读取本地快照展示对应主题 skill（内联或引用快照，落点与形态在 design 明确）
- `README.md`：仓库入口引导浏览目录与贡献；`.gitignore`：确认 `site/data/` 与快照产物按「生成产物」管理
- 收录范围：仅 Claude Code skills（SKILL.md 形态）；`cc-assistant` 自身作为目录首条自荐条目入录
- 遵守 `docs/skill-development-spec.md`（SKILL.md frontmatter / description / token 精简 / TDD 开发）

### Out

- 不收 plugins / MCP servers / commands / agents（仅 SKILL.md skills）
- 不做运行时联网拉取远端目录（课程侧保持全程本地、零上传；网页为公开静态站，仅在用户主动访问时读取仓库内静态文件）
- 不做 skill 的托管 / 下载分发（目录只做发现与安装指引，安装由学习者按 `install` 指引自行决定）
- 不做内容审核 / 评分 / 评论体系（初期仅结构校验 + 维护者审核，合入即收录）
- 不做复杂前端框架 / 后端 / 数据库（纯静态；CI 同步是机器生成，非构建工具链）
- 不做「PR 自动合入」——合入权始终在维护者
- 课程映射不做 phase（进阶/高阶）粒度：只到模块级，phase 差异由课程侧自行消化
- `changes/` 与 `specs/` 等内部 spec-superflow 产物不随站公开（发布源限定 `site/`）

## Success Criteria

- 网友按 PR 模板往 `catalog/catalog.json` 加一条 skill，CI 校验通过、维护者合入后，网页**无需人工改动**即自动展示该 skill（合入时 CI 再生成 `site/data/` 数据文件）。
- 网页能按主题标签 / 课程阶段筛选浏览 skill，展示信息与 `catalog/catalog.json` 内容一致（无二次录入；`site/data/` 数据文件由脚本生成，CI 校验二者一致）。
- v3 课程每个课程模块（core ~ capstone，不含 m0-onboarding）展示对应主题的社区 skill 推荐（来自本地快照 `_community-skills.md`，课程运行时不联网）。
- 课程结构改动（模块增删 / 改名）不破坏目录：只需更新 `catalog/course-mapping.json`，`catalog/catalog.json` 条目不动、`site/data/` 数据文件与快照由 CI 重新生成、网页不失效。
- CI 对不合规的 PR（非法 JSON / schema 违规 / `id` 重复 / 词表外 `topics`）给出明确失败信息。
- 全程本地、零上传：课程侧无任何联网拉取行为（eval 验证）。

## Impact

- **新增目录子系统文件**：`catalog/catalog.json`、`catalog/catalog.schema.json`、`catalog/topics.json`、`catalog/topics.md`、`catalog/course-mapping.json`、`catalog/validate.mjs`（结构校验）、`catalog/sync-catalog.mjs`（生成三产物 + 防漂移）、`catalog/CONTRIBUTING.md`
- **新增网页文件（发布源 = `site/`）**：`site/index.html`、`site/assets/`（CSS/JS）、`site/data/catalog.json`（生成产物）、`site/data/course-mapping.json`（生成产物）、`site/.nojekyll`
- **新增社区流程文件**：`.github/PULL_REQUEST_TEMPLATE/`（skill 条目模板 + 维护者审核清单）、`.github/workflows/catalog-ci.yml`（PR 校验 + 合入同步）
- **修改 v3 课程文件（跨 change 协调）**：`cc-assistant/modules/*.md` 各课程模块新增「社区好 skill」推荐小节；`cc-assistant/SKILL.md` 编排层在模块教学小节补充「展示对应社区 skill」指引；新增快照产物 `cc-assistant/modules/_community-skills.md`。⚠️ v3 正在 executing、模块文件由 v3 拥有——本 v4 的课程集成工作**在 v3 模块文件稳定后执行**，不提前改动正在被 v3 编辑的文件
- **修改根 `CLAUDE.md`（协调声明）**：v4 只**追加**「目录子系统 + CI 校验」说明段，不碰 Project 段 change 指针与 Architecture 主体——指针与 Architecture 由 v3 负责更新，v4 不与其竞争
- **更新 `README.md`**：引导浏览 `site/` 目录与贡献方式（catalog PR）
- **更新 `CONTEXT.md`**：登记新规范术语——「社区 Skill 目录（catalog）」「主题标签」「课程映射」「快照」；以英文 `catalog` 为规范词，与文件系统「目录」区分，避免语义漂移；并明确**本 catalog 为社区 skill 发现目录，与 v1 已删除的推荐目录（recommendations 内置目录）无恢复关系**，防误判复活 v1 效率教练
- **`.gitignore`**：`site/data/catalog.json`、`site/data/course-mapping.json`、`cc-assistant/modules/_community-skills.md` 为**必须入库提交**的生成产物（GitHub Pages 只服务已提交文件），由 CI 合入时再生成并校验防漂移；个人进度文件（`.claude/cc-assistant/progress.json`）的忽略由 v3 清理任务负责，v4 不重复处理
- **开发自测**：按 skill-development-spec 的 TDD——为 catalog 校验写用例（合法 / 非法条目矩阵）、为同步脚本写用例（catalog → 快照 / site-data 映射正确性）、为网页写用例（目录文件存在 + 内容一致）；并用子智能体模拟「网友」按模板提交 PR 验证流程可用。网页验证需本地静态 HTTP 服务（如 `python -m http.server`，`file://` 下 fetch 受 CORS 限制）
- **安装**：catalog / 快照随仓库分发，无需用户级安装；网页为公开静态站

## Capabilities

- 社区贡献（Community Contribution）
- 目录即配置（Catalog-as-Config）
- 结构校验（Schema Validation）
- 网页静态展示（Static Catalog Site）
- 课程阶段映射（Course Stage Mapping）
- 课程内置快照（Course-embedded Snapshot）
- 全程本地零上传（Local-First）

## 待定项（design/tasks 阶段明确，不阻塞本 proposal）

- 主题词表（`catalog/topics.json`）的初始集合与扩充流程（谁来定 / 怎么审——维护者审，PR 引导）
- 课程快照与 `site/data/` 数据文件的生成 / 更新时机：CI 合入时自动再生成并提交（含防漂移校验）——是否也接受维护者本地跑脚本，design 明确
- v3 课程集成在各模块文件的具体落点与形态（内联小节 vs 引用快照单文件）及执行时机（v3 执行进度协调）
- 网页信息架构（筛选维度 / 排序 / skill 详情呈现形态）
- 「审核通过即收录」是否足够——是否需要「实验 / 精选」分级（proposal 默认不做，design 若引入须回写范围）

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
