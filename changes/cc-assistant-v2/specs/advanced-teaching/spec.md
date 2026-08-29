# Spec: Advanced Teaching（进阶能力教学）

## ADDED Requirements

### Requirement: REQ-ADV-001 Skill/Rule/Hook 教学
系统 SHALL 按需讲解 Skill / Rule / Hook 的概念与用法（讲解时交叉引用 claude-code-guide）。

#### Scenario: 遇到重复性任务
- **WHEN** 学习者遇到可复用的重复性任务/规范
- **THEN** 系统此时讲解 Skill/Rule 是什么、如何创建或安装，并交叉引用 claude-code-guide

### Requirement: REQ-ADV-002 MCP 教学
系统 SHALL 按需讲解 MCP 是什么、如何添加 server，并说明适用场景（进阶、非必需）。

#### Scenario: 想接入外部工具
- **WHEN** 学习者问能否接入外部数据/工具
- **THEN** 系统讲解 MCP 的概念与适用场景，引用官方文档（claude-code-guide 未覆盖时）

### Requirement: REQ-ADV-003 Plan Mode 教学
系统 SHALL 按需讲解 Plan Mode：何时用、怎么用、与直接执行的区别。

#### Scenario: 任务需先规划
- **WHEN** 任务较大、需要先规划再执行
- **THEN** 系统讲解 Plan Mode 并在该任务上演示

### Requirement: REQ-ADV-004 Agent/子代理 教学
系统 SHALL 按需讲解 Agent/子代理：何时用（独立可并行任务）、怎么用。

#### Scenario: 可并行的独立任务
- **WHEN** 学习者有多个独立可并行的子任务
- **THEN** 系统讲解 Agent/子代理 的概念与适用场景
