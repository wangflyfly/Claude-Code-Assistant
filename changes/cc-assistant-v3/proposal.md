# Proposal: CC Assistant v3（模块化上手引导课程）

## Why

v2 的「任务驱动·单次会话」只能让学习者在一个真实任务里浅尝核心能力与按需进阶，无法系统掌握 Claude Code 的 Harness 能力（记忆系统 / Skills / 子智能体 / Hooks / MCP / Headless / Agent SDK / Plugins）。学习者需要一套**按功能模块组织的课程**：每个模块讲透一个机制、配真实小练习，多会话渐进续接，最后把进阶整合成体系。官方文档与 claude-code-guide 是参考手册而非上手引导，缺引导、缺节奏、缺「学到即用到」的真实练习载体。

## What Changes

把 `cc-assistant` 从 v2 的「任务驱动·单会话引导」改为「**模块化课程·多会话渐进**」：

- **课程编排**（`SKILL.md` 重写）：M0 定场+选项目（课前准备）→ **11 个课程模块**：核心模块 → 记忆系统 → Skills → 子智能体 → Hooks → MCP → Headless → Agent SDK → Plugins → 工程化 → 收官整合。
- **两阶段教学**：进阶阶段覆盖全部模块（概念+场景+轻练习，广度）；高阶阶段对重点模块（Agent SDK / Plugins / 工程化）深入实操、综合项目（深度，可选进入）。
- **多会话渐进续接**：一次 `/assist` 教 1 个单机制模块（核心~工程化，10 个）并引导续接；收官整合为第 11 模块但按「多会话综合阶段」可拆多次 `/assist` 完成；项目级 `.claude/cc-assistant/progress.json`（最小结构 `{phase, completedModules[], currentModule, updatedAt}`；`completedModules` 记录 `(phase, moduleId)` 对，高阶深度复用同模块号、以 phase 区分，个人进度默认 gitignore 不进共享）读写 + 无文件时询问，中断后能接上进度（模块内中断的 checkpoint 粒度在 design 阶段明确）。
- **每模块真实小练习**：每个模块在学习者自己项目里带一个该模块场景的真实小练习（如 Hooks 模块配置一个拦截 Hook），模块间用同一项目串联，继承 v2「学到即用到」价值。
- **收官整合**：跨模块综合真实任务（组合 2+ 机制）+ 按「书框架复用边界」改写为自有表达并归因后的四层架构/触发口诀/关注点分离/选型决策树体系讲解，把进阶讲成体系。
- **继承 v2**：核心教学内容（下指令/审阅改动/核心命令/CLAUDE.md，Plan Mode 在任务较大需先规划时并入核心模块按需讲）、安全边界（真实任务小而可逆/危险操作先征得同意/未提交改动先 commit 或备份/必要时建议沙箱项目/学习者决定权）、参考层交叉引用（`**REQUIRED SUB-SKILL:** claude-code-guide` + claude-code-guide 未覆盖的参考内容如 Plan Mode 官方用法引用 docs.anthropic.com）、安装位置（用户级 `~/.claude/skills/cc-assistant/` + `/assist`）。
- **内容素材**：`docs/harness-章节总结.md`（模块教学内容素材）+ `docs/book-harness-summary.md`（课程体系设计参考）作设计输入；skill 交付物不内联书版权内容，参考内容走 claude-code-guide / 官方文档。
- **书框架复用边界**：书原创框架（四层架构/触发口诀/关注点分离/选型决策树）如作为收官整合的教学骨架复用，须**改写为自有表达并归因来源**——收官整合模块取此「改写交付」分支（见 What Changes「收官整合」）；**仅作内部设计输入不出现在交付物**分支只适用于不进入交付物的其余书素材；skill 交付物不内联书原文表述（判定标准：不整段照抄、不保留原章节结构/句式，改写成课程自有讲解）。
- **支撑文件**：模块教学内容按 skill-development-spec 拆分到支撑文件，`SKILL.md` 保持编排层精简。

## Scope

### In

- Skill 本体（`SKILL.md` 课程编排，精简）+ `/assist` 命令 + 支撑文件（模块教学内容拆分）
- M0 定场+选项目（课前准备）+ **11 个课程模块**：核心模块（下指令·审阅·核心命令·CLAUDE.md·Plan Mode 按需）/ 记忆系统（CLAUDE.md 五层记忆，含 Rule 规则级 `.claude/rules/`）/ Skills / 子智能体 / Hooks / MCP / Headless / Agent SDK / Plugins / 工程化（成本·安全·指令·协作）/ 收官整合
- 两阶段教学：进阶阶段（必修主线，广度——11 个模块含收官整合，每模块概念+场景+轻练习）→ 高阶阶段（可选，深度——重点模块 = Agent SDK / Plugins / 工程化 深入实操 + 一个更大综合项目）。**收官整合为进阶阶段必修的第 11 模块**（跨模块综合真实任务 + 体系讲解）；高阶阶段的综合项目是可选的深化延伸，非进阶必修。
- 多会话渐进续接：一次 `/assist` 教 1 个单机制模块（核心~工程化，10 个）；收官整合按「多会话综合阶段」可拆多次完成；项目级 `.claude/cc-assistant/progress.json`（`completedModules` 记录 `(phase, moduleId)`，高阶深度复用同模块号、以 phase 区分）读写 + 无文件时询问
- 每模块真实小练习：模块在学习者项目内带真实小练习，模块间用同一项目串联
- 收官整合：跨模块综合真实任务 + 按「书框架复用边界」改写后的四层架构/触发口诀/关注点分离/选型决策树体系讲解
- 参考层交叉引用：`**REQUIRED SUB-SKILL:** claude-code-guide`；claude-code-guide 未覆盖的参考内容（如 Plan Mode 官方用法）引用官方文档 docs.anthropic.com
- 继承 v2：核心教学内容、安全边界（真实任务小而可逆/危险操作先征得同意/未提交改动先 commit 或备份/必要时建议沙箱项目/学习者决定权）、安装位置
- 首次拉起入口：`/assist`；skill 接管会话
- 遵守 `docs/skill-development-spec.md`（description "Use when"、token 精简、TDD 开发）

### Out

- 不教编程本身（目标用户已会开发）
- 不覆盖其他 AI 工具（Copilot / Cursor 等）
- 非穷尽式命令手册（参考层 claude-code-guide / 官方文档负责）
- 不代劳「落地」配置：演示/讲解可以，实际落地由学习者自行决定
- 不内联书版权内容原文表述（`docs/harness-章节总结.md` / `docs/book-harness-summary.md`）；书原创框架如复用须按「书框架复用边界」改写为自有表达并归因，或仅作内部设计输入不出现在交付物
- Plan Mode 不单列模块，退化为核心模块内的按需教学点 + 参考层（claude-code-guide / 官方文档）
- 高阶阶段不强制（可选进入；进阶阶段为必修主线）
- v1 效率教练（扫描/推荐/健康度/反馈）与 v2 单会话形态不再保留

## Success Criteria

- 进阶阶段：学习者跨多次会话走完 11 个课程模块；对每个模块能说出「是什么/何时用」并完成该模块真实轻练习。
- 收官整合：学习者能独立组合 2+ 机制完成一个跨模块真实任务，并说出选型理由。
- 高阶阶段（如进入）：学习者能对重点模块（Agent SDK / Plugins / 工程化）独立深入实操。
- 进度续接：中断会话后重输 `/assist` 能接上上次进度（读 progress.json 或询问定位）。
- 参考层继承：讲解参考类概念时走 claude-code-guide / 官方文档交叉引用，SKILL.md 不重复复制参考内容。

## Impact

- 重写源 `cc-assistant/SKILL.md`（v2 版本替换为 v3 课程编排）+ 安装到用户级 `~/.claude/skills/cc-assistant/SKILL.md`（与源保持同步）
- 新增支撑文件（模块教学内容拆分，遵循 skill-development-spec 拆分形态）；`/assist` 命令沿用
- 更新 `CONTEXT.md`：CC Assistant 定义改写为「模块化上手引导课程（多会话渐进）」，同步「用真实任务边做边教」为「每模块真实小练习·模块课程」；术语逐条去留——「引导会话」（单会话流程）→「模块课程·多会话渐进」、「教学时机 just-in-time」保留并扩展为「每模块按需讲解、不做课程式预灌」、「独立复现」从「单任务独立复现」扩展为「每模块真实小练习独立完成 + 收官整合综合任务」、「进阶能力（Skill/Rule/Hook、MCP、Plan Mode、Agent/子代理）」→「Agent/子智能体」（术语统一为「子智能体」）并映射 v3 模块清单（Rule 折入记忆系统）、MCP 条目同步、新增 Headless/Agent SDK/Plugins 术语
- 更新根 `CLAUDE.md`：Project 段（第 7 行）change 目录指针 `changes/cc-assistant-v2/` → `changes/cc-assistant-v3/`；Architecture 段（v2 任务驱动引擎描述）重写为模块化课程
- `specs/` 下 6 份 v2 主 spec（session-orchestration / task-selection / core-teaching / advanced-teaching / reference-crosslink / independent-reproduction）随 v3 spec 合并时替换/废弃为 v3 模块化 spec（见 spec-merger，勿与 v1 已清理产物混淆）
- `cc助手需求.md`（已废弃归档）顶部「以 v2 为准」指针更新为 v3 或整体标注
- `.gitignore`：清理 v1 残留 `.claude/cc-assistant/project.json` 条目（第 29 行，同目录），并确保 `progress.json` 同样被忽略（个人进度不进共享）
- 两份书总结（`docs/harness-章节总结.md`、`docs/book-harness-summary.md`）作设计输入留存仓库，不随 skill 分发
- 三处 `.superpowers/sdd/*` 均为历史归档、不随 v3 更新：根 `.superpowers/sdd/`（`progress.md` + `reports/` + `reviews/`，v2 SDD 产物）、`changes/cc-assistant-v1/.superpowers/sdd/`（v1 产物，标 v1）、`changes/cc-assistant-v2/.superpowers/sdd/`（v2 产物，标 v2）；不清理派生数据
- 开发自测：按 skill-development-spec 的 TDD——重构 `cc-assistant/eval/cases.md` 为模块化用例面（每模块概念+轻练习场景、多会话进度续接场景、收官综合场景），用子智能体模拟「学习者」跑模块课程，无 skill 基线 vs 有 skill 行为对比

## Capabilities

- 模块化课程编排（Module-based Course Orchestration）
- 多会话进度续接（Progressive Session Continuity）
- 每模块真实小练习（Per-module Real Exercise）
- 两阶段教学（Two-phase Teaching：进阶广度 / 高阶深度）
- 收官整合（Advanced Integration & Holistic System）
- 参考层交叉引用（Reference Cross-linking）
- 安全边界（Safety Boundaries）
- 核心能力教学（Core Teaching，继承 v2）

## 待定项（design/tasks 阶段明确，不阻塞本 proposal）

- 成功标准→eval 用例的可判定映射（解决「能说出/能组合 2+ 机制」等主观可测性）
- 「按需」教学时刻的触发判据（Plan Mode 按需 / 每模块按需讲解，防过度预灌）
- 模块教学内容相对 skill-development-spec 拆分形态（§2 何时拆）的映射

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
