# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**CC Assistant**（Claude Code 智能效率教练）是一个 Claude Code Skill + 薄斜杠命令，扫描项目环境、识别工作场景、推荐并代劳启用能提升效率的工具（Skill / Rule / Hook）。完整需求见 `cc助手需求.md`；领域词汇见 `CONTEXT.md`（本仓库唯一术语表，输出时使用其定义、勿漂移到同义词）。当前 v1 规格、设计、任务清单以 spec-superflow change `changes/cc-assistant-v1/` 为准（`.spec-superflow.yaml` 状态机，当前 state `specifying`，规划已批准、尚未开始实现）。

## Commands

无构建 / 传统 lint。交付物是 markdown + JSON + 少量 Python。

- 单测（确定性计算脚本）：`cd cc-assistant && python scripts/test_catalog.py`
- JSON 合法性校验：`python -c "import json; json.load(open('data/scenarios.json'))"`
- spec-superflow 状态机：`npx --yes --package spec-superflow@0.10.0 ssf <cmd> <change-dir>`
- 本仓库 issue/spec 用 GitHub，走 `gh` CLI（见 `docs/agents/issue-tracker.md`）

## Architecture

交付形态是 **Skill + 斜杠命令**（非插件、非编译代码）。核心闭环 5 模块：Scanner → Matcher → Recommender → Health Check → Feedback Loop，外加 `/assist apply` 代劳启用。

- **引擎 = 自然语言指令**：Scanner/Matcher/Recommender/Health/Feedback 逻辑写在 `cc-assistant/SKILL.md`，由 Claude 运行时执行。只有确定性计算（两层目录合并、健康度评分）用 Python 脚本 `cc-assistant/scripts/catalog.py`（导出 `merge_catalogs(builtin, custom)`、`score_health(enabled)`）。
- **两层可配置目录**：内置 `data/recommendations.json`（含 `scenarios` 场景映射）+ 自定义 `data/custom-recommendations.json`，运行时按 `id` 合并、自定义覆盖内置。条目 `id` == 安装后的 skill 目录名，Scanner 据此判定"已启用"。
- **数据分层、永不回传**：用户级 `~/.claude/cc-assistant/profile.json`（经验等级、反馈、visitHistory、lastEnabledItems）+ 项目级 `.claude/cc-assistant/project.json`（技术栈、项目意图、已启用）。
- **安装路径 ≠ 源路径**：安装后数据在 `~/.claude/skills/cc-assistant/`、命令在 `~/.claude/commands/`。SKILL.md 用相对于 skill 根目录的路径引用自己的 data 文件，不要写死源仓库路径。
- **双维度引导**：推荐层级由用户经验等级（beginner→expert）× 项目意图（learning / personal / engineering）决定；新手默认只出 1-2 条。

### 关键公式（v1）

- **场景识别**（Matcher，D8）：信号加权（核心 3 / 辅助 2 / 弱 1），达阈值（默认 3）进候选，得分最高者胜；并列按 `testing > bug-fix > new-feature > docs > refactor` 决胜。置信度：≥5 高 / 3-4 中 / <3 低。全场景低于阈值回退 `newbieDefaults`。成熟项目（有 `src/` + `package.json`）不得判为 `init`。
- **健康度**（Health，D9）：基础 20；Skill +5（上限 30）、Rule +3（上限 15）、Hook +3（上限 15）、三类齐全 +5。等级：优秀 ≥65 / 良好 45-64 / 待改进 25-44 / 需关注 <25。v1 目录无 Hook，Hook 与综合加成恒 0，v1 最高 65。报告标注"激励性启发式，非客观基准"，不展示社区对比。
- **反馈关联**：裸 👍/👎 紧跟推荐输出 = 对最近一条推荐。

## Agent skills

### Issue tracker

Issues and specs for this repo live as GitHub issues, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles map to default label strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
