# Spec: Type-Aware Contribute（类型感知贡献命令）

## ADDED Requirements

### Requirement: REQ-TAC-001 命令先问 type
系统 SHALL 使 `.claude/commands/contribute.md` 在收集字段前先询问条目 `type`（skill / agent / mcp-server / plugin），并将 frontmatter `description` 与 `argument-hint` 措辞更新为四类口径、写入结构字段数 8→9（加 `type`）。

#### Scenario: 先问类型
- **WHEN** 贡献者运行 `/contribute`
- **THEN** 命令先询问类型，再按类型收集后续字段；命令 frontmatter 为四类口径，条目含 9 字段（8 + type）

### Requirement: REQ-TAC-002 各类型安装指引
系统 SHALL 按类型收集字段（四类共享 8 字段 + type，`install` 单字符串承载）并给出对应安装指引：skill / agent 复制到对应目录、mcp-server 提供命令与配置指引、plugin 提供 marketplace 安装指引。

#### Scenario: mcp-server 安装指引
- **WHEN** 贡献者类型为 mcp-server
- **THEN** 命令收集其启动命令 / 配置方式，install 字段给出可执行的配置指引

#### Scenario: plugin 安装指引
- **WHEN** 贡献者类型为 plugin
- **THEN** 命令收集 marketplace 源，install 字段给出 `/plugin install` 指引

### Requirement: REQ-TAC-003 校验闭环适配四类
系统 SHALL 使命令的校验闭环（`validate.mjs` → `sync-catalog.mjs` → `--check`）对四类条目均退出码 0 才交接。

#### Scenario: 四类条目就绪
- **WHEN** 命令写入任一类型的条目并校验
- **THEN** validate / sync / --check 均退出码 0 后输出交接

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
