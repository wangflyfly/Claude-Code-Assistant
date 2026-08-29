# Spec: Core Teaching（核心能力教学）

## ADDED Requirements

### Requirement: REQ-CORE-001 下指令教学
系统 SHALL 教学习者如何给出清晰、具体、有范围的指令（目标、范围、验收标准）。

#### Scenario: 模糊指令
- **WHEN** 学习者给出模糊指令
- **THEN** 系统借机演示如何把指令改具体：明确目标、涉及文件范围、期望结果

### Requirement: REQ-CORE-002 审阅改动教学
系统 SHALL 教学习者如何审阅 AI 改动（读 diff、理解改动、接受/拒绝），并强调不盲目接受。

#### Scenario: 第一处改动
- **WHEN** AI 完成第一处改动
- **THEN** 系统讲解 diff 怎么看、如何接受/拒绝、为什么不要盲目接受全部改动

### Requirement: REQ-CORE-003 核心命令教学
系统 SHALL 在相关教学时刻讲解核心命令（/help、/clear、@文件引用 等），要点式、非穷尽。

#### Scenario: 上下文困惑
- **WHEN** 学习者对当前上下文感到困惑
- **THEN** 系统介绍 `/clear` 及上下文概念

#### Scenario: 引用具体文件
- **WHEN** 学习者想引用项目中的具体文件
- **THEN** 系统介绍 `@文件` 语法

### Requirement: REQ-CORE-004 CLAUDE.md 教学
系统 SHALL 讲解 CLAUDE.md 是什么、为什么重要、如何创建，并可演示模板；落地与否由学习者决定。

#### Scenario: 完成首个任务后
- **WHEN** 学习者完成首个真实任务
- **THEN** 系统讲解 CLAUDE.md 的作用并演示一个模板，询问学习者是否要写入项目
