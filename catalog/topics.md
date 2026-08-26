# 主题标签词表（topics.json）

> 本文件是 `catalog/topics.json` 的人类可读说明。**机器可读唯一源是 `topics.json`**——CI 校验与 catalog 条目的 `topics` 归属一律以 `topics.json` 为准（REQ-CMP-001）。

## 当前主题

| id | 说明 | 对应课程模块 |
|---|---|---|
| `core-workflow` | Claude Code 核心工作流：下指令、审阅改动、核心命令 | 核心 |
| `plan-mode` | 任务规划（Plan Mode）：较大任务先规划再执行 | 核心（按需） |
| `memory` | 记忆系统：CLAUDE.md 与项目级长期上下文 | 记忆系统 |
| `rules` | 规则（Rule）：全局或项目级行为约束 | 记忆系统 |
| `skills` | Skills：可复用流程与斜杠命令的固化 | Skills |
| `subagent` | 子智能体（Agent）：任务委派与上下文隔离 | 子智能体 |
| `hooks` | Hooks：事件驱动的自动化拦截与通知 | Hooks |
| `mcp` | MCP：接入外部数据与工具 | MCP |
| `headless` | Headless 模式：claude -p 非交互自动化 | Headless |
| `sdk` | Agent SDK：用代码构建 Agent 应用 | Agent SDK |
| `plugins` | Plugins：扩展 Claude Code 能力与命令分发 | Plugins |
| `engineering` | 工程化：成本、安全、指令、协作 | 工程化 |
| `project-workflow` | 项目工作流：跨模块综合任务与体系实践 | 收官整合 |

课程模块与主题的映射关系见 `course-mapping.json`（每模块 → 一个或多个主题）。

## 扩充流程

新增一个主题标签：

1. 提 PR 同时修改 `catalog/topics.json`（新增 `{id, description}`，`id` 小写连字符、全表唯一）与 `catalog/topics.md`（表格加一行）。
2. CI `validate` job 校验 `topics.json` 结构合法、无重复 `id`。
3. 维护者按收录判据审核后合入。
4. 需要的话，在 `course-mapping.json` 中把相关模块映射补上该主题（catalog 条目如需标注新主题可随后在各自 PR 补充）。

> 主题只做「发现」维度：不承载课程 phase（进阶/高阶），不承载质量分级（REQ-CMP-005）。
