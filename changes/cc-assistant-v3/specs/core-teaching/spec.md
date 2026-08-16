# Spec: Core Teaching（核心能力教学，继承 v2）

## ADDED Requirements

### Requirement: REQ-COR-001 下指令教学
系统 MUST 在「核心」模块教学下指令：让学习者第一次给指令或遇到模糊指令时，演示如何改具体——明确目标、涉及文件范围、验收标准。

#### Scenario: 首次下指令
- **WHEN** 学习者第一次给 Claude 下指令或指令模糊
- **THEN** 系统演示如何把指令改具体（目标、文件范围、验收标准），并让学习者实践一次

### Requirement: REQ-COR-002 审阅改动教学
系统 MUST 在「核心」模块教学审阅改动：学习者第一次看到 AI 的 diff 时，讲解如何看 diff、如何接受/拒绝、为何不盲目接受全部改动。

#### Scenario: 首次看到 AI diff
- **WHEN** 学习者第一次看到 AI 产生的改动
- **THEN** 系统讲解如何审阅 diff、按需接受/拒绝单处改动，并强调不盲目全量接受

### Requirement: REQ-COR-003 核心命令教学
系统 MUST 在「核心」模块按教学时刻要点式讲解核心命令（`/help`、`/clear`、`@文件`），非穷尽、不用一次讲全。

#### Scenario: 需要帮助时讲 /help
- **WHEN** 学习者对某命令或功能困惑
- **THEN** 系统在该时刻讲解 `/help` 的用途

#### Scenario: 上下文困惑时讲 /clear 与上下文
- **WHEN** 学习者表达对话上下文混乱
- **THEN** 系统在该时刻讲 `/clear` 及上下文概念

#### Scenario: 需引用文件时讲 @文件
- **WHEN** 学习者需要让 Claude 引用具体文件
- **THEN** 系统在该时刻讲解 `@文件` 语法

### Requirement: REQ-COR-004 CLAUDE.md 教学
系统 MUST 在「核心」模块教学 CLAUDE.md：完成首个任务后讲其作用并演示一个模板；是否写入项目由学习者决定。

#### Scenario: 完成首个任务后讲 CLAUDE.md
- **WHEN** 学习者完成首个真实任务
- **THEN** 系统讲解 CLAUDE.md 的作用并演示一个模板，写入与否由学习者决定

### Requirement: REQ-COR-005 Plan Mode 按需
系统 MUST 在任务较大需先规划时，将 Plan Mode 作为「核心」模块内的按需教学点讲解（何时用、怎么用、与直接执行的区别），不单列模块。

#### Scenario: 任务较大需规划
- **WHEN** 学习者面对较大、需先规划的真实任务
- **THEN** 系统在核心模块内按需讲 Plan Mode（何时用/怎么用/与直接执行的区别）并在该任务演示

#### Scenario: 普通任务不引入 Plan Mode
- **WHEN** 当前任务较小、无需先规划
- **THEN** 系统不强行讲解 Plan Mode，避免预灌
