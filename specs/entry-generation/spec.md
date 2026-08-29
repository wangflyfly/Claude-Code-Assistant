# Spec: Entry Generation（描述 → 结构化条目）

## ADDED Requirements

### Requirement: REQ-ENT-001 id 生成与回退
系统 SHALL 从 `name` slug 化生成 `id`（小写字母/数字/连字符），并在写入前检查全目录唯一；当 slug 化为空串、含非法字符、或与既有条目冲突时，系统 SHALL 要求贡献者手动输入合法 `id`（匹配 `^[a-z0-9-]+$`）。

#### Scenario: 正常 slug 化
- **WHEN** 贡献者提供 name 为 "My Format Skill"
- **THEN** 生成候选 id "my-format-skill"，唯一则采用

#### Scenario: 非 ASCII 回退
- **WHEN** 贡献者提供的中文名 slug 化为空或非法
- **THEN** 命令提示贡献者手动输入小写连字符 id，输入合法后才继续

### Requirement: REQ-ENT-002 条目合法写入
系统 SHALL 将新条目追加到 `catalog/catalog.json` 的 `skills` 数组**末尾**，含 8 个字段（id/name/description/author/install/repo/license/topics）且 schema 合规；系统 SHALL NOT 修改、删除或重排既有条目。

#### Scenario: 追加条目
- **WHEN** 命令写入新条目
- **THEN** 新条目位于 skills 数组末尾，8 字段齐全，既有条目原样保留

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
