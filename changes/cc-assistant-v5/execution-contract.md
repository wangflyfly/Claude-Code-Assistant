# 执行合同

## Intent Lock

- **变更名称**：cc-assistant-v5（`/contribute` 斜杠命令：贡献者一句话入库）
- **要解决的问题**：v4 社区贡献流程复杂——贡献者要手动 8 字段规范、主题词表、validate+sync 双脚本、防漂移、PR 模板，心智负担重
- **范围内**：`.claude/commands/contribute.md` 纯斜杠命令（项目级零新增安装），贡献者用自然语言描述（含 `install`）即得合法条目 + 三产物就绪；`catalog/CONTRIBUTING.md`、`README.md`、`README-en.md`、根 `CLAUDE.md`、`cc-assistant/eval/cases.md` 文档同步
- **范围外**：不自动 commit / push / 开 PR（边界 = 条目就绪）；不装 gh、不加任何新 node/JS 脚本；不自动新增主题（词表外就近映射 + PR 备注，决策权在维护者）；不改 v4 数据层结构与脚本（topics.json / course-mapping.json / catalog.schema.json / validate.mjs / sync-catalog.mjs / catalog-ci.yml 不动；catalog.json 仅 skills 末尾追加）、不改 `.github/PULL_REQUEST_TEMPLATE/skill-entry.md`

## Approved Behavior

- **已批准需求摘要**：15 条 REQ——
  - REQ-CMD-001~004：命令可触发（项目级零安装）、输入形态（`$ARGUMENTS`/交互）、6 字段收集（含 install、repo 命令侧校验 http/https）、交接输出（不自动 git 写操作，仅就近映射时附加「建议新增主题」备注）
  - REQ-ENT-001~002：id 生成（slug + 唯一 + 非 ASCII/空/冲突回退）、条目合法写入（skills 末尾追加，8 字段 schema 合规，不动既有条目）
  - REQ-TOP-001~002：主题推断 + 确认（非空/不重复/⊆ 词表）、词表外就近映射 + 条件性 PR 备注（不自动新增主题）
  - REQ-VAL-001~003：validate 失败重试至 0、sync 再生成三产物 + `--check` 复核（失败重 sync，仍失败停止并报告漂移）、不改数据层
  - REQ-DOC-001~004：CONTRIBUTING 推荐路径、README 双语言入口、eval 贡献者用例、根 CLAUDE.md 指针 + 入口
- **关键场景**：带参/无参触发；缺字段补齐；repo 协议非法；id 非 ASCII/空/冲突回退；主题推断+确认；词表外就近映射 + 条件性 PR 备注；validate 重试；sync+`--check`；交接不自动 git；数据层文件原样
- **验收检查**：`validate.mjs` 通过、`sync-catalog.mjs` 再生成后 `--check` 复核退出码 0；catalog.json 仅 skills 末尾新增条目；topics.json / course-mapping.json / catalog.schema.json / validate.mjs / sync-catalog.mjs / catalog-ci.yml 六文件保持原样；PR 模板文件不改；DOC 类验收（CONTRIBUTING 推荐路径 / README 双语言入口 / 根 CLAUDE.md 指针）见 Wave 3 完成标准

## Design Constraints

- **架构约束**：纯 markdown 命令编排（D1），不产生新脚本；7 步流程 = 前提校验（cwd 仓库根 + 未提交改动提示）→ 6 字段收集 → id 生成 → 主题映射 → 追加 catalog.json → 校验闭环 → 交接输出
- **接口约束**：contribute.md → catalog.json（追加）/ topics.json（读词表）/ validate.mjs、sync-catalog.mjs（运行，以退出码 0 判定，读取 `$?` 不依赖输出文案）；→ PR 模板（引用固定字段，不改模板）；→ 三产物（经 sync 再生成，不手工编辑）
- **依赖约束**：Wave 顺序 1→2→3→4 串行；即时依赖链 T1→T2→T3→T4 与 T4→T5→T6→T7（见 tasks.md）；T8 依赖 T1/T4/T7
- **数据约束**：catalog.json 仅 skills 数组末尾追加；topics 非空、项不重复、全部 ⊆ `topics.json` 词表；id 匹配 `^[a-z0-9-]+$` 且全目录唯一

## Execution Plan

full 模式。先运行 `ssf execution recommend` 确定执行方式（sdd / inline / batch-inline）与 wave 映射，再 `ssf execution plan` 持久化执行计划。本契约的 Execution Waves 已给出 4 个 wave 的定义，供 recommend/plan 映射。

## Execution Waves

### Wave 1

- **Wave ID**：w1-eval
- **任务**：T1（`cc-assistant/eval/cases.md` 新增 /contribute 贡献者场景用例）
- **依赖 wave**：无
- **策略**：`serial`
- **目标**：RED——用 eval 用例定义命令关键行为的期望（字段收集/id 回退/主题确认/就近映射/校验闭环/交接），无命令基线以 README 5 步 / CONTRIBUTING 4 步手动流程为佐证（有意时序，T8 复测对照）
- **输入**：specs REQ-CMD/ENT/TOP/VAL、CONTRIBUTING.md / README.md 手动流程
- **输出**：`cc-assistant/eval/cases.md` 新增用例（REQ-DOC-003）
- **完成标准**：每条场景含 WHEN/THEN、标注 REQ ID（可 WHEN/THEN 表达的部分全覆盖，VAL-003 归 T8）；基线佐证声明
- **Review gate**：review report `.superpowers/sdd/reviews/wave-1-eval.md`、base/head SHA、review receipt（`pass` | `fail`）

### Wave 2

- **Wave ID**：w2-command
- **任务**：T2、T3、T4（创建 `.claude/commands/contribute.md`：frontmatter+步骤 1-2 → 步骤 3-4 → 步骤 5-7）
- **依赖 wave**：w1-eval
- **策略**：`serial`
- **目标**：GREEN——实现完整命令编排，满足 REQ-CMD/ENT/TOP/VAL 共 11 条
- **输入**：eval 用例（RED 预期）、topics.json 词表、validate/sync 脚本
- **输出**：`.claude/commands/contribute.md`
- **完成标准**：命令行为类 REQ 全满足；追加条目合法且既有条目原样；validate/sync/`--check` 退出码 0（`--check` 失败重 sync 再复核，仍失败停止并报告漂移）；6 数据层文件原样；交接含 commit 示例 + PR 正文（仅就近映射时附加备注行）
- **Review gate**：review report `.superpowers/sdd/reviews/wave-2-command.md`、base/head SHA、review receipt（`pass` | `fail`）

### Wave 3

- **Wave ID**：w3-docs
- **任务**：T5、T6、T7（`catalog/CONTRIBUTING.md`、`README.md`、`README-en.md`、根 `CLAUDE.md` 更新）
- **依赖 wave**：w2-command
- **策略**：`serial`
- **目标**：文档同步——/contribute 推荐路径、双语言入口、根 CLAUDE.md 指针 v4→v5 + 入口
- **输入**：`.claude/commands/contribute.md`（可引用）、既有文档
- **输出**：4 文件更新（REQ-DOC-001/002/004）
- **完成标准**：CONTRIBUTING 含推荐路径与手动备选；README 中英两处提及 /contribute 无漂移；根 CLAUDE.md 指针指向 v5、目录子系统段含 /contribute 入口
- **Review gate**：review report `.superpowers/sdd/reviews/wave-3-docs.md`、base/head SHA、review receipt（`pass` | `fail`）

### Wave 4

- **Wave ID**：w4-integration
- **任务**：T8（子智能体模拟贡献者全流程 + 回归）
- **依赖 wave**：w2-command、w3-docs（eval 用例来自 w1-eval / T1）
- **策略**：`serial`
- **目标**：GREEN 复测 + 回归——命令行为逐项验证、既有功能无回归
- **输入**：eval 用例（w1-eval / T1）、`.claude/commands/contribute.md`、更新后的文档
- **输出**：验证记录（REQ 满足对照 + 无回归）
- **完成标准**：命令行为类 REQ（CMD/ENT/TOP/VAL）逐项满足；无命令基线 vs 有命令对比符合 T1 预期；VAL-003 由本次回归验证；DOC 类由 w3 验收（不重复）；既有产物（catalog 校验 / sync 防漂移 / 网页 / 课程快照）无回归
- **Review gate**：review report `.superpowers/sdd/reviews/wave-4-integration.md`、base/head SHA、review receipt（`pass` | `fail`）

## Test Obligations

- **必须先从失败测试开始的行为**：命令关键行为（字段收集 / id 回退 / 主题确认 / 就近映射 / 校验闭环 / 交接输出）先由 T1 eval 用例定义期望（RED），实现后 T8 复测（GREEN）
- **必需的边界情况**：缺字段补齐、repo 非 http/https、id 非 ASCII / 空 / 冲突、词表外就近映射、`--check` 漂移、未提交工作区改动提示
- **回归敏感区域**：catalog.json（仅 skills 末尾追加，既有条目原样）、三产物（sync 再生成一致性 + `--check`）、6 数据层文件原样、PR 模板不改、课程快照/网页不受影响

## Execution Mode

- **可用方式与推荐**：`ssf execution recommend <change-dir>`（待 build 前运行，按 4 wave 任务量与串行依赖推荐）
- **用户确认的模式**：待 `ssf execution recommend` 后由用户确认（sdd | inline | batch-inline）
- **推荐理由 / 项目事实**：任务以 markdown 编排与文档为主，跨 wave 串行依赖明确（eval→命令→文档→集成）；沿用仓库既有 sdd 执行模式（v1-v4 均 sdd）
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

- **何时回退到 `specifying`**：出现 specs 未覆盖的新需求 / 范围与 contract 冲突 / 未映射 REQ（如命令需新增行为超出现有 15 条）
- **何时回退到 `bridging`**：接口 / 数据约束与 design 冲突（如必须改动 validate/sync 脚本或 PR 模板，与 REQ-VAL-003 / REQ-CMD-004 冲突）
- **何时不得继续实现**：本执行契约定稿批准（dp_3）未记录；任一依赖 wave 的 review receipt 非 `pass`；出现未映射 REQ 未升级；执行计划与 artifact / contract / wave 不一致

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
