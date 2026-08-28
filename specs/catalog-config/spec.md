# Spec: Catalog Config（目录配置）

## ADDED Requirements

### Requirement: REQ-CAT-001 集中式 catalog 唯一事实源
系统 MUST 将 `catalog/catalog.json` 作为社区 Skill 目录的唯一事实源：网页展示数据、课程快照、CI 校验均以该文件为准，不引入第二份人工维护的目录数据。

#### Scenario: 网页数据来源于 catalog
- **WHEN** 任何工具或流程需要目录数据
- **THEN** 其来源只能是 `catalog/catalog.json`（或其机器生成副本），不得有独立于 catalog 的二次人工录入

### Requirement: REQ-CAT-002 skill 条目字段结构
系统 MUST 让 `catalog.json` 的每条 skill 记录包含字段 `id` / `name` / `description` / `author` / `install` / `repo` / `license` / `topics`，且满足字段约束。

#### Scenario: 字段齐全且合法
- **WHEN** 校验一条 skill 记录
- **THEN** 以下约束全部成立：`id` 为小写字母/数字/连字符且全目录唯一；`name` 非空；`description` 非空且说明该 skill「何时用」；`author` 非空；`install` 非空（含可执行的安装指引）；`repo` 为有效 URL（来源仓库）；`license` 非空；`topics` 为非空字符串数组且每个元素 ∈ `catalog/topics.json` 词表

#### Scenario: 违反字段约束被拒
- **WHEN** 一条记录缺必填字段、`id` 重复、或 `topics` 含词表外标签
- **THEN** CI 校验失败，指出违规字段与原因，不进入收录

### Requirement: REQ-CAT-003 schema 结构校验
系统 SHALL 提供 `catalog/catalog.schema.json` 约束 `catalog.json` 的结构（顶层对象、字段类型、必填项），作为 CI 校验的机械依据。

#### Scenario: 非法结构被拦
- **WHEN** `catalog.json` 不是合法 JSON、或结构不满足 schema（如字段类型错误、缺必填项）
- **THEN** CI 校验失败并给出定位（文件 + 字段 + 原因）

### Requirement: REQ-CAT-004 收录范围限定
系统 SHALL 只收录 Claude Code skills（SKILL.md 形态）——不收录 plugins / MCP servers / commands / agents，作为贡献指南与维护者审核的收录判据。

#### Scenario: 非 SKILL.md 形态被拒收
- **WHEN** 贡献者提交的条目不是独立 Claude Code skill（如是一个 MCP server 或 command）
- **THEN** 维护者按收录判据要求其改为「以 skill 为粒度的条目」，或拒绝收录

### Requirement: REQ-CAT-005 cc-assistant 自荐条目
系统 SHALL 在 `catalog.json` 中收录 `cc-assistant` 自身作为首条自荐条目（其余字段按 REQ-CAT-002 填写，`author` 为维护者）。

#### Scenario: 首条自荐存在
- **WHEN** 首次发布 catalog.json
- **THEN** 目录包含 `cc-assistant` 条目，且通过 REQ-CAT-002 全部约束
