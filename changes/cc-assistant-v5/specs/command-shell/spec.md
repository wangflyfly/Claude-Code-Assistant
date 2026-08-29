# Spec: Command Shell（/contribute 命令外壳）

## ADDED Requirements

### Requirement: REQ-CMD-001 命令可触发
系统 SHALL 提供项目级斜杠命令 `.claude/commands/contribute.md`（frontmatter 含 `description`，可含 `argument-hint`，遵 Claude Code 斜杠命令约定；命令名由文件名 `contribute.md` 决定），贡献者在仓库克隆内输入 `/contribute` 即可触发，无需用户级安装。

#### Scenario: 克隆仓库即用
- **WHEN** 贡献者克隆仓库后输入 `/contribute`
- **THEN** 命令被触发，开始引导贡献者完成一条 skill 条目的贡献

### Requirement: REQ-CMD-002 输入形态
系统 SHALL 支持两种输入：`/contribute` 后直接带描述（`$ARGUMENTS`）时，命令以该描述为初始输入；无描述时命令以交互式提问收集信息。

#### Scenario: 带参触发
- **WHEN** 贡献者输入 `/contribute 一个格式化 git commit 的 skill`
- **THEN** 命令把该描述作为初始输入，继续收集缺失字段

#### Scenario: 无参触发
- **WHEN** 贡献者仅输入 `/contribute`
- **THEN** 命令依次提问收集所需字段

### Requirement: REQ-CMD-003 字段收集
系统 SHALL 收集条目的六个贡献者提供字段：`name`、`description`（说明「何时用」）、`author`、`install`（可执行的安装指引，命令不代编）、`repo`、`license`；每字段非空，缺失时提示贡献者补齐。`repo` 的 http/https 协议由命令侧校验（`validate.mjs` 不兜底协议，仅做 URL 可解析）。

#### Scenario: 缺字段补齐
- **WHEN** 贡献者未提供 `install` 字段
- **THEN** 命令提示并提供「可执行的安装指引」示例，要求贡献者补齐后再继续

#### Scenario: repo 协议非法
- **WHEN** 贡献者提供的 `repo` 不是 http/https URL
- **THEN** 命令提示协议要求并请贡献者重新输入合法 repo，再继续

### Requirement: REQ-CMD-004 交接输出
系统 SHALL 在条目就绪后输出交接步骤：本地 `git commit` 命令示例 + 按 `.github/PULL_REQUEST_TEMPLATE/skill-entry.md` 模板的 PR 正文（在模板固定字段之外，**仅当发生就近映射时**附加一行「建议新增主题」备注，不改动模板文件本身）；系统 SHALL NOT 自动执行 commit / push / 开 PR。

#### Scenario: 条目就绪后交接
- **WHEN** 命令完成条目写入并校验通过
- **THEN** 输出 commit 示例与 PR 正文模板；仅在本次发生就近映射时含「建议新增主题」附加备注行，不自动执行任何 git 写操作

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
