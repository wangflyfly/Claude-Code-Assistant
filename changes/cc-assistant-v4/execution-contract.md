# 执行合同

## Intent Lock

- **变更名称**：cc-assistant-v4（社区 Skill 目录 + GitHub Pages + 课程阶段映射）
- **要解决的问题**：开源后社区推荐好 skill 无机制化入口（只能 issue/闲聊）；学习者学完某模块找不到「该能力相关的好 skill」；课程缺一个发现/聚合层。
- **范围内**：`catalog/catalog.json` 唯一事实源（条目含 id/name/description/author/install/repo/license/topics，**无课程字段**）；双脚本（`validate.mjs` 结构校验 + `sync-catalog.mjs` 生成三产物与防漂移）；独立主题词表 `topics.json` + 课程映射 `course-mapping.json`（11 模块不含 m0）；`site/` 发布源 GitHub Pages 静态站（客户端读 site/data，按主题/模块筛选）；课程内置快照 `_community-skills.md`（每模块展示对应主题推荐，不联网）；社区 PR 流程（模板/CI/维护者审核）；文档影响面（CONTEXT/根 CLAUDE.md 追加/README/.gitignore）。
- **范围外**：不收 plugins/MCP/commands/agents；不做运行时联网拉取远端目录；不做 skill 托管/下载分发；不做内容审核/评分；不做 PR 自动合入；课程映射不做 phase 粒度；`changes/`、`specs/` 等内部产物不随站公开。

## Approved Behavior

- **已批准需求摘要**：34 REQ（7 spec）——CAT-001~005（catalog 唯一事实源/字段/schema/收录范围/自荐）、CMP-001~005（词表唯一源/映射文件/解耦/键一致性/无 phase）、CON-001~005（PR 模板/贡献指南/审核清单/无自动合入/免责声明）、CIV-001~005（PR 校验/映射一致性/合入再生成/防漂移/本地可跑）、SIT-001~005（site/ 发布源/客户端读取/主题筛选/模块筛选/与 catalog 一致）、SNP-001~005（快照生成/随课分发/模块展示/不含 m0/与 catalog 一致）、LOC-001~004（零上传/仅元数据/免责声明/安全边界继承）。
- **关键场景**：① 网友按 PR 模板加一条 skill → CI `validate` 通过 → 维护者合入 → CI `sync` 再生成三产物 → 网页无需人工改动自动展示；② 学习者进某课程模块 → 模块「社区好 skill」小节列出本模块映射主题 → 引用本地快照对应分组（不联网）；③ v3 课程改模块名 → 只改 `course-mapping.json` → catalog 条目不动 → 三产物由 CI 再生成、网页不失效。
- **验收检查**：proposal 6 条成功标准 + 34 REQ 的 `#### Scenario` WHEN/THEN 全数通过；`validate.mjs` 退出码 0、`sync-catalog.mjs --check` 退出码 0；网页本地 HTTP 服务渲染与 catalog 一致；课程运行时不联网。

## Design Constraints

- **架构约束**：全程本地零上传（课程侧只读本地快照）；发布源 = `site/`（内部产物不公开）；catalog 不存课程字段（课程归属由映射推导）；三产物（site/data 两文件 + 课程快照）机器生成、入库提交；无后端、无前端框架、无构建工具链。
- **接口约束**：`catalog.json` = `SkillRecord[]` `{id,name,description,author,install,repo,license,topics[]}`；`topics.json` = `Topic[]` `{id,description}`；`course-mapping.json` = `Record<moduleId, topicId[]>`；`validate.mjs` 退出码 0=通过/1=失败（输出违规文件+字段+原因）；`sync-catalog.mjs` 生成三产物 + `--check`（0=一致/1=漂移）；`site/assets/app.js` fetch `site/data/` 两文件。
- **依赖约束**：Wave 6（课程集成 T15-T17）依赖「v3 模块文件冻结」。**冻结信号（机械可判）**：读取 v3 `.spec-superflow.yaml`，其 `state` 已离开 `executing`——即 v3 不再有后续 wave 可能改动模块文件；执行时以该状态核对为准，不得仅凭口头协调。根 `CLAUDE.md` 只追加目录子系统段，不碰 Project 指针与 Architecture（由 v3 负责）；`.claude/cc-assistant/progress.json` 忽略由 v3 负责，v4 不重复处理。
- **数据约束**：`id` 小写连字符且全目录唯一；`topics` 每个 ∈ `topics.json`；映射键 = `cc-assistant/modules/*.md` 文件名剔除 `m0-onboarding`（11 模块）；生成产物排序稳定（确定性，R7）。

## Execution Plan

full/hotfix 先运行 `ssf execution recommend`，按任务量和 wave 策略列出可用方式并推荐一种，同时保存匹配当前 wave 的 recommendation receipt。Agent 展示候选项和理由，`plan` 和 `revise` 均只接受仍匹配 artifact、contract 和 wave 的凭据；用户通过 `--confirm` 明确确认；选择非推荐方式时还必须记录 `--acknowledge-recommendation`。Batch Inline 是串行模式，不得描述为并行。批准后，`ssf execution plan` 会把当前执行计划保存到 `<change>/.superpowers/sdd/execution-plan.json`；该 JSON 是计划的持久化控制面，不是本 execution contract 的一部分。

## Execution Waves

每个 wave 必须有唯一 ID；只有依赖 wave 的 review receipt 为 `pass` 后，后续 wave 才可以开始。`parallel` 只表示允许在宿主支持并发派发时同时执行；不支持并发时必须明确报告该能力不可用，而不能把 `parallel` 计划悄然改写成串行执行。

### Wave 1 — 目录数据层

- **Wave ID**：wave-1-data-layer
- **任务**：T1（topics.json）、T2（topics.md）、T3（catalog.schema.json）、T4（course-mapping.json）、T5（catalog.json 自荐条目）
- **依赖 wave**：无
- **策略**：`serial`（T1→T2,T3,T4→T5，schema/映射先于 catalog 填充）
- **目标**：数据层源文件齐备且互相约束成立（词表/映射/条目各过自身约束）
- **输入**：v3 模块文件名清单（cc-assistant/modules/*.md 剔除 m0）
- **输出**：`catalog/topics.json`、`catalog/topics.md`、`catalog/catalog.schema.json`、`catalog/course-mapping.json`、`catalog/catalog.json`
- **完成标准**：REQ-CAT-001~005、REQ-CMP-001~005 的数据层部分满足；每文件可独立审查
- **Review gate**：`ssf execution review --wave wave-1-data-layer --verdict pass|fail`

### Wave 2 — 校验脚本

- **Wave ID**：wave-2-validate
- **任务**：T6（validate.mjs，先 RED 用例矩阵后 GREEN 实现）
- **依赖 wave**：wave-1-data-layer
- **策略**：`serial`
- **目标**：结构校验脚本对数据层可机械判定（合法通过 / 非法明确失败）
- **输入**：catalog/topics/course-mapping/schema
- **输出**：`catalog/validate.mjs` + 用例矩阵
- **完成标准**：REQ-CAT-002/003、REQ-CMP-004、REQ-CIV-001/002 的校验逻辑落地；用例矩阵全过
- **Review gate**：`ssf execution review --wave wave-2-validate --verdict pass|fail`

### Wave 3 — 同步脚本

- **Wave ID**：wave-3-sync
- **任务**：T7（sync-catalog.mjs，先 RED 输出断言后 GREEN 生成三产物 + `--check`）
- **依赖 wave**：wave-1-data-layer
- **策略**：`serial`
- **目标**：三产物（site/data 两文件 + 课程快照）机器生成、确定性、防漂移
- **输入**：catalog.json + course-mapping.json
- **输出**：`catalog/sync-catalog.mjs` + 首次生成的三产物
- **完成标准**：REQ-CIV-003~005、REQ-SNP-001/002/005 满足；二次运行 `--check` 退出码 0、手工改产物后退出码 1
- **Review gate**：`ssf execution review --wave wave-3-sync --verdict pass|fail`

### Wave 4 — 网页静态站

- **Wave ID**：wave-4-site
- **任务**：T8（index.html + .nojekyll）、T9（style.css）、T10（app.js）、T11（生成 site/data + 本地 HTTP 验证）
- **依赖 wave**：wave-3-sync（仅 T11 需三产物；T8-T10 网页文件本身不依赖 wave-3，plan 阶段可将 wave-4 拆细或接受粗粒度依赖，执行时以计划为准）
- **策略**：`serial`（T8→T9,T10→T11；T8-T10 内部可并行，不声明 parallel）
- **目标**：网页从 site/data 渲染、按主题/模块筛选、与 catalog 一致、本地可验证
- **输入**：site/data 两产物 + course-mapping（模块→主题推导）
- **输出**：`site/index.html`、`site/assets/style.css`、`site/assets/app.js`、`site/.nojekyll`、`site/data/*`（生成）
- **完成标准**：REQ-SIT-001~005、REQ-SNP-003（引用方）满足；本地 HTTP 服务渲染与筛选正确
- **Review gate**：`ssf execution review --wave wave-4-site --verdict pass|fail`

### Wave 5 — CI 与贡献流程

- **Wave ID**：wave-5-ci-contrib
- **任务**：T12（catalog-ci.yml）、T13（PR 模板）、T14（CONTRIBUTING.md）
- **依赖 wave**：wave-2-validate、wave-3-sync（CI 复用两脚本）
- **策略**：`serial`
- **目标**：社区 PR 走「模板 → CI 校验 → 维护者审核」机制化路径；合入后自动再生成
- **输入**：validate.mjs + sync-catalog.mjs
- **输出**：`.github/workflows/catalog-ci.yml`、`.github/PULL_REQUEST_TEMPLATE/skill-entry.md`、`catalog/CONTRIBUTING.md`
- **完成标准**：REQ-CON-001~005、REQ-CIV-001~005 满足；PR 校验只读、合入同步可跑通
- **Review gate**：`ssf execution review --wave wave-5-ci-contrib --verdict pass|fail`

### Wave 6 — 课程集成（依赖 v3 冻结）

- **Wave ID**：wave-6-course-integration
- **任务**：T15（SKILL.md 指引）、T16（核心~Hooks 5 模块小节）、T17（MCP~收官 6 模块小节）
- **依赖 wave**：wave-5-ci-contrib（CONTRIBUTING 先定稿）+ **v3 模块冻结信号**（v3 `.spec-superflow.yaml` 的 `state` 离开 `executing`，见 Design Constraints 依赖约束）
- **策略**：`serial`
- **目标**：v3 各课程模块展示对应主题社区 skill 推荐（本地快照引用，不联网）
- **输入**：`_community-skills.md`（wave-3 产物）+ course-mapping.json
- **输出**：`cc-assistant/SKILL.md`（追加指引）+ 11 个模块文件「社区好 skill」小节
- **完成标准**：REQ-SNP-003/004、REQ-LOC-001 满足；11 模块覆盖、无 m0 小节、无联网措辞
- **Review gate**：`ssf execution review --wave wave-6-course-integration --verdict pass|fail`

### Wave 7 — 文档影响面 + eval 收尾

- **Wave ID**：wave-7-docs-eval
- **任务**：T18（CONTEXT）、T19（根 CLAUDE.md 追加）、T20（README + .gitignore）、T21（eval 用例 RED）、T22（eval GREEN）、T23（回归收尾 + 边界 REQ 断言）
- **依赖 wave**：wave-1-data-layer（T18 术语）、wave-2-validate + wave-3-sync（T21 用例）、wave-5-ci-contrib（T22 模板）、全部先前 wave（T23 回归覆盖 wave-1~wave-6）
- **策略**：`serial`
- **目标**：术语登记、根文档追加、贡献入口、eval 验证、全量回归；tasks 复选框收尾勾选
- **输入**：全部产物
- **输出**：CONTEXT.md / 根 CLAUDE.md / README.md / .gitignore 更新 + eval/cases.md 用例
- **完成标准**：proposal 全部 Success Criteria + 34 REQ 全数满足；边界 REQ（LOC-002/004、CON-004、CMP-005）逐条核对；遗留 0 项
- **Review gate**：`ssf execution review --wave wave-7-docs-eval --verdict pass|fail`

## Test Obligations

- **必须先从失败测试开始的行为**：`validate.mjs`（T6：合法/非法条目矩阵先行）、`sync-catalog.mjs`（T7：三产物输出断言先行）；未写用例先实现视为违规（skill-development-spec TDD 铁律）。
- **必需的边界情况**：非法 JSON / schema 违规 / 缺必填 / `id` 重复 / 词表外 `topics`；映射键与模块文件名不一致；产物被手工改动（`--check` 检出漂移）；`file://` 直开网页不可用（CORS）；模块练习依赖缺失的降级沿用 v3（不在本 change 范围，仅确认不破坏）。
- **回归敏感区域**：三产物与 catalog/course-mapping 一致性；网页筛选/渲染与数据一致；快照与 11 模块小节引用不悬空；课程集成不破坏 v3 模块教学结构；根 CLAUDE.md 只追加不改指针。

## Execution Mode

- **可用方式与推荐**：`ssf execution recommend <change-dir>`（DP-4 时运行，保存 recommendation receipt）
- **用户确认的模式**：待 DP-4 确认（`sdd` | `inline` | `batch-inline`）
- **推荐理由 / 项目事实**：23 任务 7 wave，依赖链清晰、跨 change 门禁（v3 冻结）存在，SDD 逐 wave review 适格
- **非推荐选择的风险确认**：`--acknowledge-recommendation`（若选非推荐方式）
- **执行计划命令**：`ssf execution plan <change-dir> --mode <mode> --confirm --reason <text> --wave <id>:<parallel|serial>:<task,...>[:<depends-on,...>]`
- **允许的修订**：保留/升级为 `sdd`；先重新 recommend 再 `--confirm` 生成新 revision；不允许降级
- **计划 revision / artifact hash**：待 execution plan 写入后记录

## Verification Dimensions

| 维度 | 状态 | 发现 |
|------|------|------|
| Completeness | Pending | 34 REQ 全部映射到 wave 与任务（见 Escalation Rules 覆盖清单） |
| Correctness | Pending | 执行期逐 wave `ssf execution review` 验证 |
| Coherence | Pending | 三产物口径 / 双脚本分工 / 零上传约束在四工件一致 |

**总体结论**：Pending

## Review Gates

- **强制审查点**：每个 Execution Wave 完成后记录 `ssf execution review` 的 review receipt；Wave 6 前置「v3 模块冻结」显式确认。
- **阻塞类别**：依赖 wave 未通过、review receipt 为 `fail`、缺失或过期、v3 模块未冻结（`state` 未离开 `executing`）即进 Wave 6。
- **收口条件**：所有 7 个 wave 都有 `pass` review receipt；Wave 7 完成后 tasks 复选框按实现进度统一勾选、遗留 0 项。

## Escalation Rules

- **何时回退到 `specifying`**：proposal 范围/Out 变化、REQ 增删或验收标准变化、三产物口径或双脚本分工改变（需重走 spec-writer 三轮自检）。
- **何时回退到 `bridging`**：design 约束/依赖变化（如 v3 模块结构在冻结前大幅变动）、接口契约变化、课程集成落点变化。
- **何时不得继续实现**：34 REQ 存在未映射（覆盖清单见下）、DP-3 未批准、依赖 wave review `fail`、v3 模块未冻结即进 Wave 6、网页/快照与 catalog 漂移未修复。

**REQ→Wave/Task 覆盖清单**（交叉核对，34 REQ 全覆盖、逐条归属精确）：
- REQ-CAT-001（唯一事实源）→ Wave1（T5）+ Wave3（T7）+ Wave7（T21）
- REQ-CAT-002（字段约束）→ Wave1（T5）+ Wave2（T6）+ Wave7（T21）
- REQ-CAT-003（schema 校验）→ Wave1（T3）+ Wave2（T6）
- REQ-CAT-004（收录范围）→ Wave5（T13/T14）+ Wave7（T23）
- REQ-CAT-005（自荐条目）→ Wave1（T5）
- REQ-CMP-001（词表唯一源）→ Wave1（T1）+ Wave2（T6）
- REQ-CMP-002（映射文件）→ Wave1（T4）+ Wave7（T21）
- REQ-CMP-003（解耦承诺）→ Wave2（T6 校验）+ Wave7（T23 一致性）
- REQ-CMP-004（键一致性）→ Wave2（T6）+ Wave7（T21）
- REQ-CMP-005（无 phase 粒度）→ Wave7（T23 边界断言）
- REQ-CON-001（PR 模板）→ Wave5（T13）+ Wave7（T22）
- REQ-CON-002（贡献指南）→ Wave5（T14）
- REQ-CON-003（审核清单）→ Wave5（T13）+ Wave7（T22）
- REQ-CON-004（无自动合入）→ Wave7（T23 边界断言）
- REQ-CON-005（免责声明）→ Wave4（T8）+ Wave5（T14）+ Wave7（T23）
- REQ-CIV-001（PR 校验）→ Wave5（T12）+ Wave7（T21/T22）
- REQ-CIV-002（映射一致性）→ Wave2（T6）+ Wave5（T12）
- REQ-CIV-003（合入再生成）→ Wave3（T7）+ Wave5（T12）+ Wave7（T22/T23）
- REQ-CIV-004（防漂移）→ Wave3（T7 --check）+ Wave5（T12）+ Wave7（T23）
- REQ-CIV-005（本地可跑）→ Wave3（T7）+ Wave5（T12）
- REQ-SIT-001（发布源隔离）→ Wave4（T8 + .nojekyll）+ Wave7（T23）
- REQ-SIT-002（客户端读取）→ Wave4（T10）
- REQ-SIT-003（主题筛选）→ Wave4（T10）
- REQ-SIT-004（模块筛选）→ Wave4（T10）
- REQ-SIT-005（与 catalog 一致）→ Wave4（T11）+ Wave7（T23）
- REQ-SNP-001（快照生成）→ Wave3（T7）+ Wave7（T21）
- REQ-SNP-002（入库提交）→ Wave7（T20 不忽略）+ T23
- REQ-SNP-003（模块展示）→ Wave6（T15-T17）
- REQ-SNP-004（不含 m0）→ Wave6（T16/T17 验收）
- REQ-SNP-005（与 catalog 一致）→ Wave3（T7）+ Wave7（T23）
- REQ-LOC-001（零上传）→ Wave6（T15-T17）+ Wave7（T21/T22 eval）
- REQ-LOC-002（仅元数据）→ Wave7（T23 边界断言）
- REQ-LOC-003（免责声明）→ Wave4（T8）+ Wave5（T14）+ Wave7（T23）
- REQ-LOC-004（安全边界继承）→ Wave7（T23 边界断言）

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
