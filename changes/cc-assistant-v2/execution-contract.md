# 执行合同

## Intent Lock

- **变更名称**：cc-assistant-v2
- **要解决的问题**：有开发经验的开发者第一次接触 Claude Code 无从下手——官方文档是参考手册而非上手引导（信息全但无引导、无节奏）。需要一个交互式引导 skill，带学习者用自己项目的真实任务边做边教，完成从「零基础」到「能独立干活」。
- **范围内**：Skill（`cc-assistant/SKILL.md` 编排指令，交叉引用 claude-code-guide）+ `/assist` 命令（用户级）；引导会话全流程（定场→选真实任务→教学闭环→独立复现→收尾）；核心教学（下指令/审阅改动/核心命令/CLAUDE.md）；进阶教学（Skill-Rule-Hook/MCP/Plan Mode/Agent 按需）；安全边界（小而可逆/征得同意/学习者决定权）；用户级安装 `~/.claude/skills/cc-assistant/` + `~/.claude/commands/assist.md`；清理 v1 项目级产物与运行时数据；更新/废弃 v1 文档（`CONTEXT.md`、根 `CLAUDE.md`、`cc助手需求.md`、根 `specs/`）；TDD 开发自测（子代理模拟学习者）。
- **范围外**：v1 效率教练逻辑（扫描/场景识别/推荐/健康度/反馈）及其数据、脚本；不教编程本身；不覆盖其他 AI 工具（Copilot/Cursor）；非穷尽式命令手册；不代劳「落地」配置（演示可以、落地由学习者决定）；任何网络上传/跨用户聚合；插件形态。

## Approved Behavior

- **已批准需求摘要**：20 条 SHALL/MUST，分 6 能力——Session Orchestration(4)、Task Selection & Safety(3)、Core Teaching(4)、Advanced Teaching(4)、Reference Cross-linking(2)、Independent Reproduction(3)。
- **关键场景**：任务驱动主流程（定场→选任务→教学→独立复现→收尾）、just-in-time 教学时机（不预灌）、一次一件事+确认理解、接管/交还控制权、任务过大拆小、无任务给示例、危险操作先征得同意/建议沙箱、未提交改动建议 commit/备份、学习者决定权、模糊指令借机演示、第一处 diff 讲审阅、核心命令按需（/help /clear @文件）、CLAUDE.md 模板演示、进阶按需讲解、`**REQUIRED SUB-SKILL:** claude-code-guide` 交叉引用、官方文档回退、独立复现只观察核对（不代做、失败回退重讲/最小提示/指向资源）、收尾总结+后续资源。
- **验收检查**：全部 WHEN/THEN 场景定义在 `specs/`（20 REQ 全覆盖）；TDD 基线对比（B1 RED → B5 GREEN）；e2e 完整会话走查（B5）；成功标准 3 条（走通闭环、独立复现跑通、进阶按需到位）。

## Design Constraints

- **架构约束**：引擎 = 自然语言编排指令（D1），不写编译代码；`SKILL.md` 只写编排、参考类内容交叉引用不内联（D2/D11）；会话形态 = 任务驱动一次会话（D3）；教学时机 = just-in-time（D4）；独立复现 = 可验证成功标准（D5）。
- **接口约束**：`**REQUIRED SUB-SKILL:** claude-code-guide` 交叉引用（D2/D7）；`/assist` 单一入口（D8/D9）；description 遵守 skill-development-spec（"Use when" 开头、只写触发条件、<500 字符；frontmatter name+description 总长 ≤1024 字符；D10）；SKILL.md 正文目标 <500 词，超长拆支撑文件（D11）。
- **依赖约束**：claude-code-guide 已安装；缺失时降级引用官方 Claude Code 文档（docs.anthropic.com，D2/D7 风险）；遵守 `docs/skill-development-spec.md`。
- **数据约束**：无数据文件（v2 移除 data/ 与 scripts/）；本地只读、永不回传；学习者对项目有决定权（演示可、落地由学习者定）。

## Execution Plan

由 build-executor 在 DP-4 阶段生成：先 `ssf execution recommend`，用户确认 mode 后 `ssf execution plan` 持久化到 `<change>/.superpowers/sdd/execution-plan.json`。本契约不预先固定 mode。

## Execution Waves

### Wave 1

- **Wave ID**：eval-baseline
- **任务**：T1（eval/cases.md 场景用例）、T2（子代理基线 RED）
- **依赖 wave**：无
- **策略**：`serial`（T1 → T2）
- **目标**：场景用例 + 无 skill 基线证据
- **输入**：specs/（20 REQ 的 WHEN/THEN）
- **输出**：`cc-assistant/eval/cases.md`（场景用例 + 基线记录）
- **完成标准**：20 REQ 全覆盖、无占位符；基线证明「无 skill 不引导」
- **Review gate**：review report 路径、base/head SHA、review receipt（`pass` | `fail`）

### Wave 2

- **Wave ID**：skill-core
- **任务**：T3（SKILL.md 骨架+frontmatter）、T4（会话主流程 REQ-SESS）、T5（教学时机+安全边界 REQ-TASK）、T6（核心+进阶教学 REQ-CORE/REQ-ADV）、T7（交叉引用+独立复现 REQ-REF/REQ-INDEP）
- **依赖 wave**：Wave 1
- **策略**：`serial`（T3 → T7 顺序编写）
- **目标**：SKILL.md 编排指令覆盖 20 REQ
- **输入**：eval/cases.md 基线（Wave 1）
- **输出**：`cc-assistant/SKILL.md`（frontmatter + 编排指令）
- **完成标准**：20 REQ 均可追溯；description "Use when" 无工作流摘要；SKILL.md <500 词；无占位符
- **Review gate**：review report 路径、base/head SHA、review receipt（`pass` | `fail`）

### Wave 3

- **Wave ID**：command-install
- **任务**：T8（先删项目级 `assist.md`，再创建用户级 `/assist` 命令）、T9（用户级安装 + 校验）
- **依赖 wave**：Wave 2
- **策略**：`serial`
- **目标**：`/assist` 入口 + 用户级安装；消除项目级旧命令遮蔽
- **输入**：SKILL.md（Wave 2）
- **输出**：项目级 `.claude/commands/assist.md` 已删、`~/.claude/commands/assist.md`、`~/.claude/skills/cc-assistant/SKILL.md`
- **完成标准**：项目级 `assist.md` 删除先于用户级安装（无遮蔽窗口）；用户级安装存在（非项目级）；`/assist` 可拉起引导会话
- **Review gate**：review report 路径、base/head SHA、review receipt（`pass` | `fail`）

### Wave 4

- **Wave ID**：cleanup-docs
- **任务**：T10（清理项目级 v1：`.claude/always/phase-guard.md` 阶段守卫 + `.claude/skills/cc-assistant/` + `.claude/commands/` 剩余 3 命令，`assist.md` 已在 Wave 3 删除）、T11（清理运行时数据 profile.json/project.json + 源 data/、scripts/）、T12（更新/废弃 v1 文档：`CONTEXT.md`、根 `CLAUDE.md`、`cc助手需求.md`、根 `specs/` 6 份 v1 spec）
- **依赖 wave**：Wave 3
- **策略**：`serial`
- **目标**：v1 遗留清理 + 文档生态同步
- **输入**：无（依赖 Wave 3 完成安装，避免开发中断）
- **输出**：清理后状态 + 更新后的 `CONTEXT.md`、根 `CLAUDE.md`、`cc助手需求.md`（或标注废弃）+ 清理后的根 `specs/`
- **完成标准**：清理清单逐项确认（含 `.claude/always/phase-guard.md`）；4 处文档/目录无 v1 过时描述（效率教练/推荐项/场景/目录/健康度）；MCP 已重定义为「进阶教学主题」
- **Review gate**：review report 路径、base/head SHA、review receipt（`pass` | `fail`）

### Wave 5

- **Wave ID**：verify
- **任务**：T13（有 skill 子代理场景 GREEN 对比）、T14（e2e 完整会话走查 + 安全边界抽查）、T15（全量校验 + 自检三轮 + 刷 hash）
- **依赖 wave**：Wave 4
- **策略**：`serial`
- **目标**：TDD GREEN + e2e + 校验闭环
- **输入**：全部产物（Wave 1-4）
- **输出**：验证证据（基线对比 / GREEN / e2e / 校验）
- **完成标准**：基线失败模式均被纠正；成功标准 3 条达成；`ssf validate` 通过；自检 3/3；`test_result: pass`
- **Review gate**：review report 路径、base/head SHA、review receipt（`pass` | `fail`）

## Test Obligations

- **必须先从失败测试开始的行为**：SKILL.md（先写 eval/cases.md 场景用例，再写编排指令；B1 基线 RED → B5 GREEN 对比）。
- **必需的边界情况**：任务过大拆小、无任务给示例、危险/不可逆操作征得同意或建议沙箱、未提交改动建议 commit/备份、教学闭环前提前结束征询、独立复现卡住（不代做、先让学习者尝试、必要时最小提示）、独立复现失败（回教学点重讲或指向 /help 与官方文档）、claude-code-guide 缺失降级官方文档。
- **回归敏感区域**：教学时机（不预灌教材）、安全边界（学习者决定权不被绕过）、交叉引用可用性（缺失时降级）、独立复现不代做（只观察核对）。

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

- **何时回退到 `specifying`**：出现新 scope、关键接口变化（如安装层级/入口命令变更）、核心设计假设错误（如交叉引用降级路径失效）、20 条需求需增删改。
- **何时回退到 `bridging`**：contract 与 proposal/specs/design/tasks 不一致（scope 或约束 drift）。
- **何时不得继续实现**：任何 wave 的 review receipt 非 `pass`；安全边界被绕过（危险操作未征得学习者同意）；出现测试失败且未先经 bug-investigator 根因分析。

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
