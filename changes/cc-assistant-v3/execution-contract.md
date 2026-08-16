# 执行合同

## Intent Lock

- **变更名称**：cc-assistant-v3 模块化上手引导课程
- **要解决的问题**：v2「任务驱动·单会话」只能浅尝核心能力与按需进阶，无法系统掌握 Claude Code 的 Harness 能力（记忆系统/Skills/子智能体/Hooks/MCP/Headless/Agent SDK/Plugins）。学习者需要按功能模块组织的课程，多会话渐进续接，把进阶整合成体系。
- **范围内**：`SKILL.md` 重写为 v3 课程编排层（正文 <200 词）+ `/assist` 命令 + `modules/` 支撑文件（M0+11 模块教学内容）；两阶段教学（进阶必修广度 / 高阶可选深度）；多会话 `progress.json` 续接（无文件询问）；每模块真实小练习（同项目串联）；收官整合（跨模块综合任务+体系讲解改写归因）；参考层交叉引用（claude-code-guide+官方文档）；继承 v2 安全边界与核心教学；eval/cases.md 模块化重构（TDD）；文档影响面（CONTEXT.md/根 CLAUDE.md/.gitignore/cc助手需求.md）；根 `specs/` 6 份 v2 spec 由 spec-merger 替换/废弃。
- **范围外**：不教编程本身；不覆盖其他 AI 工具；非穷尽式命令手册；不代劳「落地」配置；不把书版权内容复制进交付物；Plan Mode 不单列模块（核心模块内按需）；高阶阶段不强制；v1 效率教练与 v2 单会话形态不再保留；不更新 3 处历史 `.superpowers/sdd/*` 归档（根 / cc-assistant-v1 / cc-assistant-v2，属派生数据，wave-7 收尾时勿误删）。

## Approved Behavior

- **已批准需求摘要**：34 条 REQ（模块化课程编排 MCO×5、多会话进度续接 SCN×6、每模块真实小练习 PME×5、两阶段教学 TPT×3、收官整合 ICN×3、参考层交叉引用 RCL×3、安全边界 SFT×4、核心能力教学 COR×5）全为已批准行为，逐条见 `specs/` 8 份 spec.md。
- **关键场景**：首次进入（M0 定场→选项目→询问全新/续接→进入对应模块）；一次 `/assist` 一个单机制模块；模块完成写进度、中断续接（模块级）；收官整合多会话综合阶段；练习依赖缺失降级（`degraded` 计入进度）；收官体系讲解改写归因。
- **验收检查**：`ssf validate` 全部通过；eval/cases.md 无 skill 基线 vs 有 skill 行为对比（每个主观成功标准挂可观察 WHEN/THEN 谓词）；收官综合场景学习者独立完成并说出选型理由；书框架改写抽查无原文整段照抄。

## Design Constraints

- **架构约束**：`SKILL.md` 为编排层（**正文** <200 词，不含 frontmatter；校验命令 `sed '/^---\r*$/,/^---\r*$/d' cc-assistant/SKILL.md | wc -w`，兼容 CRLF 行尾，与 design D2 / REQ-MCO-005 的「正文」口径一致），模块教学内容拆 `modules/<module>.md`（skill-development-spec §2 重型参考类）；安装用户级 `~/.claude/skills/cc-assistant/`，`/assist` 命令沿用；T20 追加续接编排段后 SKILL.md 正文仍须 <200 词（同口径），超限则移至 modules/。
- **接口约束**：`progress.json` 结构 `{phase, completedModules[{phase, moduleId, degraded?}], currentModule: {phase, moduleId}, updatedAt}`（`currentModule` 为对象，非 moduleId 字符串，与 tasks.md Interfaces 一致）；moduleId ∈ {core, memory, skills, subagent, hooks, mcp, headless, sdk, plugins, engineering, capstone}；phase ∈ {进阶, 高阶}；`degraded:true`=练习降级、概念与场景完成。
- **依赖约束**：续接为模块级（无模块内 checkpoint）；高阶深度复用同模块号、以 phase 区分；两阶段 `completedModules` 记录 (phase, moduleId) 对；`SKILL.md → modules/` 按序引导读取（渐进式披露）。
- **数据约束**：`progress.json` 完整路径 `.claude/cc-assistant/progress.json`（REQ-SCN-001），个人进度默认 gitignore 不进共享；`.gitignore` 清理 v1 `project.json` 残留（第 29 行）+ 忽略 `progress.json`。

## Execution Plan

full 变更。先运行 `ssf execution recommend <change-dir>` 按任务量与 wave 策略列出可用方式（sdd / inline / batch-inline）并推荐，保存 recommendation receipt；用户通过 `--confirm` 明确确认模式（选非推荐方式须 `--acknowledge-recommendation`）；批准后 `ssf execution plan <change-dir> --mode <mode> --confirm --wave ...` 将计划持久化到 `<change>/.superpowers/sdd/execution-plan.json`（控制面，非合同一部分）。Batch Inline 为串行，不得描述为并行。

## Execution Waves

每个 wave 必须有唯一 ID；只有依赖 wave 的 review receipt 为 `pass` 后，后续 wave 才开始。`parallel` 表示宿主支持并发派发时可同时执行；不支持并发时必须明确报告能力不可用，不得把 parallel 悄然改串行。

### Wave 1 — eval 基线（RED）

- **Wave ID**：wave-1-eval-red
- **任务**：T1（重构 cases.md 模块化用例面）、T2（无 skill 基线跑测）、T3（失败规律清单）
- **依赖 wave**：无
- **策略**：`serial`
- **目标**：建立模块化用例面与无 skill 基线，识别 LLM 失败规律作为反制输入
- **输入**：现有 `cc-assistant/eval/cases.md`、specs/ 34 REQ
- **输出**：模块化 cases.md、基线报告 `changes/cc-assistant-v3/.superpowers/sdd/reports/baseline.md`、失败规律清单
- **完成标准**：T1-T3 验收达成（每场景 WHEN/THEN、基线落盘、规律可映射反制）
- **Review gate**：`ssf execution review --wave wave-1-eval-red --verdict pass|fail`

### Wave 2 — SKILL.md 编排层

- **Wave ID**：wave-2-skill-core
- **任务**：T4（重写 SKILL.md 编排层）、T5（/assist 命令）、T6（安装副本）
- **依赖 wave**：wave-1-eval-red
- **策略**：`serial`
- **目标**：v3 课程编排层 + 命令/安装
- **输入**：T3 失败规律清单、design D2/D13、specs MCO/SFT/RCL
- **输出**：`cc-assistant/SKILL.md`（正文 <200 词）、`~/.claude/commands/assist.md`、`~/.claude/skills/cc-assistant/SKILL.md`
- **完成标准**：T4-T6 验收达成（description SDO、续接 stub、交互模型、安装一致）
- **Review gate**：`ssf execution review --wave wave-2-skill-core --verdict pass|fail`

### Wave 3a — 模块支撑文件（基础）

- **Wave ID**：wave-3a-modules
- **任务**：T7（M0）、T8（core）、T9（memory）、T10（skills）、T11（subagent）、T12（hooks）、T13（mcp）、T14（headless）、T15（sdk）、T16（plugins）、T17（engineering）
- **依赖 wave**：wave-2-skill-core
- **策略**：`parallel`（模块文件相互独立）
- **目标**：M0 + 10 个单机制模块教学内容支撑文件
- **输入**：design D5/D11/D12、specs 各 REQ、`docs/harness-章节总结.md` + `docs/book-harness-summary.md`（设计输入，改写归因）
- **输出**：`cc-assistant/modules/{m0-onboarding,core,memory,skills,subagent,hooks,mcp,headless,sdk,plugins,engineering}.md`
- **完成标准**：T7-T17 验收达成（REQ-MCO/PME/TPT 覆盖、高阶深入小节、降级语义）
- **Review gate**：`ssf execution review --wave wave-3a-modules --verdict pass|fail`

### Wave 3b — 收官整合模块

- **Wave ID**：wave-3b-capstone
- **任务**：T18（capstone.md）
- **依赖 wave**：wave-3a-modules（T18 依赖 T8-T17）
- **策略**：`serial`
- **目标**：收官整合模块（跨模块综合任务+体系讲解改写归因+高阶综合项目分支）
- **输入**：wave-3a 模块、design D8/D11、specs ICN
- **输出**：`cc-assistant/modules/capstone.md`
- **完成标准**：T18 验收达成（REQ-ICN 全部场景、书框架改写归因）
- **Review gate**：`ssf execution review --wave wave-3b-capstone --verdict pass|fail`

### Wave 3c — 全模块交叉核对

- **Wave ID**：wave-3c-verify
- **任务**：T19（全模块交叉核对）
- **依赖 wave**：wave-3a-modules、wave-3b-capstone（T19 依赖 T7-T18）
- **策略**：`serial`
- **目标**：模块文件与 SKILL.md 编排、progress moduleId、phase、REQ-PME/TPT 显式核对
- **输入**：wave-3a/3b 产物
- **输出**：核对结论（无悬空引用、术语统一、REQ-PME-002/004/TPT-001/003 承载）
- **完成标准**：T19 验收达成
- **Review gate**：`ssf execution review --wave wave-3c-verify --verdict pass|fail`

### Wave 4 — 进度续接

- **Wave ID**：wave-4-continuity
- **任务**：T20（progress.json 续接编排指令段）
- **依赖 wave**：wave-2-skill-core（T20 直接依赖 T4）、wave-3c-verify（T19 交叉核对完成）
- **策略**：`serial`
- **目标**：SKILL.md 内 progress 读写/询问/续接编排
- **输入**：design D3/D4/D6、specs SCN
- **输出**：SKILL.md 内续接编排指令段
- **完成标准**：T20 验收达成（REQ-SCN-001~005、D3 编码）
- **Review gate**：`ssf execution review --wave wave-4-continuity --verdict pass|fail`

### Wave 5 — 文档影响面

- **Wave ID**：wave-5-docs
- **任务**：T21（CONTEXT.md）、T22（根 CLAUDE.md）、T23（.gitignore）、T24（cc助手需求.md）
- **依赖 wave**：wave-2-skill-core（T21 依赖 T4）
- **策略**：`serial`
- **目标**：proposal Impact 文档项逐条落实
- **输入**：proposal Impact L59-L63、design D9
- **输出**：CONTEXT.md/CLAUDE.md/.gitignore/cc助手需求.md 更新
- **完成标准**：T21-T24 验收达成（逐条核对，术语统一、指针正确、gitignore 命中）
- **Review gate**：`ssf execution review --wave wave-5-docs --verdict pass|fail`

### Wave 6 — eval GREEN 验证

- **Wave ID**：wave-6-eval-green
- **任务**：T25（有 skill 跑测）、T26（收官综合）、T27（书框架改写抽查）、T28（依赖降级验证）、T29（回归收尾）
- **依赖 wave**：wave-1-eval-red、wave-2-skill-core（T25 直接依赖 T4）、wave-3a/3b/3c、wave-4-continuity、wave-5-docs（T29 含 progress.json 忽略确认，依赖 T23）
- **策略**：`serial`
- **目标**：验证 skill 行为收敛、收官/降级场景通过、回归收尾
- **输入**：wave-1 基线、wave-3 模块、wave-4 续接
- **输出**：eval 全通过、无回归、书框架抽查通过
- **完成标准**：T25-T29 验收达成（对照 T3 失败规律每项反制生效）
- **Review gate**：`ssf execution review --wave wave-6-eval-green --verdict pass|fail`

### Wave 7 — spec 合并与收尾

- **Wave ID**：wave-7-spec-merge
- **任务**：T30（移交 spec-merger 替换/废弃 v2 specs）、T31（全量回归与归档、复选框更新）
- **依赖 wave**：wave-6-eval-green（T30 需 code-reviewer 通过）
- **策略**：`serial`
- **目标**：根 `specs/` 与 v3 对齐、全库旧痕迹清零、归档
- **输入**：wave-6 产物、根 `specs/` 6 份 v2 spec
- **输出**：根 `specs/` 更新、`spec_merged: true`、tasks 复选框全量核对
- **完成标准**：T30-T31 验收达成（v2 遗留 0 项、复选框与实际一致）
- **Review gate**：`ssf execution review --wave wave-7-spec-merge --verdict pass|fail`

## Test Obligations

- **必须先从失败测试开始的行为**：eval RED 基线（wave-1）——无 skill 跑模块课程记录基线违规，再写 skill（GREEN）验证收敛；每任务 TDD 先红后绿。
- **必需的边界情况**：中断→重进→模块级续接；`progress.json` 损坏→按无进度询问；无文件→询问全新/续接；练习依赖缺失→降级记 `degraded`；收官组合 2+ 机制且学习者说出选型理由；书框架改写无原文照抄。
- **回归敏感区域**：SKILL.md 编排次序与模块覆盖（REQ-TPT-001 必修全覆盖）；progress 续接语义（SCN）；练习「同项目串联/不代做/无场景换载体不降级」（PME）；文档影响面（CONTEXT/CLAUDE.md 指针与术语）。

## Execution Mode

- **可用方式与推荐**：`ssf execution recommend changes/cc-assistant-v3 [--wave ...]`（预计推荐 `sdd`——多 wave 含并行模块文件，SDD 子智能体派发适合）
- **用户确认的模式**：待 DP-4 用户 `--confirm`（sdd | inline | batch-inline）
- **推荐理由 / 项目事实**：9 wave（wave-3 拆 3a/3b/3c）、31 任务、wave-3a 模块文件可并行；TDD/eval 密集，SDD 子智能体隔离噪声、并行派发
- **非推荐选择的风险确认**：`--acknowledge-recommendation`（若适用）
- **执行计划命令**：`ssf execution plan changes/cc-assistant-v3 --mode <mode> --confirm --reason <text> --wave <id>:<parallel|serial>:<task,...>`（`--wave` 内联语法以 `ssf execution recommend --help` 实际签名为准；wave 拆分见 Execution Waves——wave-3 拆 3a/3b/3c）
- **允许的修订**：`ssf execution revise changes/cc-assistant-v3 --mode sdd --confirm --reason <text> --wave ...`（仅保留/升级 sdd，先 re-recommend，不允许降级）
- **计划 revision / artifact hash**：待 plan 后由 `execution-plan.json` 记录；artifacts_hash = sha256:6817de7b7dc20fec31acc6925f6d8d72b0d775fb88a530fb6bef042eb8df6d3f

## Verification Dimensions

| 维度 | 状态 | 发现 |
|------|------|------|
| Completeness | Pending | 34 REQ 全覆盖，无未映射 |
| Correctness | Pending | 待执行后 eval 验证 |
| Coherence | Pending | 待 review receipt |

**总体结论**：Pending

## Review Gates

- **强制审查点**：每个 Execution Wave 完成后记录 `ssf execution review` 的 review receipt；wave-2 依赖 wave-1、wave-3a 依赖 wave-2、wave-3b 依赖 wave-3a、wave-3c 依赖 wave-3a+wave-3b、wave-4 依赖 wave-2+wave-3c、wave-5 依赖 wave-2、wave-6 依赖 wave-1/2/3a-3c/4/5、wave-7 依赖 wave-6。
- **阻塞类别**：依赖 wave 未通过、review receipt 为 `fail`/缺失/过期；DP-3 未批准；execution plan 缺失或过期。
- **收口条件**：所有 wave 都有 `pass` review receipt；`spec_merged: true`；全库旧痕迹清零。

## Escalation Rules

- **何时回退到 `specifying`**：scope 变化（proposal Scope 变化）、REQ 变化（specs 需求增删）、关键设计假设错误（design 决策失效）。
- **何时回退到 `bridging`**：contract 与 artifact 漂移（proposal 范围超出 contract 围栏、contract 引用已删能力）；执行计划过期、模式与状态不符、wave 依赖需调整。
- **何时不得继续实现**：DP-3 未批准；execution plan 缺失/过期（full/hotfix）；wave review receipt 未 `pass`；遇到 bug 未按 bug-investigator 4 阶段调查；未提交改动未 commit/备份（安全边界）。

---

自检：契约层 3/3 轮完成——review 无 HIGH，3 MEDIUM + 4 LOW 全部落实并复核无遗留（spec-selfcheck agent 独立执行）；外部一致性+影响面扫描已核对，遗留 0 项；执行期验证维度（Completeness/Correctness/Coherence）Pending，随执行更新
