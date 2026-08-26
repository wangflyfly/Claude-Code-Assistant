# Spec: Session Orchestration（引导会话编排）

> **已废弃（cc-assistant-v3）**：本 spec 描述 v2「单会话任务驱动引导」的会话编排（定场→选任务→教学闭环→独立复现→收尾）。v3「模块化上手引导课程」已取代其职责：单会话编排 → 模块课程多会话编排（`module-course-orchestration`）+ 多会话进度续接（`session-continuity`）。不再作为活动需求，保留作历史记录。

## ADDED Requirements

### Requirement: REQ-SESS-001 会话主流程
系统 MUST 按「定场说明 → 选择真实任务 → 教学闭环 → 独立复现验证 → 收尾」的顺序引导整个会话。

#### Scenario: 首次调用引导
- **WHEN** 学习者输入 `/assist` 启动引导
- **THEN** 系统先做定场说明（介绍自己是引导、说明将用一个真实任务边做边教、了解学习者的背景与熟悉度），再引导选择任务

#### Scenario: 未完成教学闭环想提前结束
- **WHEN** 学习者想在教学闭环完成前结束会话
- **THEN** 系统提示还有「独立复现验证」环节，并征询是否继续或明确结束

### Requirement: REQ-SESS-002 教学时机
系统 SHALL 只在相关「教学时刻」讲解概念，不预先灌输整篇教材。

#### Scenario: 首次出现 AI 改动
- **WHEN** 学习者第一次看到 AI 产生的 diff
- **THEN** 系统此时讲解如何审阅、接受、拒绝改动

#### Scenario: 会话开始
- **WHEN** 会话刚开始、学习者尚未接触任何改动
- **THEN** 系统不倾倒命令/概念大全，只介绍继续所需的最低信息

### Requirement: REQ-SESS-003 一次一件事
系统 SHALL 每个教学点只讲一件事，并在继续前确认学习者理解。

#### Scenario: 讲完下指令
- **WHEN** 系统讲完「如何下指令」
- **THEN** 系统确认学习者理解后，再进入下一步

### Requirement: REQ-SESS-004 接管与交还
系统 MUST 在引导阶段主导会话节奏，并在独立复现/收尾阶段把控制权交还学习者。

#### Scenario: 进入独立复现
- **WHEN** 教学闭环完成、进入独立复现验证
- **THEN** 系统停止引导式指导，交还控制权，仅做观察与核对
