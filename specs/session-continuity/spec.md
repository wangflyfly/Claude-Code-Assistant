# Spec: Session Continuity（多会话进度续接）

## ADDED Requirements

### Requirement: REQ-SCN-001 progress.json 最小结构
系统 MUST 使用项目级 `.claude/cc-assistant/progress.json` 记录学习进度，最小结构为 `{phase, completedModules[], currentModule, updatedAt}`。

#### Scenario: 进度文件存在且合法
- **WHEN** 学习者再次输入 `/assist` 且 `progress.json` 存在
- **THEN** 系统读取该文件，识别 `currentModule` 与 `phase`，从模块级上次进度续接教学（模块内中断的 checkpoint 是否引入，在 design 阶段明确）

#### Scenario: 进度文件损坏或结构非法
- **WHEN** `progress.json` 无法解析或字段缺失
- **THEN** 系统按无进度处理，询问学习者定位，而不是静默出错

### Requirement: REQ-SCN-002 completedModules 语义
系统 MUST 让 `completedModules[]` 记录 `(phase, moduleId)` 对；高阶深度复用同模块号、以 phase 区分，避免跨阶段重复计数。

#### Scenario: 高阶重访重点模块
- **WHEN** 学习者在高阶阶段完成某重点模块的深入实操
- **THEN** 该完成记录以 `(高阶, <模块号>)` 形式追加，与进阶阶段同模块的 `(进阶, <模块号>)` 区分并存

#### Scenario: 判断某模块是否已完成
- **WHEN** 系统判断当前会话该教哪个模块
- **THEN** 依据 `completedModules[]` 中对应 phase 的模块号判断，已完成（当前 phase）的不重复从头教

### Requirement: REQ-SCN-003 进度读写时机
系统 MUST 在模块完成时写入/更新 `progress.json`，并在每次会话开始读取当前进度。

#### Scenario: 模块完成写进度
- **WHEN** 当前模块的教学与练习完成
- **THEN** 系统将当前模块加入 `completedModules[]`（对应 phase），更新 `currentModule` 为下一模块、`updatedAt` 为当前时间

#### Scenario: 会话中断
- **WHEN** 会话在模块中途被中断（学习者退出）
- **THEN** 已完成的模块进度已落盘，未完成模块的 `currentModule` 保持该模块、不标记完成

### Requirement: REQ-SCN-004 无进度文件时询问定位
系统 MUST 在 `progress.json` 不存在时询问学习者，而不是凭空假设其进度。

#### Scenario: 首次进入无进度文件
- **WHEN** 学习者输入 `/assist` 且 `progress.json` 不存在（已完成 M0 定场与选项目）
- **THEN** 系统询问是「全新开始课程」还是「此前学过后想从某模块继续」，据此初始化或定位进度（与 REQ-MCO-001 首次进入流程一致）

### Requirement: REQ-SCN-005 中断后续接
系统 MUST 在中断会话后、再次输入 `/assist` 时接上上次进度（读 `progress.json` 或按询问结果定位）。

#### Scenario: 中断后重新进入
- **WHEN** 学习者中断后再次输入 `/assist`
- **THEN** 系统从 `progress.json` 记录的 `currentModule` 继续教学，不重讲已完成模块

### Requirement: REQ-SCN-006 个人进度不进共享
系统 MUST 确保 `.claude/cc-assistant/progress.json`（个人学习进度）默认被 `.gitignore` 忽略、不进版本共享。

#### Scenario: 检查 gitignore
- **WHEN** 审查仓库 `.gitignore`
- **THEN** `progress.json` 所在路径被忽略，个人进度不会随项目提交共享
