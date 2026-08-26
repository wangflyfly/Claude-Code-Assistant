# Spec: Course Mapping（主题标签与课程映射）

## ADDED Requirements

### Requirement: REQ-CMP-001 独立主题词表机器可读
系统 SHALL 以 `catalog/topics.json` 为唯一机器可读的主题词表（每个主题含 `id` 与 `description`），`catalog/topics.md` 仅作人类可读说明与扩充流程文档，不作为校验来源。

#### Scenario: 词表唯一源
- **WHEN** 校验 catalog 条目的 `topics` 值
- **THEN** 判定基准是 `topics.json`（而非 `topics.md`），词表外标签一律失败

### Requirement: REQ-CMP-002 课程映射文件
系统 SHALL 提供 `catalog/course-mapping.json`，把 v3 课程模块（`core` ~ `capstone` 共 11 个，不含 `m0-onboarding`）各映射到 `topics.json` 中的一个或多个主题标签。

#### Scenario: 每模块映射非空
- **WHEN** 校验 `course-mapping.json`
- **THEN** 每个 11 模块键都映射到非空的主题标签子集，且标签 ∈ `topics.json`

### Requirement: REQ-CMP-003 catalog 与课程结构解耦
系统 MUST 让 catalog 条目不存任何课程字段（模块 ID / 阶段），课程归属完全由 `course-mapping.json`（模块 → 主题）推导，使「课程改模块只改映射、catalog 条目不动」成立。

#### Scenario: 课程模块改名不影响 catalog
- **WHEN** v3 课程把一个模块改名（如 `hooks` → `hook-integration`）
- **THEN** 只需更新 `course-mapping.json` 的对应键；`catalog.json` 条目无需任何改动，网页与快照由 CI 重新生成后仍正确

### Requirement: REQ-CMP-004 映射键与课程模块一致性
系统 SHALL 在 CI 校验 `course-mapping.json` 的模块键与 `cc-assistant/modules/` 下的课程模块文件名（剔除 `m0-onboarding`）一致。

#### Scenario: 键不一致被拦
- **WHEN** 课程新增/删除/改名模块，但 `course-mapping.json` 未同步
- **THEN** CI 校验失败，提示「映射键与课程模块清单不一致」，要求先更新映射

### Requirement: REQ-CMP-005 映射不做 phase 粒度
系统 SHALL 让课程映射只到模块级，不区分进阶/高阶 phase；同一模块的高阶深化所需 skill 由课程侧自行消化，不要求目录按 phase 打标。

#### Scenario: 目录无 phase 字段
- **WHEN** 审查 catalog 条目与 course-mapping.json
- **THEN** 二者均不含 phase（进阶/高阶）维度，模块与主题映射为唯一课程关联
