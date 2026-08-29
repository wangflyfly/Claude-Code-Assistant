# Design: CC Assistant v6（目录收录扩展：agents / MCP servers / plugins）

## Context

**现状**：v4 社区 Skill 目录（`catalog/catalog.json` 唯一事实源 + validate/sync + GitHub Pages + 课程快照）只收 SKILL.md skills（REQ-CAT-004 排除 agents/MCP servers/plugins/commands）。v5 加了 `/contribute` 命令。但 agents（`~/.claude/agents/` markdown 文件）、MCP servers（`.mcp.json`/`claude mcp add`）、plugins（marketplace）均可独立安装 / 配置，优秀的三者无处收录。

**约束**：

- 统一 `skills` 数组 + 可选 `type` 字段（缺省 skill），既有条目向后兼容
- 四类共享 8 字段结构，`type` 为唯一新增字段；`install` 单字符串承载各类型安装指引
- commands 仍不收录（REQ-CAT-004 MODIFIED）
- 不改词表（沿用 13 主题）、不自动安装 / 验证
- 全链路适配：schema / validate / 测试 / sync / 站点 / 快照 / PR 模板 / CONTRIBUTING / README×2 / `/contribute`

**Stakeholders**：贡献者（想分享 agent/MCP/plugin 的开发者）、学习者（按主题发现）、维护者（审核）、站点用户。

## Goals

- G1：目录收录 skill / agent / mcp-server / plugin 四类，统一数据模型、向后兼容
- G2：校验 / 同步 / 展示 / 贡献命令全链路感知类型
- G3：四类共享 8 字段，`install` 承载各类型安装指引（改动最小）
- G4：commands 显式排除，词表 / 既有条目不动
- G5：保留「社区 Skill 目录」品牌名，文案层面统一为「条目 / entry」

## Decisions

### D1 数据模型：可选 `type` 字段，缺省 skill，四类共享 8 字段

**Choice**：`catalog/catalog.json` 保持统一 `skills` 数组，每条目加**可选** `type`（`skill`/`agent`/`mcp-server`/`plugin`），缺省按 `skill` 处理；四类共享既有 8 字段（id/name/description/author/install/repo/license/topics），`type` 为唯一新增字段，`install` 单字符串承载各类型安装指引。
**Rationale**：既有条目零字段改动、向后兼容；不改字段结构使 schema/validate/sync/站点改动最小；`install` 本就是自由文本指引，天然承载「skill/agent 复制、mcp-server 命令配置、plugin marketplace 源」。四类样例 = cc-assistant(skill) + 新增 agent / mcp-server / plugin 各一条（具体 repo 选取 tasks 定）；`validate.test.mjs` / `sync-catalog.test.mjs` 用例矩阵扩展四类（合法含缺 type、非法 type、install 缺失）。
**Alternatives**：按 type 分支字段（mcp-server 加 `command`、plugin 加 `marketplace`）——更结构化但 schema/validate/站点改动大，且既有 `install` 已可承载；拆多数组 / 多文件——割裂唯一事实源，改动面更大。

### D2 校验分工：schema 声明式枚举 + validate.mjs 显式运行时校验

**Choice**：`catalog/catalog.schema.json` 在 `properties` 新增 `"type": {"type":"string","enum":["skill","agent","mcp-server","plugin"]}`（既有 `additionalProperties:false` 要求 type 必须登记进 properties，否则带 type 条目全判非法）；`catalog/validate.mjs` 显式实现 `type` ∈ 枚举检查（缺省按 skill）——因为 `validateAgainstSchema` 当前不处理 `enum` 关键字，非法 type 的拒绝由 validate.mjs 显式逻辑承担。8 字段必填 / `install` 非空沿用既有 schema，validate.mjs 唯一新增是 type 枚举检查。
**Rationale**：schema 是唯一事实约束的声明，validate.mjs 是运行时执行者；明确分工避免「在哪层拒非法 type」歧义。
**Alternatives**：扩展 validateAgainstSchema 支持 enum——侵入既有校验器，改动大；仅靠 schema——当前校验器不处理 enum，非法 type 会漏过。

### D3 同步产物：快照与 site/data/catalog.json 带 type，course-mapping 不涉

**Choice**：`catalog/sync-catalog.mjs` 再生成时：`site/data/catalog.json` **保持直拷** `catalog.json`（缺 type 条目不带字段，**不归一化补写**，`--check` 逐字比较语义不变）；`cc-assistant/modules/_community-skills.md` 快照为每条目标注类型（缺省补 skill，快照生成逻辑自行补齐）；`site/data/course-mapping.json` 是模块→主题映射、不含条目、不涉 type。站点对缺省 type 以 `entry.type ?? 'skill'` 兜底展示。
**Rationale**：快照与站点数据需让学习者看到条目类型；course-mapping 无条目无 type 可标注。
**Alternatives**：快照不标注类型——学习者无法在课程快照区分 skill/agent/mcp/plugin，体验差。

### D4 站点展示：类型徽章 + 筛选 + 文案统一

**Choice**：`site/index.html` + `site/assets/app.js` 为每条目渲染类型徽章（skill/agent/mcp-server/plugin，缺省 `type ?? 'skill'`）；新增类型筛选 chip 组（四类 + 全部），与既有主题 chips、模块下拉**取 AND** 组合；footer / 空态 / 计数文案统一为「条目 / entry」（卡片无 skill 字样、不改 CSS 类名）；`<title>`/`<h1>` 的「社区 Skill 目录」品牌名逐字保留，**不加「及生态工件」后缀**。
**Rationale**：四类条目混排时，徽章 + 筛选让学习者能按类型浏览；文案统一避免「skill 目录收 mcp」语义别扭；品牌名保留（TAD-004）。
**Alternatives**：不显示类型——四类混排无法区分；品牌名改「社区条目目录」——影响面大、不可逆。

### D5 贡献命令：先问 type，字段 8→9，install 按类型指引

**Choice**：`.claude/commands/contribute.md` 先询问条目 `type`，再按类型收集字段（四类共享 8 字段 + type，`install` 单字符串承载）；frontmatter `description`/`argument-hint` 更新为四类口径；写入结构字段数 8→9；交接 PR 正文含 `type`（模板经本 change 一次性加 type 字段；命令运行时「不改模板文件」指不修改文件本身）。
**Rationale**：贡献者体验一致——所有类型都能用 `/contribute`；`install` 按类型给对应指引示例（skill/agent 复制、mcp-server 命令、plugin marketplace）。
**Alternatives**：命令保持 skill-only——新增三类走手动 PR，体验割裂（用户已选全链路）。

### D6 superpowers 重标 plugin

**Choice**：既有 `superpowers` 条目显式标 `type: plugin`（其 install 走 `/plugin install`，实为 plugin；v6 唯一例外）。
**Rationale**：保持语义准确——默认 skill 会把 plugin 误标为 skill；这是「既有条目零字段改动」的唯一例外。
**Alternatives**：superpowers 保持缺省 skill——语义瑕疵（type=skill 但 install 走 /plugin）。

### D7 文档与 PR 模板同步

**Choice**：`catalog/CONTRIBUTING.md` 收录范围改四类 + 各类型形态判据 + `type`/`topics` 正交说明；`README.md`/`README-en.md` 贡献段改四类口径（中英镜像）；`.github/PULL_REQUEST_TEMPLATE/skill-entry.md` 加 `type` 字段 + 各类型形态判据 + 维护者审核按类型分支；`cc-assistant/eval/cases.md` 新增四类贡献场景。
**Rationale**：贡献者第一落点（CONTRIBUTING/README/PR 模板）与命令、校验一致；eval 锚定 REQ 保证可测。
**Alternatives**：只改 CONTRIBUTING 不改 README/PR 模板——贡献者入口不一致，中英漂移。

### D8 commands 边界与词表

**Choice**：`commands` 仍不收录（REQ-CAT-004 显式保留该排除）；词表沿用 13 主题（`mcp`/`plugins`/`subagent` 适配新类型，`type` 是工件形态、`topics` 是发现主题，二者正交不强制映射）。
**Rationale**：聚焦用户要的四类；词表不动避免影响面扩大；type/topics 正交让任一类型可用任一主题发现。
**Alternatives**：commands 也收——范围扩大；加词表——影响 v4 校验与站点。

## Risks And Trade-Offs

- **`type` 可选 + 缺省 skill**：语义上旧条目隐式为 skill，新条目显式标 type——风险是贡献者忘记标 type 时条目被当 skill 展示。缓解：/contribute 强制询问 type；站点徽章对缺省 skill 显示「skill」。
- **`install` 单字符串承载四类**：不同类型的安装指引复杂度不一（plugin 可能多命令）。缓解：CONTRIBUTING 给各类型 install 示例；validate 只要求非空，不代编。
- **superpowers 重标 plugin 影响向后兼容**：唯一例外；站点/快照重新生成后 superpowers 显示 plugin 徽章，行为不破坏。
- **快照缺省补 skill 与 `--check`**：design 已定（a）不归一化——`site/data/catalog.json` 保持直拷、缺 type 条目不带字段，`--check` 逐字比较语义不变；快照生成逻辑自行补 skill 标注，不影响 `--check`。
- **品牌名「社区 Skill 目录」保留 vs 四类收录**：名字含「Skill」但与实际收录不符。缓解：文案层统一为「条目 / entry」，品牌名作专名保留（TAD-004 已定）。

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
