# 执行合同

## Intent Lock

- **变更名称**：cc-assistant-v1
- **要解决的问题**：Claude Code 用户（尤其新手/个人开发者）面临"发现/匹配/配置/过载/评估"五难——不知道有哪些能力可用、当前场景该用什么、怎么配置。需要一个本地工具扫描环境 → 识别场景 → 推荐并代劳启用 → 反馈。
- **范围内**：Skill + 薄斜杠命令（4 命令：`/assist`、`/assist health`、`/assist apply`、`/feedback`）；核心闭环 Scanner/Matcher/Recommender/Health Check/Feedback Loop；两层可配置目录（内置+自定义，按 id 合并）；场景映射；本地分层数据（用户级 profile + 项目级 project）；代劳启用（装 Skill / 写规则，启用前产品级显式确认）。
- **范围外**：MCP 助手、社区Hub、Subagent、定时推送、快速初始化、Skill 创建助手、任何网络上传、插件形态、推荐 MCP、探索者模式/丰富交互、配置管理（`/assist config`）、快速摘要（`/assist quick`）。

## Approved Behavior

- **已批准需求摘要**：28 条 SHALL/MUST，分 6 能力——Scanner(5)、Matcher(4)、Recommender(8)、Health Check(4)、Feedback Loop(4)、Apply(3)。
- **关键场景**：技术栈识别、场景识别（加权得分 + 优先级决胜 `testing>bug-fix>new-feature>docs>refactor`）、两层目录合并（自定义覆盖内置）、双维度引导（用户等级×项目意图）、健康度评分（基础 20，四档 优秀≥65/良好45-64/待改进25-44/需关注<25）、反馈关联（裸👍/👎→最近一条）、代劳启用（显式确认→Bash/Write→best-effort）。
- **验收检查**：全部 WHEN/THEN 场景定义在 `specs/`；e2e 全流程（Task 4.2）跑通。

## Design Constraints

- **架构约束**：引擎 = 自然语言指令（SKILL.md），Claude 运行时执行，不写编译代码；确定性计算（目录合并、健康度评分）用脚本 `catalog.py`。
- **接口约束**：`merge_catalogs(builtin, custom) -> dict`；`score_health(enabled) -> {score, level}`；`scenarios.json` schema（scenarioSignals / priority / confidence）。
- **依赖约束**：装 Skill 执行目录 `installCmd` verbatim（`npx skills add <owner/repo> --skill <name>`）；开发用 skill-creator（已装）；运行时读 `~/.claude/skills/cc-assistant/data/`。
- **数据约束**：本地分层 JSON、永不回传；profile 含 `visitHistory` / `lastEnabledItems`；规则写项目级 `.claude/rules/<id>.md`；id 映射 = 安装后 skill 目录名。

## Execution Plan

由 build-executor 在 DP-4 阶段生成：先 `ssf execution recommend`，用户确认 mode 后 `ssf execution plan` 持久化到 `<change>/.superpowers/sdd/execution-plan.json`。本契约不预先固定 mode。

## Execution Waves

### Wave 1

- **Wave ID**：deterministic-core
- **任务**：Task 1.1（catalog.py + test_catalog.py，单测 TDD）、Task 1.2（scenarios.json）
- **依赖 wave**：无
- **策略**：`parallel`（两任务无相互依赖）
- **目标**：确定性计算（合并+评分）与场景信号配置就位
- **输入**：specs/（HEALTH-001 权重、MATCH-001 信号表）
- **输出**：`cc-assistant/scripts/catalog.py`、`cc-assistant/scripts/test_catalog.py`、`cc-assistant/data/scenarios.json`
- **完成标准**：`python scripts/test_catalog.py` 全绿；scenarios.json JSON 合法且 6 场景+priority+confidence 齐全
- **Review gate**：review report 路径、base/head SHA、review receipt（`pass` | `fail`）

### Wave 2

- **Wave ID**：skill-core
- **任务**：Task 2.1（Scanner+Matcher）、2.2（Recommender+Health）、2.3（Feedback+Apply）
- **依赖 wave**：Wave 1
- **策略**：`serial`（2.2 依赖 2.1，2.3 依赖 2.2）
- **目标**：SKILL.md 主指令完整
- **输入**：scenarios.json（Wave 1）、catalog.py（Wave 1）
- **输出**：`cc-assistant/SKILL.md`（frontmatter + 6 段指令）、`cc-assistant/eval/cases.md`
- **完成标准**：eval 用例覆盖 SCAN/MATCH/REC/HEALTH/FB/APPLY 全部 28 条需求
- **Review gate**：review report 路径、base/head SHA、review receipt（`pass` | `fail`）

### Wave 3

- **Wave ID**：commands
- **任务**：Task 3.1（4 个薄斜杠命令）
- **依赖 wave**：Wave 2
- **策略**：`serial`
- **目标**：命令入口就位
- **输入**：SKILL.md（Wave 2）
- **输出**：`cc-assistant/commands/assist.md`、`assist-health.md`、`assist-apply.md`、`feedback.md`
- **完成标准**：4 命令齐全、无占位
- **Review gate**：review report 路径、base/head SHA、review receipt（`pass` | `fail`）

### Wave 4

- **Wave ID**：install-e2e
- **任务**：Task 4.1（安装到 `~/.claude/`）、Task 4.2（端到端验证）
- **依赖 wave**：Wave 3
- **策略**：`serial`
- **目标**：安装 + 全流程验证
- **输入**：全部产物
- **输出**：安装到 `~/.claude/skills/cc-assistant/` + `~/.claude/commands/`；`eval/cases.md` 完善
- **完成标准**：真实项目跑通 `/assist` 全流程（识别/推荐/代劳/反馈），全程无上传；代劳用 dummy installCmd 验证确认流程不真装
- **Review gate**：review report 路径、base/head SHA、review receipt（`pass` | `fail`）

## Test Obligations

- **必须先从失败测试开始的行为**：catalog.py（先写 test_catalog.py）；SKILL.md 各段（先在 eval/cases.md 写用例再写指令）。
- **必需的边界情况**：非 git 仓库降级、候选为空回退、自定义覆盖内置、规则文件已存在、安装失败、空项目健康度（20 分"需关注"）、无信号回退、成熟项目不误判 init、TDD 重叠优先级决胜。
- **回归敏感区域**：场景重叠误判（优先级）、两层目录合并、健康度四档阈值、反馈关联、代劳两层确认。

## Execution Mode

- 由 build-executor 在 DP-4 阶段用 `ssf execution recommend <change-dir>` 确定候选与推荐；用户确认后 `ssf execution plan` 持久化。本契约不预先固定 mode。

## Verification Dimensions

| 维度 | 状态 | 发现 |
|------|------|------|
| Completeness | Pending | — |
| Correctness | Pending | — |
| Coherence | Pending | — |

**总体结论**：Pending

## Review Gates

- **强制审查点**：每个 Execution Wave 完成后记录 `ssf execution review` 的 review receipt（`pass`）。
- **阻塞类别**：依赖 wave 未 `pass`、review receipt 为 `fail`/缺失/过期。
- **收口条件**：所有 wave 都有 `pass` review receipt。

## Escalation Rules

- **何时回退到 `specifying`**：出现新 scope、关键接口变化、核心设计假设错误、28 条需求需增删改。
- **何时回退到 `bridging`**：contract 与 proposal/specs/design/tasks 不一致（scope 或约束 drift）。
- **何时不得继续实现**：任何 wave 的 review receipt 非 `pass`；代劳启用未过用户显式确认；出现测试失败且未先经 bug-investigator 根因分析。
