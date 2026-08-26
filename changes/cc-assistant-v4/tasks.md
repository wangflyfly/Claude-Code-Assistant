# Tasks: CC Assistant v4（社区 Skill 目录 + GitHub Pages + 课程阶段映射）

## File Structure

| 文件 | 动作 | 职责（一句话） |
|---|---|---|
| `catalog/topics.json` | Create | 独立主题词表（机器可读唯一源）：每主题 `id` + `description` |
| `catalog/topics.md` | Create | 词表人类可读说明 + 扩充流程（新增主题走 PR + CI + 维护者审核） |
| `catalog/catalog.schema.json` | Create | catalog 结构 JSON Schema（顶层对象、字段类型、必填项） |
| `catalog/course-mapping.json` | Create | 11 课程模块 → 主题标签映射（不含 m0-onboarding） |
| `catalog/catalog.json` | Create | 社区 Skill 目录唯一事实源（含 cc-assistant 自荐首条） |
| `catalog/validate.mjs` | Create | 结构校验脚本：JSON 合法 / schema / id 唯一 / topics ⊆ 词表 / 必填 / 映射键与模块一致 |
| `catalog/sync-catalog.mjs` | Create | 机器生成三产物（site/data/catalog.json、site/data/course-mapping.json、_community-skills.md）+ `--check` 防漂移 |
| `site/.nojekyll` | Create | 关闭 GitHub Pages 的 Jekyll 解析 |
| `site/index.html` | Create | 网页入口：免责横幅 + 筛选区 + skill 列表容器 |
| `site/assets/style.css` | Create | 网页样式（筛选 chips / 模块下拉 / skill 卡片） |
| `site/assets/app.js` | Create | 客户端 fetch `site/data/` 两文件，按主题 / 课程模块筛选渲染 |
| `site/data/catalog.json` | Create（生成产物） | 站内 catalog 副本（sync-catalog.mjs 生成，入库提交） |
| `site/data/course-mapping.json` | Create（生成产物） | 站内 course-mapping 副本（sync-catalog.mjs 生成，入库提交） |
| `cc-assistant/modules/_community-skills.md` | Create（生成产物） | 课程快照：按主题分组的 skill 列表（随课程分发） |
| `.github/workflows/catalog-ci.yml` | Create | CI：PR `validate` job（只读校验）+ 合入 `sync` job（再生成产物并提交） |
| `.github/PULL_REQUEST_TEMPLATE/skill-entry.md` | Create | skill 条目 PR 模板（字段说明 + 示例 + 自检清单 + 维护者审核清单） |
| `catalog/CONTRIBUTING.md` | Create | 贡献指南：流程 / 本地校验命令 / 收录判据 / 免责声明 |
| `cc-assistant/SKILL.md` | Modify | 编排层补充「社区好 skill」指引（模块教学时读本地快照对应主题） |
| `cc-assistant/modules/{core,memory,skills,subagent,hooks,mcp,headless,sdk,plugins,engineering,capstone}.md` | Modify | 各课程模块新增「社区好 skill」短小节（列本模块映射主题 + 引用快照对应分组） |
| `CONTEXT.md` | Modify | 术语登记：社区 Skill 目录（catalog）/ 主题标签 / 课程映射 / 快照 |
| `CLAUDE.md`（根） | Modify | 追加目录子系统 + CI 校验说明段（不碰 Project 指针与 Architecture 主体） |
| `README.md` | Modify | 站点入口引导浏览目录 + 贡献方式（catalog PR） |
| `.gitignore` | Modify | 生成产物说明注释（site/data/ 与 _community-skills.md 须入库，勿忽略） |
| `cc-assistant/eval/cases.md` | Modify | 目录 eval 用例：校验矩阵 / 同步一致性 / 网友 PR 流程（无 skill 基线 vs 有 skill） |

## Interfaces

- **catalog.json**：`SkillRecord[]`，`{id: string, name: string, description: string, author: string, install: string, repo: URL, license: string, topics: string[]}`；`id` 小写连字符且全目录唯一；`topics` 每个 ∈ `topics.json` 词表。
- **topics.json**：`Topic[]`，`{id: string, description: string}`；`course-mapping.json` 引用值 ⊆ topics 的 `id` 集。
- **course-mapping.json**：`Record<moduleId, topicId[]>`；`moduleId` ∈ {core, memory, skills, subagent, hooks, mcp, headless, sdk, plugins, engineering, capstone}（= `cc-assistant/modules/*.md` 文件名剔除 m0-onboarding）。
- **validate.mjs → CI**：输入 catalog/topics/course-mapping；退出码 0=通过 / 1=失败（输出违规文件 + 字段 + 原因）。
- **sync-catalog.mjs → 三产物**：输入 catalog.json + course-mapping.json；输出 `site/data/catalog.json`、`site/data/course-mapping.json`、`cc-assistant/modules/_community-skills.md`；`--check` 退出码 0=一致 / 1=漂移。
- **site/data/* → site/assets/app.js**：两文件为 catalog/course-mapping 的机器生成副本（发布源 `site/`，客户端无法读 `site/` 外的 `catalog/`）。
- **_community-skills.md → 课程模块小节**：按主题分组；模块小节按本模块映射主题引用对应分组（name + 描述 + install 提示 + repo）。
- **课程集成跨 change**：`cc-assistant/modules/*.md` 由 v3 拥有——v4 的课程集成任务（Batch 6）排在执行序列最后，落地前显式确认 v3 模块文件已冻结。

## Batches

### Batch 1 — 目录数据层

- [x] T1: 创建 `catalog/topics.json`——初始主题词表（starter 集：core-workflow / skills / rules / hooks / mcp / memory / plugins / sdk / subagent / headless / plan-mode / engineering / project-workflow，每主题含 `id` + `description`）；依赖：无；验收：合法 JSON、每主题 id 小写连字符且唯一、description 非空
- [x] T2: 创建 `catalog/topics.md`——词表人类可读说明 + 扩充流程（新增主题 = 提 PR 改 topics.json + topics.md，走 CI 校验 + 维护者审核）；依赖：T1；验收：扩充流程可操作、说明与 topics.json 一致
- [x] T3: 创建 `catalog/catalog.schema.json`——顶层对象 + `skills` 数组，字段类型与必填项按 REQ-CAT-002（id/name/description/author/install/repo/license/topics 全部必填，topics 为字符串数组）；依赖：T1（schema 的 topics 不枚举，词表独立校验）；验收：schema 能约束非法结构（缺字段/类型错）失败
- [x] T4: 创建 `catalog/course-mapping.json`——11 模块键（core~capstone，不含 m0-onboarding）各映射到非空主题子集；依赖：T1；验收：每个键映射非空、引用主题 ∈ topics.json、键集 = `cc-assistant/modules/*.md` 文件名剔除 m0-onboarding
- [x] T5: 创建 `catalog/catalog.json`——含 `cc-assistant` 自荐首条（author 为维护者、其余字段按 REQ-CAT-002），`skills` 数组其余留空待 PR 填充；依赖：T3、T4；验收：cc-assistant 条目通过字段约束、文件过 schema 校验

### Batch 2 — 校验脚本（TDD）

- [x] T6: 创建 `catalog/validate.mjs`——先写合法 / 非法用例矩阵（RED：合法条目通过、非法 JSON / 缺必填 / id 重复 / 词表外 topics / 映射键与模块不符各自失败），再实现校验逻辑（GREEN）：JSON 合法、schema 校验、id 唯一、topics ⊆ topics.json、必填字段齐全、course-mapping 键与 `cc-assistant/modules/*.md` 一致且引用主题存在；依赖：T1-T5；验收：用例矩阵全过、退出码 0/1 正确、错误信息定位到文件+字段

### Batch 3 — 同步脚本（TDD）

- [x] T7: 创建 `catalog/sync-catalog.mjs`——先写输出断言用例（RED：给定小样本 catalog + course-mapping，三产物内容应是什么），再实现（GREEN）：输入 catalog.json + course-mapping.json，机器生成 `site/data/catalog.json`、`site/data/course-mapping.json`、`cc-assistant/modules/_community-skills.md`（按主题分组，每 skill 含 name + 一句话描述 + install 提示 + repo）；输出排序稳定（确定性，R7）；`--check` 模式比较已提交产物与最新生成，退出码 0=一致 / 1=漂移；依赖：T1、T4、T5（sync 输入含 catalog.json）；验收：三产物正确、二次运行 `--check` 退出码 0、手工改产物后退出码 1

### Batch 4 — 网页静态站

- [x] T8: 创建 `site/.nojekyll` + `site/index.html`——页面结构：免责声明横幅（REQ-CON-005）、主题 chips 区、课程模块下拉、skill 列表容器；依赖：无；验收：结构包含三区块、本地 HTTP 服务可加载骨架
- [x] T9: 创建 `site/assets/style.css`——筛选 chips / 模块下拉 / skill 卡片样式；依赖：T8；验收：本地 HTTP 服务下页面可正常渲染布局
- [x] T10: 创建 `site/assets/app.js`——fetch `site/data/catalog.json` 与 `site/data/course-mapping.json`，主题 chips 筛选（REQ-SIT-003）、课程模块下拉筛选（由 course-mapping 推导模块→主题→匹配 skill，REQ-SIT-004）、skill 卡片渲染（name/description/author/topics/repo/install/license，REQ-SIT-005）；依赖：T8；验收：本地 HTTP 服务下两种筛选与渲染正确、与数据一致
- [x] T11: 生成 `site/data/` 产物——运行 `node catalog/sync-catalog.mjs` 生成 `site/data/catalog.json` 与 `site/data/course-mapping.json`，在本地静态 HTTP 服务（`python -m http.server`）验证网页完整可用；依赖：T5、T7、T10（T5 的 catalog.json 是 sync 输入）；验收：页面筛选/渲染正常、`file://` 直开提示不可用（CORS 说明，L3）

### Batch 5 — CI 与贡献流程

- [x] T12: 创建 `.github/workflows/catalog-ci.yml`——`validate` job（on: pull_request, paths: catalog/**）：跑 validate.mjs 结构校验 + sync-catalog.mjs `--check` 防漂移，只读不写（R6 供应链防护）；`sync` job（on: push: main, paths: catalog/**）：跑 sync-catalog.mjs 重新生成三产物并提交（GITHUB_TOKEN，防递归触发）；依赖：T6、T7；验收：PR 校验只读、合入后产物自动更新、非法 PR 明确失败
- [x] T13: 创建 `.github/PULL_REQUEST_TEMPLATE/skill-entry.md`——字段填写说明 + 示例条目 + 提交前自检清单（本地 `node catalog/validate.mjs` 可跑）+ 维护者审核清单（SKILL.md 形态 / repo 可访问 / license 明确 / description 与正文一致 / topics 匹配，REQ-CON-001/003）；依赖：T6（引用本地校验命令）；验收：模板覆盖 REQ-CAT-002 全字段、审核清单含 REQ-CON-003 核对项
- [x] T14: 创建 `catalog/CONTRIBUTING.md`——贡献流程（如何加一条 skill / 本地预校验 / CI 查什么）、收录判据（REQ-CAT-004 仅 SKILL.md 形态）、审核流程（REQ-CON-002）、免责声明（REQ-CON-005）；依赖：T6；验收：内容覆盖 REQ-CON 全部场景、含免责声明文本

### Batch 6 — 课程集成（依赖 v3 模块文件稳定，执行序列最后）

- [x] T15: `cc-assistant/SKILL.md` 编排层补充「社区好 skill」指引——模块教学小节说明「本模块对应主题的社区 skill 见本地快照 `modules/_community-skills.md` 对应分组，不联网」；依赖：T14、**v3 模块冻结确认**；验收：编排层含快照引用指引、无联网措辞
- [x] T16: `core / memory / skills / subagent / hooks` 5 模块文件新增「社区好 skill」短小节——列出本模块映射主题，引用 `_community-skills.md` 对应主题分组（REQ-SNP-003）；依赖：T15、T4；验收：每模块小节正确引用其映射主题分组、不内联整篇
- [x] T17: `mcp / headless / sdk / plugins / engineering / capstone` 6 模块文件新增「社区好 skill」短小节——同 T16 模式；依赖：T16（模式先立）；验收：同 T16，11 模块全部覆盖、无 m0-onboarding 小节

### Batch 7 — 文档影响面 + eval 收尾

- [x] T18: 更新 `CONTEXT.md`——登记新术语：社区 Skill 目录（catalog，英文为规范词，与文件系统「目录」区分）/ 主题标签 / 课程映射 / 快照；并注明「本 catalog 与 v1 已删除的推荐目录（recommendations 内置目录）无恢复关系」；依赖：T1、T4；验收：四术语入表、无「目录」歧义、v1 无恢复关系已注明（逐条核对）
- [x] T19: 更新根 `CLAUDE.md`——**追加**「目录子系统 + CI 校验」说明段（catalog 唯一事实源 / site/ 发布源 / PR 贡献 / 课程快照）；不碰 Project 段 change 指针与 Architecture 主体（由 v3 负责）；依赖：T18；验收：仅追加段、Project 指针与 Architecture 未改动（git diff 核对）
- [x] T20: 更新 `README.md`（站点入口 + 贡献方式）+ `.gitignore`（生成产物说明注释：site/data/ 与 _community-skills.md 须入库勿忽略，不忽略它们）；依赖：无；验收：README 含站点与 PR 引导、.gitignore 注释到位且三产物未被忽略
- [x] T21: `cc-assistant/eval/cases.md` 增目录 eval 用例——catalog 校验矩阵（合法/非法条目）、同步一致性（改 catalog → 产物跟随）、网友 PR 流程场景；先用子智能体模拟「网友」无模板基线跑测（RED，记录行为）；依赖：T6、T7；验收：基线报告落盘、每个场景有 WHEN/THEN 判据
- [x] T22: 有模板/有脚本跑测——子智能体模拟「网友」按 `skill-entry.md` 模板提交 PR，验证本地 validate 通过 →（模拟 CI）→ sync 生成产物路径（GREEN，REQ-CON-001 / REQ-CIV-001 行为收敛）；依赖：T21、T13、T14；验收：与 T21 基线对比、模板引导生效、无代填/跳过字段
- [x] T23: 回归与收尾——全量校验（validate.mjs + sync `--check` 退出码 0）、三产物与 catalog/course-mapping 一致、网页本地 HTTP 服务渲染核对、CONTEXT/CLAUDE/README 无残留、tasks 复选框按实现进度统一勾选；**边界/否定型 REQ 断言**（REQ-LOC-002 目录仅元数据不托管分发、REQ-LOC-004 安全边界继承、REQ-CON-004 无自动合入、REQ-CMP-005 无 phase 粒度，逐条核对）；**跨 change 核对**（`.claude/cc-assistant/progress.json` 忽略已由 v3 落地，确认不重复处理）；依赖：T5-T22；验收：遗留 0 项、复选框状态与实际一致、上述边界 REQ 有逐条核对记录

## 依赖与顺序

- T1→T2,T3,T4；T3,T4→T5（schema 与映射先于 catalog 填充）
- T1-T5→T6（validate 校验数据层）；T3→T6（schema 校验）
- T1,T4,T5→T7（sync 消费 topics/course-mapping/catalog）；T7→T11（生成 site/data）
- T8→T9；T8→T10；T5,T7,T10→T11（网页文件可先于脚本存在，产物在 T11 生成，catalog.json 为 sync 输入）
- T6,T7→T12（CI 复用 validate + sync）；T6→T13；T6→T14
- T14→T15（CONTRIBUTING 先于课程集成定稿）；T15→T16→T17（SKILL.md 指引先立、模块小节按模式铺开）；T4→T16,T17（模块小节引用映射）
- T1,T4→T18；T18→T19（CLAUDE.md 引 CONTEXT 术语，需先更新）
- T6,T7→T21→T22（eval RED→GREEN）；T13,T14→T22（模板/指南就位）
- 全链路 T5-T22→T23（回归收尾）
- **跨 change 门禁**：Batch 6（T15-T17）依赖「v3 模块文件已冻结」显式确认，v3 executing 期间不提前执行
- 依赖链保证每任务只依赖先前批次；无 TBD/TODO/占位符

## 校验

- **脚本类任务**（T6、T7、T11）：走 TDD——先写用例 / 断言（RED）后实现（GREEN），未通过不勾选。
- **网页类任务**（T8-T11）：本地静态 HTTP 服务渲染核对 + 数据与 catalog 一致核对。
- **CI / 贡献流程类**（T12-T14）：本地模拟或 `gh` 校验流程可跑、模板/指南逐条覆盖对应 REQ。
- **文档类任务**（T18-T20）：逐条核对（对照 proposal Impact / spec REQ）+ git diff 核对（T19 只追加不改指针）。
- **eval 类任务**（T21、T22）：子智能体模拟「网友」PR 流程，无基线 vs 有模板/脚本对比。
- tasks 复选框状态与实现进度一致（spec-superflow 强制规则 2）：执行期用 `.superpowers/sdd/progress.md` 台账跟踪，**复选框统一在 T23 收尾按实现进度勾选**（避免 artifacts hash 变化使执行计划失效）；未实现保持 `- [ ]`。

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
