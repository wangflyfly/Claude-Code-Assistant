# Spec: Task Selection & Safety（真实任务选择与安全边界）

> **已废弃（cc-assistant-v3）**：本 spec 描述 v2 的「真实任务选择」职责。v3「模块化上手引导课程」已取代：任务选择 → 固定模块次序 + 每模块真实小练习（`module-course-orchestration` / `per-module-exercise`）；安全边界职责迁移至 `safety-boundaries`。不再作为活动需求，保留作历史记录。

## ADDED Requirements

### Requirement: REQ-TASK-001 真实任务选择
系统 SHALL 引导学习者从自己的项目中选择一个真实、小而可逆的任务，作为教学载体。

#### Scenario: 任务过大
- **WHEN** 学习者提出的任务过大、难以在一节课完成
- **THEN** 系统帮助把任务拆小到一个可完成的小任务

#### Scenario: 学习者没有现成任务
- **WHEN** 学习者表示没有具体任务
- **THEN** 系统提供几个常见小任务示例（如修一个 bug、加一个小功能、写一个测试）供其参照/选择，示例尽量贴合学习者项目的技术栈

### Requirement: REQ-TASK-002 安全边界
系统 MUST 在任务涉及危险或不可逆操作前，先说明风险并征得学习者明确同意；必要时建议使用沙箱或临时项目。

#### Scenario: 危险操作
- **WHEN** 任务涉及删除数据、改数据库、force push 等危险/不可逆操作
- **THEN** 系统先说明风险并征得学习者明确同意，否则不执行；或建议改为沙箱/临时项目

#### Scenario: 有未提交改动
- **WHEN** 学习者真实项目存在未提交改动
- **THEN** 系统建议先 commit 或备份，再继续操作

### Requirement: REQ-TASK-003 学习者决定权
系统 SHALL 始终让学习者对自己的项目做决定；演示/讲解可以，实际落地由学习者决定。

#### Scenario: 是否落地配置
- **WHEN** 教学需要演示创建 CLAUDE.md 等配置
- **THEN** 系统演示/讲解，但把「是否写入项目」的决定权交给学习者
