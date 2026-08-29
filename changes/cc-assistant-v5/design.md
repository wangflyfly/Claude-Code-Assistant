# Design: CC Assistant v5（/contribute 斜杠命令）

## Context

**现状**：v4 交付了社区 Skill 目录（`catalog/catalog.json` 唯一事实源 + `validate.mjs` / `sync-catalog.mjs` 双脚本 + CI + GitHub Pages + 课程快照）。贡献一条 skill 需手动 5 步：改 8 字段、跑 validate、跑 sync、三产物一起提交、按模板提 PR。v5 把「怎么做」固化成一条 `/contribute` 斜杠命令，让贡献者用自然语言描述即得合法条目 + 就绪产物。

**约束**：

- 边界 = 条目就绪：不自动 commit / push / 开 PR（REQ-CMD-004）
- 纯 markdown 命令编排，不加任何新 node/JS 脚本、不装 gh（proposal Scope Out）
- 不改 v4 数据层结构与脚本（topics.json / course-mapping.json / schema / validate.mjs / sync-catalog.mjs / catalog-ci.yml 不动；catalog.json 仅向 skills 数组末尾追加）
- 词表外不自动新增主题，决策权在维护者（REQ-TOP-002）
- 项目级零新增安装：复用仓库既有 node 脚本（REQ-CMD-001）
- 命令在仓库克隆内运行（操作 `catalog/catalog.json`）

**Stakeholders**：社区贡献者（想加 skill 的网友）、维护者（审核收录）、课程学习者（从快照看到社区 skill）。

## Goals

- G1：贡献者用自然语言描述（含 `install`）即可得到合法条目 + 三产物就绪，`validate` / `sync` / `--check` 退出码 0
- G2：命令复用既有 validate/sync，不加新脚本、不改数据层
- G3：词表外就近映射 + PR 附加备注，新增主题权始终在维护者
- G4：项目级零新增安装，克隆仓库即用
- G5：交接不自动 commit/PR（条目就绪边界），提交与合入权留在贡献者与维护者

## Decisions

### D1 命令形态与编排流程：纯斜杠命令，编排即流程

**Choice**：`.claude/commands/contribute.md` 为纯 markdown 编排（frontmatter `description`，可含 `argument-hint`），由 Claude 运行时按下列步骤执行：

1. **前提校验**：确认 cwd 为仓库根（存在 `catalog/catalog.json`）且未提交工作区改动已处理（提示贡献者先 commit / stash），否则提示先进入仓库 / 处理现有改动
2. **收集字段**：6 个贡献者提供字段 `name` / `description`（「何时用」）/ `author` / `install`（命令不代编，给示例）/ `repo`（命令侧校验 http/https）/ `license`；缺失补齐
3. **生成 id**：从 `name` slug 化 + 全目录唯一检查；非 ASCII / 空 / 冲突 → 贡献者手输合法 id
4. **主题映射**：读 `catalog/topics.json`，从 description 推断候选 → 展示确认 / 调整；词表外 → 就近映射 + 记 PR 备注
5. **写入**：向 `catalog/catalog.json` 的 `skills` 数组**末尾**追加新条目（8 字段）
6. **校验闭环**：`node catalog/validate.mjs` → 失败修复重试 → `node catalog/sync-catalog.mjs` 再生成三产物 → `node catalog/sync-catalog.mjs --check` 复核退出码 0
7. **交接输出**：commit 命令示例 + PR 正文（按 skill-entry.md 模板固定字段，**仅当发生就近映射时**附加「建议新增主题」备注行）；不执行任何 git 写操作

**Rationale**：字段收集 / 主题推断 / 确认交互是自然语言与语义判断强项，写进命令文件由 Claude 执行最贴合「简单描述即完成」；确定性步骤（写入、校验、再生成）全部复用 v4 既有脚本，退出码约定机器兜底。
**Alternatives**：

- Node CLI（`node catalog/contribute.mjs --name …`）：确定性可测，但贡献者要敲结构化参数，违背「简单描述」初衷
- 混合（薄命令 + node 帮助脚本）：多一层脚本、测试面大，且既有 validate/sync 已覆盖确定性部分

### D2 交付位置：项目级 `.claude/commands/contribute.md`，零新增安装

**Choice**：命令放项目级 `.claude/commands/`（已存在目录、gitignore 未忽略、克隆仓库即用）；不装用户级 `~/.claude/commands/`。
**Rationale**：命令只在仓库内操作 `catalog/catalog.json`，项目级最贴合；贡献者克隆仓库后 `/contribute` 立即可用，零安装。
**Alternatives**：用户级 `~/.claude/commands/`（需安装步骤，且命令在仓库外无意义）；两处都放（多一份维护面）。

### D3 输入形态：`$ARGUMENTS` 可选描述 + 交互式补缺

**Choice**：`/contribute 描述…` 带参时以描述为初始输入，缺字段再交互；无参时纯交互式收集。
**Rationale**：兼容「一句话带描述」的快捷路径与「零基础逐步引导」，降低学习成本。
**Alternatives**：纯交互式（无法一次带参，慢）；纯参数（要求贡献者先懂字段，负担重）。

### D4 主题映射：推断 + 确认，词表外就近映射 + PR 备注

**Choice**：命令从 description 推断候选（全 ∈ `catalog/topics.json`），展示给贡献者确认 / 调整；贡献者表示无合适主题时，引导其在候选中选定语义最接近者（就近），并把「建议新增主题」写进交接 PR 正文附加备注行；不自动新增主题。
**Rationale**：确认环节保证 `topics` 与 skill 实际能力一致（收录判据）；词表唯一源不变，新增主题权在维护者（方案一）。
**Alternatives**：纯自动不确认（映射可能错，贡献者未必发现）；贡献者自选（负担重）；命令自动新增（破坏词表唯一源与机器校验）。

### D5 id 生成：name slug 化 + 唯一检查 + 非 ASCII/冲突回退

**Choice**：从 `name` slug 化（小写字母/数字/连字符），写入前检查全目录唯一；slug 化为空 / 含非法字符 / 冲突时，要求贡献者手输匹配 `^[a-z0-9-]+$` 的 id。
**Rationale**：满足 `catalog.schema.json` 的 id pattern；中文 / 全符号名不被卡死，有明确回退路径。
**Alternatives**：总是贡献者手输 id（负担重）；UUID（不可读，不符合 slug 语义）。

### D6 校验闭环：validate → 修复重试 → sync 再生成 → `--check` 复核

**Choice**：写入后依次跑 `validate.mjs`（失败按报错修复重试至 0）→ `sync-catalog.mjs`（再生成三产物）→ `sync-catalog.mjs --check`（复核退出码 0）。命令以 node 脚本退出码 0 判定成功（读取 `$?`），不依赖输出文案；`--check` 若失败（极少，sync 刚跑完）则重新 sync 再复核，仍失败则停止并报告漂移。
**Rationale**：「条目就绪」=「结构校验过 + 三产物就绪 + 防漂移过」，与 CI 判据一致；复用 v4 退出码约定（0/1）。
**Alternatives**：只 validate 不 sync（三产物不更新，PR 会报漂移）；让贡献者手动跑（回到 v4 手动复杂度）。

### D7 交接输出：commit 示例 + PR 正文模板，不自动 git 写操作

**Choice**：命令输出本地 `git commit` 命令示例 + 按 `.github/PULL_REQUEST_TEMPLATE/skill-entry.md` 模板的 PR 正文（模板固定字段之外，**仅当发生就近映射时**附加「建议新增主题」备注行）；SHALL NOT 自动执行 commit / push / 开 PR。
**Rationale**：边界 = 条目就绪；提交权在贡献者、合入权在维护者，命令不越界（与 v4 REQ-CON-004 精神一致）。
**Alternatives**：命令自动建分支/commit/push/开 PR（需 gh，且把提交权从贡献者手里拿走，越界）。

### D8 文档同步范围：主贡献入口一致，其余显式 Out

**Choice**：`catalog/CONTRIBUTING.md`（推荐路径）、`README.md` / `README-en.md`（双语言入口）、`cc-assistant/eval/cases.md`（贡献者用例）、根 `CLAUDE.md`（当前 change 指针 + 目录子系统段提及 `/contribute`）——全部 Modify；`docs/cc-assistant-使用说明书.md`、`docs/github-pages-部署.md`、`site/index.html` 显式 Out（仍描述手动提 PR，二者不冲突）。
**Rationale**：保证贡献者第一落点的文档一致（含中英镜像），避免漂移；说明书 / 部署文档 / 站点 footer 面向维护者与已熟悉流程者，手动表述仍成立，不扩大 v5 范围。
**Alternatives**：全量更新所有引用手动流程的文件（范围膨胀）；一处都不改（贡献者第一落点漂移）。

## Risks And Trade-Offs

- **纯 markdown 命令行为依赖 Claude 规范性**：不同会话行为可能漂移。缓解：eval 用例（REQ-DOC-003）约束关键行为；确定性步骤由 validate/sync 退出码机器兜底；不改数据层的边界由 REQ-VAL-003 约束。
- **`repo` http/https 仅命令侧校验**：`validate.mjs` 只做 URL 可解析，不兜底协议。缓解：命令编排显式校验协议（REQ-CMD-003）。
- **就近映射是语义判断**：可能映射不贴切。缓解：贡献者确认兜底 + PR 备注提示维护者复核。
- **命令在仓库外运行会失败**：缓解：D1 步骤 1 前置校验 cwd。
- **词表外场景频繁时现有词表可能不够**：缓解：走维护者新增主题流程（CONTRIBUTING 提及），v5 不自动扩词表。
- **未提交工作区改动**：命令写入 catalog.json 前提示先处理未提交改动（D1 步骤 1 前提校验），避免新条目与贡献者本地其他改动混淆。

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
