# Proposal: CC Assistant v2（上手引导）

## Why

有开发经验的开发者第一次接触 Claude Code 时会无从下手：不知道它怎么工作、怎么下指令、怎么审阅 AI 的改动、有哪些能力（Skill/Rule/Hook、MCP、Plan Mode、Agent）以及什么时候该用。官方文档是参考手册，不是上手引导——信息全但无引导、无节奏。需要一个交互式引导 skill，带他们用自己项目的真实任务边做边学，完成从「零基础」到「能独立干活」的跨越。

## What Changes

把 `cc-assistant` 从 v1 的「效率教练」（扫描环境→推荐工具→健康度→反馈）彻底改为「上手引导」：

- **引导会话编排**（`SKILL.md`）：任务驱动·边做边教。启动后按流程走：定场说明 → 选一个真实小任务 → 下指令教学 → 看 AI 执行 → 审阅/接受/拒绝改动教学 → 迭代 → 核心命令与 CLAUDE.md 在「教学时刻」讲 → 进阶能力按需补 → 独立复现验证 → 收尾。
- **交叉引用参考层**：讲解概念时用 `**REQUIRED SUB-SKILL:** claude-code-guide` 取参考内容（CLAUDE.md 模板、最佳实践等）；`SKILL.md` 不重复写参考材料。
- **进阶能力覆盖**：Skill / Rule / Hook、MCP、Plan Mode、Agent/子代理——claude-code-guide 未覆盖的部分在编排中按需补充讲解。
- **命令重构**：保留 `/assist` 作为引导会话入口；废弃 v1 的 `/assist health`、`/assist apply`、`/feedback`。
- **清理 v1 产物**：移除不再需要的 `data/`（recommendations.json、custom-recommendations.json；安装副本另有 scenarios.json，随项目级 skill 一并删除）与 `scripts/`（catalog.py、test_catalog.py）。

## Scope

### In

- Skill 本体（`SKILL.md`，编排指令，精简）+ `/assist` 命令
- 引导会话全流程：定场 → 选任务 → 教学 → 独立复现验证 → 收尾
- 核心能力教学：下指令、审阅/接受/拒绝改动、核心命令、CLAUDE.md
- 进阶能力教学：Skill/Rule/Hook、MCP、Plan Mode、Agent/子代理（按需、不预先灌输）
- 交叉引用 `claude-code-guide`（`REQUIRED SUB-SKILL`）
- 独立复现验证（成功标准：引导后学习者独立完成小任务）
- 安全边界：真实任务需小而可逆；危险操作先征得同意；必要时建议沙箱项目
- 首次拉起入口：学习者运行 `claude` 后输入 `/assist`；skill 接管会话
- 安装位置：用户级 `~/.claude/skills/cc-assistant/` + `~/.claude/commands/assist.md`，保证学习者在任意项目可触发 `/assist`
- 进阶内容来源：claude-code-guide 未覆盖的部分（MCP/Plan Mode/Agent 等）按需交叉引用官方 Claude Code 文档（docs.anthropic.com）
- 遵守 `docs/skill-development-spec.md`（description "Use when"、token 精简、TDD 开发）

### Out

- v1 的扫描/场景识别/推荐/健康度/反馈逻辑及其数据、脚本
- 不教编程本身（目标用户已会开发）
- 不覆盖其他 AI 工具（Copilot / Cursor 等）
- 非穷尽式命令手册（官方文档已覆盖，引导要点式教学）
- 不代劳「落地」配置：演示/讲解可以（如展示如何创建 CLAUDE.md），实际落地（创建文件/安装）由学习者自行决定

## Success Criteria

- 引导会话中，学习者用自己项目的真实任务走通一遍完整闭环：下指令 → 看 AI 执行 → 审阅/接受/拒绝改动 → 迭代。
- 引导结束前，学习者**不靠引导、独立完成一个小任务**（修 bug / 加功能）能跑通；该小任务的验收标准在学习者选任务时先由学习者定义，引导结束时按该标准判定通过/回退。
- 进阶能力（Skill/Rule/Hook、MCP、Plan Mode、Agent/子代理）在会话中按需体验/讲解到位，不预先灌输。

## Impact

- 建立源 `cc-assistant/SKILL.md`（v1 已完整实现并归档于 worktree 与项目级安装，主树源目录仅残留 data/、无 SKILL.md；v2 在源新建）+ 安装到用户级 `~/.claude/skills/cc-assistant/SKILL.md`（安装层级由 v1 的项目级改回用户级——v1 时为满足项目内开发、用户要求覆盖契约默认；v2 改用户级以支持任意项目触发 `/assist`；根 `CLAUDE.md` 第 29 行声称安装于 `~/.claude/skills/` 的旧描述需一并修正）
- 新建 `/assist` 命令（`~/.claude/commands/assist.md`；v1 的项目级 `assist.md` 随清理删除，且其删除必须先于/同步于用户级安装，避免同名遮蔽）
- 清理 v1 遗留产物：删除项目级 `.claude/skills/cc-assistant/`（SKILL.md + data/ + scripts/）、`.claude/commands/` 下 `assist.md`、`assist-apply.md`、`assist-health.md`、`feedback.md`、v1 阶段守卫 `.claude/always/phase-guard.md`（含「cc-assistant-v1 / approved-for-build」，v2 规划期已删除，此处记录在案），及 v1 运行时数据 `~/.claude/cc-assistant/profile.json`、`.claude/cc-assistant/project.json`（残留空目录一并清理）
- 删除源仓库 v1 残留：`cc-assistant/data/`（recommendations.json、custom-recommendations.json）与 v1 源 `scripts/`（如存在残留）
- 新增支撑文件（如需）：会话脚本/参考，遵循 skill-development-spec 的拆分形态
- 更新 `CONTEXT.md` 与仓库根 `CLAUDE.md`：CC Assistant 定义改为「上手引导」；根 CLAUDE.md 的 Architecture（Scanner/Matcher/Recommender/Health/Feedback）、Commands（`python scripts/test_catalog.py`、`json.load(open('data/scenarios.json'))` 校验）、关键公式（v1）等 v1 实现段落重写或删除；标注/移除 v1 专属术语（推荐项、场景、目录、健康度）；MCP 语义同步更新（v1「安装类推荐项」→ v2「进阶教学主题」）
- 更新/废弃 `cc助手需求.md`（26KB 需求规格说明书，v1.1 效率教练版）：改写为「上手引导」版需求，或显式标注「v1 效率教练需求已废弃、以 v2 change 为准」
- 清理/标注根 `specs/` 下 v1 合并产物（scanner/matcher/recommender/health-check/feedback-loop/apply 共 6 份 spec）；v2 spec 合并时替换为新 6 能力
- 开发自测：按 skill-development-spec 的 TDD（RED-GREEN-REFACTOR）——用子代理模拟「学习者」跑引导场景，无 skill 基线 vs 有 skill 行为对比

## Capabilities

- 引导会话编排（Session Orchestration）
- 真实任务选择与安全边界（Task Selection & Safety）
- 核心能力教学（Core Teaching）
- 进阶能力教学（Advanced Teaching）
- 参考层交叉引用（Reference Cross-linking）
- 独立复现验证（Independent Reproduction）

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对（spec-selfcheck 独立复核 2 轮，8 项遗留已收口：H1/H2/M1-M6；含 v1 实际安装=项目级已更正、MCP 语义翻转、phase-guard 删除记录、/assist 删除先于安装时序），遗留 0 项
