# Proposal: CC Assistant v6（目录收录扩展：agents / MCP servers / plugins）

## Why

v4 目录只收 SKILL.md skills（REQ-CAT-004 排除 agents / MCP servers / plugins / commands），但已核实 agents / MCP servers / plugins 三者均可独立安装 / 配置：agents 是带 frontmatter 的 markdown 文件、放进 `~/.claude/agents/` 或 `.claude/agents/` 数秒生效；MCP servers 经 `.mcp.json` / `claude mcp add` 配置独立进程；plugins 经 marketplace 分发、可内嵌 agents + skills + MCP + commands。优秀的三者目前无处收录——贡献者想分享只能走目录外渠道，学习者想发现也没有聚合入口。v6 把收录范围扩展为 skill / agent / mcp-server / plugin 四类，让整个 Claude Code 生态的可独立安装工件都能进目录被按主题发现。

## What Changes

- **数据层**：`catalog/catalog.json` 保持统一 `skills` 数组，每条目新增**可选** `type` 字段（`skill` / `agent` / `mcp-server` / `plugin`），**缺省按 `skill` 处理**（既有条目零字段改动、向后兼容）；superpowers 实为 plugin（install 走 `/plugin install`），v6 显式重标为 `plugin`（唯一例外）。
- **校验**：`catalog/catalog.schema.json` 增加 `type` 枚举校验（可选，缺省 skill 语义）；`catalog/validate.mjs` 校验 `type` ∈ 枚举（缺省按 skill）、各类型必填字段、`install` 安装指引非空。
- **同步**：`catalog/sync-catalog.mjs` 再生成 `site/data/catalog.json` 与课程快照时保留并标注 `type`（`site/data/course-mapping.json` 为模块→主题映射、不含条目、不涉 type）。
- **展示**：站点（`site/index.html` + `site/assets/app.js`）增加类型徽章 + 类型筛选；课程快照 `_community-skills.md` 条目带类型标注。
- **文档**：`catalog/CONTRIBUTING.md`、`README.md`、`README-en.md` 收录范围更新为四类（贡献什么 / 为什么 / 判据）。
- **PR 模板**：`.github/PULL_REQUEST_TEMPLATE/skill-entry.md` 增加 `type` 字段、各类型形态判据、维护者审核清单按类型分支。
- **命令**：`.claude/commands/contribute.md` 先询问 `type`，按类型收集字段与安装指引（frontmatter 措辞 + 字段数 8→9 加 type）。

## Scope

### In

- 四类收录（`skill` / `agent` / `mcp-server` / `plugin`），统一数组 + `type` 字段
- 全链路适配：schema / validate / sync / 站点（徽章 + 筛选）/ 课程快照 / CONTRIBUTING / README×2 / `/contribute` 命令
- 四类样例条目（每类至少一条，含 skill 既有条目的向后兼容验证）
- eval 用例覆盖新类型贡献流程（TDD）

### Out

- `commands` 不收（保持 v4 排除）
- 不改词表结构（沿用 `catalog/topics.json` 13 主题，`mcp` / `plugins` / `subagent` 天然适配新类型）
- 不自动安装 / 验证条目（目录只做发现与安装指引，安装由学习者决定）
- 除 superpowers 显式重标为 `plugin` 外，既有条目（cc-assistant）零字段改动
- 不新增类型专属独立页面 / 复杂前端（沿用现有单一列表 + 筛选）

## Success Criteria

- 四类各一条样例条目，`validate.mjs` 通过、`sync-catalog.mjs --check` 退出码 0
- 站点按类型徽章 + 筛选正确展示四类条目
- `/contribute` 命令能引导贡献任意类型（含各类型字段与安装指引）
- 既有条目向后兼容、无回归（cc-assistant 保持 skill；superpowers 重标 plugin 后仍正常展示）
- eval 用例覆盖新类型贡献（无命令基线 vs 有命令）

## Impact

- **修改**：`catalog/catalog.json`（加 `type` + 四类样例 + superpowers 重标 plugin）、`catalog/catalog.schema.json`（type 枚举，既有字段结构不变）、`catalog/validate.mjs`（类型校验）、`catalog/validate.test.mjs`（用例矩阵扩展四类）、`catalog/sync-catalog.mjs`（类型标注）、`catalog/sync-catalog.test.mjs`（用例扩展）、`site/index.html`（类型筛选 UI + skill→条目文案）、`site/assets/app.js`（类型徽章 + 筛选逻辑 + skill 文案统一）、`catalog/CONTRIBUTING.md`（收录范围）、`README.md` / `README-en.md`（贡献引导）、`.github/PULL_REQUEST_TEMPLATE/skill-entry.md`（type 字段 + 形态判据 + 审核分支）、`.claude/commands/contribute.md`（type 询问 + frontmatter + 字段 8→9）、`cc-assistant/eval/cases.md`（新类型用例）
- **生成产物（经 sync 再生成，入库提交）**：`site/data/catalog.json`、`site/data/course-mapping.json`、`cc-assistant/modules/_community-skills.md`
- **不动**：`catalog/topics.json`、`catalog/topics.md`、`catalog/course-mapping.json`、`.github/workflows/catalog-ci.yml`、除 `_community-skills.md` 外的课程模块文件（`cc-assistant/modules/*.md`）
- **开发自测**：按 skill-development-spec 的 TDD——validate/sync 用例矩阵扩展至四类、`/contribute` 各类型引导用例、站点类型筛选验证
- **README 非贡献段（显式保留）**：功能特性表与「社区 Skill 目录（社区的作用）」段仍以 skill 表述，本 change 仅改贡献段（保留品牌名，stale 面显式接受）

## Capabilities

- 多类型收录（Multi-Type Catalog）
- 类型化条目（Typed Entries）
- 类型感知展示（Type-Aware Display）
- 类型感知贡献命令（Type-Aware Contribute）
- 类型文档同步（Type Docs）

## 待定项（design/tasks 阶段明确，不阻塞本 proposal）

- 各类型 `install` 指引规范（skill 复制目录 / agent 复制文件 / mcp-server 命令与配置 / plugin marketplace 安装）——design
- 站点类型筛选的交互形态（chips / 下拉 / 徽章样式）——design
- 课程快照里类型的展示格式（按主题分组内如何区分类型）——design
- `/contribute` 的 `type` 询问流程与各类型字段差异——design
- 四类**共享 8 字段结构**（已定），`install` 单字符串承载各类型安装指引（skill/agent 复制、mcp-server 命令配置、plugin marketplace 源）——具体指引格式 design 细化
- `type`（工件形态）与 `topics`（发现主题）正交关系、不强制映射——design 明确并在 CONTRIBUTING 说明
- 品牌名「社区 Skill 目录」保留（TAD-004 已定）；是否加「及生态工件」后缀——design 定
- 四类样例条目的具体选取（真实可访问的 repo）——tasks 阶段定

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
