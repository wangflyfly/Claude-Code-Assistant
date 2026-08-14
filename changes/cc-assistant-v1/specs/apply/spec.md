# Spec: Apply（代劳启用）

## ADDED Requirements

### Requirement: REQ-APPLY-001 启用前显式确认
系统 MUST 在执行任何安装或写入前，明确列出所有待启用项（"将安装 X / 写入 Y"），征询用户确认（"确认吗？[Y/n]"），用户同意后才继续。`/assist apply`（批量）一次性列出全部待启用项征询；对单条推荐确认则只列该条。

#### Scenario: 用户拒绝
- **WHEN** 用户对确认征询回答"否/取消"
- **THEN** 系统不执行任何安装或写入，标记该项为未完成

#### Scenario: 用户同意
- **WHEN** 用户对确认征询回答"确认/是"
- **THEN** 系统才执行后续安装/写入

### Requirement: REQ-APPLY-002 代劳安装 Skill
系统 SHALL 在用户同意后，对安装类条目（Skill）执行目录条目的 `installCmd`（如 `npx skills add <owner/repo> --skill <name>`），而非重新推导命令。

#### Scenario: 安装成功
- **WHEN** 用户确认启用 `test-generator`，`installCmd` 执行成功
- **THEN** 系统输出成功确认，并把 `test-generator` 加入 `enabledItems.skills`

#### Scenario: 安装失败
- **WHEN** `installCmd` 返回非零退出码
- **THEN** 系统报错并提示原因，不影响其余待启用项

### Requirement: REQ-APPLY-003 代劳写规则
系统 SHALL 在用户同意后，对配置类条目（Rule/Hook）写入目标文件，内容取自目录条目的 `content` 字段。Rule 写入项目级 `.claude/rules/<id>.md`（目录不存在则先创建）。

#### Scenario: 写入规则文件
- **WHEN** 用户确认启用 `conventional-commit`，且 `.claude/rules/conventional-commit.md` 不存在
- **THEN** 系统创建 `.claude/rules/` 目录并写入该文件，内容为该条目的 `content`

#### Scenario: 文件已存在
- **WHEN** `.claude/rules/conventional-commit.md` 已存在
- **THEN** 系统提示"覆盖还是跳过"，按用户选择处理
