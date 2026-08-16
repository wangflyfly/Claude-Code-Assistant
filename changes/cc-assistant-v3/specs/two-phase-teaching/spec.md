# Spec: Two-phase Teaching（两阶段教学）

## ADDED Requirements

### Requirement: REQ-TPT-001 进阶阶段必修主线
系统 MUST 提供进阶阶段作为必修主线，覆盖全部 11 个课程模块，每模块为「概念+场景+轻练习」的广度教学。

#### Scenario: 进阶阶段覆盖全部模块
- **WHEN** 学习者处于进阶阶段（phase=进阶）
- **THEN** 课程覆盖核心~收官整合全部 11 个模块，每模块以广度方式教学（概念、场景、轻练习），不留未覆盖模块

#### Scenario: 进阶为必修
- **WHEN** 学习者完成所有进阶模块前主动提出跳过某模块
- **THEN** 系统提示该模块属进阶必修主线，征询其确认后再决定是否暂缓（不静默跳过必修内容）

### Requirement: REQ-TPT-002 高阶阶段可选深度
系统 MUST 提供高阶阶段（可选进入）对重点模块（Agent SDK / Plugins / 工程化）进行深入实操，并含一个综合项目；高阶不强制。

#### Scenario: 进入高阶阶段
- **WHEN** 学习者完成进阶阶段且选择进入高阶阶段
- **THEN** 系统对 Agent SDK / Plugins / 工程化三个重点模块做深入实操教学，并引导完成一个综合项目

#### Scenario: 不进高阶不惩罚
- **WHEN** 学习者完成进阶阶段后选择不进入高阶
- **THEN** 系统正常收尾，不将高阶未完成视为未达标

### Requirement: REQ-TPT-003 两阶段以 phase 区分
系统 MUST 用 `phase` 字段区分进阶/高阶两个阶段，进度记录分别跟踪。

#### Scenario: 进度按阶段记录
- **WHEN** 学习者进入高阶阶段
- **THEN** 系统在 `progress.json` 中切换/记录 `phase=高阶`，与进阶阶段进度分开跟踪（高阶复用同模块号但以 phase 区分）
