# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**CC Assistant**（Claude Code 上手引导）是一个 Claude Code Skill + 薄斜杠命令，给有开发经验但不会用 Claude Code 的开发者，以模块化上手引导课程（每模块真实小练习、多会话渐进续接）边做边教，完成从零基础到能独立干活。领域词汇见 `CONTEXT.md`（本仓库唯一术语表，输出时使用其定义、勿漂移到同义词）。当前 v3 需求、规格、设计、任务清单以 spec-superflow change `changes/cc-assistant-v3/` 为准（`.spec-superflow.yaml` 状态机，当前 state `executing`，执行中）。

## Skill 开发规范

编写、修改任何 Claude Code skill（`SKILL.md`）时，先读取 `docs/skill-development-spec.md`，并严格遵守其中的 frontmatter、description、结构、测试与部署规范。

## Commands

无构建 / 传统 lint。交付物是 markdown。

- 测试：`cc-assistant/eval/cases.md` 场景用例，用子智能体模拟「学习者」跑无 skill 基线 vs 有 skill 行为对比（TDD，见 `docs/skill-development-spec.md` §10-11）
- spec-superflow 状态机：`npx --yes --package spec-superflow@0.10.0 ssf <cmd> <change-dir>`
- 本仓库 issue/spec 用 GitHub，走 `gh` CLI（见 `docs/agents/issue-tracker.md`）

## Architecture

交付形态是 **Skill + 薄斜杠命令**（非插件、非编译代码）。上手引导：给有开发经验但不会用 Claude Code 的开发者，以模块化上手引导课程（每模块真实小练习、多会话渐进续接）边做边教，完成从零基础到能独立干活。

- **引擎 = 自然语言编排指令**：模块化课程编排写在 `cc-assistant/SKILL.md`，由 Claude 运行时执行，按「M0 定场+选项目 → 定位进度 → 按固定次序进入模块（概念 → 场景 → 真实轻练习）→ 写进度续接 → 收官整合综合阶段」编排；一次 `/assist` 教 1 个模块，进度存项目级 `.claude/cc-assistant/progress.json`。
- **交叉引用参考层**：参考类内容（CLAUDE.md 模板、最佳实践等）用 `**REQUIRED SUB-SKILL:** claude-code-guide` 交叉引用，`SKILL.md` 不重复写；claude-code-guide 未覆盖的进阶内容（MCP / Plan Mode / Agent 等）按需引用官方 Claude Code 文档（docs.anthropic.com）。
- **TDD 测试**：`cc-assistant/eval/cases.md` 场景用例，用子智能体模拟「学习者」跑无 skill 基线 vs 有 skill 行为对比。
- **全程本地、零上传**：教学尊重学习者对项目的决定权；危险/不可逆操作先征得同意，实际落地由学习者自行决定。
- **安装位置**：用户级 `~/.claude/skills/cc-assistant/`（SKILL.md）+ `~/.claude/commands/assist.md`（`/assist` 入口），保证学习者在任意项目可触发。

## Agent skills

### Issue tracker

Issues and specs for this repo live as GitHub issues, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles map to default label strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
