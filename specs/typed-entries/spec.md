# Spec: Typed Entries（类型化条目）

## MODIFIED Requirements

### Requirement: REQ-CAT-004 收录范围扩展为四类
系统 SHALL 将既有收录范围（REQ-CAT-004「仅 Claude Code skills，不收录 plugins / MCP servers / commands / agents」）修改为：收录 `skill` / `agent` / `mcp-server` / `plugin` 四类；`commands` 仍不收录。

#### Scenario: commands 仍排除
- **WHEN** 贡献者提交一条 `command` 类型条目
- **THEN** 校验失败，提示 commands 不在收录范围

## ADDED Requirements

### Requirement: REQ-TYP-001 type 字段可选，缺省 skill
系统 SHALL 允许 `catalog/catalog.json` 的每条目带可选的 `type` 字段，取值 ∈ {`skill`, `agent`, `mcp-server`, `plugin`}；条目缺省无 `type` 时按 `skill` 处理（既有条目零字段改动、向后兼容）。

#### Scenario: 缺省按 skill
- **WHEN** 一条目未写 `type`
- **THEN** 该条目按 `type: skill` 语义处理，校验、展示、同步均视为 skill

#### Scenario: 显式类型
- **WHEN** 一条目写 `type: mcp-server`
- **THEN** 该条目按 mcp-server 类型处理

### Requirement: REQ-TYP-002 类型枚举约束
系统 SHALL 只接受四类 `type` 值；出现枚举外值时校验失败并定位到条目。

#### Scenario: 非法 type 被拒
- **WHEN** 一条目写 `type: command`（枚举外）
- **THEN** 校验失败，报错定位到该条目与非法值

### Requirement: REQ-TYP-003 superpowers 重标 plugin
系统 SHALL 将既有 `superpowers` 条目的类型显式标为 `plugin`（其 install 走 `/plugin install`，实为 plugin；v6 唯一例外）。

#### Scenario: superpowers 为 plugin
- **WHEN** 读取 `catalog/catalog.json` 的 superpowers 条目
- **THEN** 其 `type` 为 `plugin`

### Requirement: REQ-TYP-004 四类样例条目
系统 SHALL 使 `catalog/catalog.json` 含四类各至少一条样例：`agent` / `mcp-server` / `plugin` 各新增一条真实可访问条目，`skill` 用既有 `cc-assistant` 条目验证向后兼容。

#### Scenario: 四类齐备
- **WHEN** 读取 `catalog/catalog.json`
- **THEN** 四类（skill / agent / mcp-server / plugin）各有至少一条样例，且全部通过校验

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
