# 执行合同

## Intent Lock

- **变更名称**：cc-assistant-v6（目录收录扩展：agents / MCP servers / plugins）
- **要解决的问题**：v4 目录只收 SKILL.md skills（REQ-CAT-004 排除 agents/MCP servers/plugins/commands），但三者均可独立安装 / 配置——优秀工件无处收录
- **范围内**：统一 `skills` 数组 + 可选 `type`（skill/agent/mcp-server/plugin，缺省 skill）；四类全链路适配（schema/validate/测试/sync/站点徽章筛选/快照/PR 模板/CONTRIBUTING/README×2 / `/contribute`/eval）；superpowers 重标 plugin；agent/mcp-server/plugin 各新增一条样例、skill 复用既有 cc-assistant
- **范围外**：`commands` 不收录（REQ-CAT-004 保留该排除）；不改词表（沿用 13 主题）；不自动安装 / 验证；既有条目零字段改动（除 superpowers 重标）

## Approved Behavior

- **已批准需求摘要**：19 条 REQ——
  - MODIFIED REQ-CAT-004：收录范围改四类，commands 仍不收录
  - REQ-TYP-001~004：type 可选缺省 skill、枚举约束、superpowers 重标 plugin、四类样例
  - REQ-MTV-001~003：schema 声明式枚举、validate 显式运行时校验（type + install）、测试矩阵四类
  - REQ-TAD-001~004：快照/site-data 带 type（course-mapping 无）、站点类型徽章、类型筛选（与主题/模块取 AND）、文案统一（品牌名保留）
  - REQ-TAC-001~003：命令先问 type（frontmatter + 字段 8→9）、各类型 install 指引、校验闭环适配
  - REQ-TDC-001~004：CONTRIBUTING 四类判据、README 双语言、PR 模板类型化、eval 覆盖四类
- **关键场景**：缺 type 按 skill；非法 type 被拒定位；superpowers 为 plugin；四类样例校验通过；站点类型徽章/筛选；命令 type-first；交接 PR 含 type
- **验收检查**：四类样例 validate + `--check` 退出码 0；`site/data/catalog.json` 直拷不归一化（逐字一致）；快照条目带类型标注；站点类型筛选/徽章正确；`/contribute` 支持四类；既有条目无回归

## Design Constraints

- **架构约束**：四类共享 8 字段结构，`type` 为唯一新增字段；`install` 单字符串承载各类型安装指引；schema 声明式 enum + validate.mjs 显式运行时校验（validateAgainstSchema 无 enum 分支）
- **接口约束**：catalog.json → schema（properties 加 type）/ validate.mjs（type 枚举 + 8 字段）/ sync-catalog.mjs（site/data 直拷 + 快照补 skill）；site 用 `entry.type ?? 'skill'` 兜底；contribute.md 先问 type → 9 字段 → 校验闭环 → 交接含 type
- **依赖约束**：Wave 顺序 1→2→3→4 串行；w2 依赖 w1；w3 依赖 w1、w2；w4 依赖 w2、w3
- **数据约束**：`type` ∈ {skill, agent, mcp-server, plugin} 缺省 skill；superpowers 唯一例外重标 plugin；`site/data/catalog.json` 与 `catalog.json` 逐字一致（--check）；course-mapping 不涉 type

## Execution Plan

full 模式。先运行 `ssf execution recommend` 确定执行方式（sdd / inline / batch-inline）与 wave 映射，再 `ssf execution plan` 持久化执行计划。本契约的 Execution Waves 已给出 4 个 wave 定义。

## Execution Waves

### Wave 1

- **Wave ID**：w1-data
- **任务**：T1（catalog.json type + 样例）、T2（schema type 枚举）、T3（validate type 检查）、T4（测试矩阵四类）
- **依赖 wave**：无
- **策略**：`serial`
- **目标**：数据层 + 校验支持四类（type 可选缺省、枚举、superpowers 重标、样例）
- **输入**：catalog.json（2 条目）、catalog.schema.json、validate.mjs、validate.test.mjs、sync-catalog.test.mjs
- **输出**：catalog.json（type + 四类样例）、schema（type 属性）、validate.mjs（type 检查）、测试矩阵扩展
- **完成标准**：四类样例 validate 退出码 0；非法 type 拒绝定位（含 commands 排除经 enum 校验实现，REQ-CAT-004）；测试套件全过（REQ-TYP-001~004、REQ-MTV-001~003、REQ-CAT-004）
- **Review gate**：review report `.superpowers/sdd/reviews/wave-1-data.md`、base/head SHA、review receipt（`pass` | `fail`）

### Wave 2

- **Wave ID**：w2-display
- **任务**：T5（sync 快照标注 type）、T6（app.js 徽章 + 筛选 + 文案）、T7（index.html 筛选 UI + footer）
- **依赖 wave**：w1-data
- **策略**：`serial`
- **目标**：同步与站点类型感知展示
- **输入**：catalog.json（四类）、sync-catalog.mjs、site/index.html、site/assets/app.js
- **输出**：快照类型标注、站点类型徽章/筛选、文案统一（品牌名保留）
- **完成标准**：`_community-skills.md` 条目带类型；site/data/catalog.json 直拷逐字一致；站点类型筛选 AND 正确；footer/空态/计数无 skill 措辞（REQ-TAD-001~004）
- **Review gate**：review report `.superpowers/sdd/reviews/wave-2-display.md`、base/head SHA、review receipt（`pass` | `fail`）

### Wave 3

- **Wave ID**：w3-command-docs
- **任务**：T8（contribute 命令 type-first）、T9（PR 模板类型化）、T10（CONTRIBUTING 四类）、T11（README×2 四类）、T12（eval 四类场景）
- **依赖 wave**：w1-data、w2-display
- **策略**：`serial`
- **目标**：贡献命令 + 文档同步四类口径
- **输入**：contribute.md、PR 模板、CONTRIBUTING、README×2、eval/cases.md
- **输出**：命令 type-first + 9 字段、PR 模板 type、CONTRIBUTING/README 四类、eval 场景
- **完成标准**：命令支持四类贡献；PR 模板含 type + 判据分支；CONTRIBUTING/README 四类口径；eval 覆盖（REQ-TAC-001~003、REQ-TDC-001~004、MODIFIED REQ-CAT-004）
- **Review gate**：review report `.superpowers/sdd/reviews/wave-3-command-docs.md`、base/head SHA、review receipt（`pass` | `fail`）

### Wave 4

- **Wave ID**：w4-integration
- **任务**：T13（生成产物 + 端到端验证 + 回归）
- **依赖 wave**：w2-display、w3-command-docs（含 w1-data 传递；w4 仅需 w3 的 T8/T12，T9-11 为文档任务不构成 w4 前置）
- **策略**：`serial`
- **目标**：GREEN 复测 + 回归——四类端到端、既有条目无回归
- **输入**：四类样例、contribute 命令、站点、快照
- **输出**：验证记录（19 REQ 满足对照 + 无回归）
- **完成标准**：四类校验通过、/contribute 端到端可用、站点类型展示正确、既有条目（cc-assistant/superpowers）无回归（19 REQ 全满足）。判读口径：`site/data/catalog.json` 直拷不归一化（缺 type 不带字段，D3）；「缺省补 skill」仅适用于快照 `_community-skills.md` 与站点兜底 `entry.type ?? 'skill'`
- **Review gate**：review report `.superpowers/sdd/reviews/wave-4-integration.md`、base/head SHA、review receipt（`pass` | `fail`）

## Test Obligations

- **必须先从失败测试开始的行为**：validate 的非法 type 拒绝（T3 内联自验、T4 正式用例 RED→GREEN）；sync 快照类型标注（T4 测试先于 T5 实现）
- **必需的边界情况**：缺 type 按 skill、非法 type（command 枚举外）、install 缺失、superpowers 重标、site/data 直拷 --check 逐字、类型筛选 AND 组合、`/contribute` 四类 install 指引
- **回归敏感区域**：既有 skill 条目（cc-assistant）零改动、superpowers 重标后正常展示、三产物再生成一致性、`--check` 逐字语义不变、课程快照/网页无回归

## Execution Mode

- **可用方式与推荐**：`ssf execution recommend <change-dir>`（待 build 前运行，按 4 wave 任务量与串行依赖推荐）
- **用户确认的模式**：待 `ssf execution recommend` 后由用户确认（sdd | inline | batch-inline）
- **推荐理由 / 项目事实**：任务跨数据/展示/命令/文档多模块，跨 wave 串行依赖明确；沿用仓库既有 sdd 执行模式（v1-v5 均 sdd）
- **非推荐选择的风险确认**：`--acknowledge-recommendation`（若选择非推荐方式）
- **执行计划命令**：`ssf execution plan <change-dir> --mode <mode> --confirm --reason <text> --wave <id>:<parallel|serial>:<task,...>[:<depends-on,...>] [--acknowledge-recommendation]`
- **允许的修订**：`ssf execution revise <change-dir> --mode sdd --confirm --reason <text> --wave <id>:<parallel|serial>:<task,...>[:<depends-on,...>] [--acknowledge-recommendation]`（保留/升级为 sdd；先重新 recommend；不允许降级）
- **计划 revision / artifact hash**：执行计划持久化于 `<change>/.superpowers/sdd/execution-plan.json`（非契约一部分）；contract_hash 由 `ssf state init/rebuild` 记录

## Verification Dimensions

| 维度 | 状态 | 发现 |
|------|------|------|
| Completeness | Pending | — |
| Correctness | Pending | — |
| Coherence | Pending | — |

**总体结论**：Pending

## Review Gates

- **强制审查点**：每个 Execution Wave 完成后记录 `ssf execution review` 的 review receipt
- **阻塞类别**：依赖 wave 未通过、review receipt 为 `fail`、缺失或过期
- **收口条件**：所有当前 wave 都有 `pass` review receipt

## Escalation Rules

- **何时回退到 `specifying`**：出现 specs 未覆盖的新需求 / 范围与 contract 冲突 / 未映射 REQ（如命令需新增行为超出现有 19 条）
- **何时回退到 `bridging`**：接口 / 数据约束与 design 冲突（如必须改动四类字段结构、词表或 `--check` 比较语义，与 D1/D3 冲突）；或 REQ-TAD-001 场景与 D3 不归一化决策冲突无法调和
- **何时不得继续实现**：本执行契约定稿批准（dp_3）未记录；任一依赖 wave 的 review receipt 非 `pass`；出现未映射 REQ 未升级；执行计划与 artifact / contract / wave 不一致

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
