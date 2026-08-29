# Spec: Topic Mapping（主题推断 + 确认 + 就近映射）

## ADDED Requirements

### Requirement: REQ-TOP-001 主题推断与确认
系统 SHALL 从 `description` 推断候选主题（全部来自 `catalog/topics.json` 词表），展示给贡献者确认 / 调整，最终 `topics` 非空、项不重复、且全部 ⊆ 词表。

#### Scenario: 推断 + 确认
- **WHEN** 命令根据描述给出候选主题
- **THEN** 展示候选（附词表 description）让贡献者确认或调整，确认后的 topics 非空且都在词表内

### Requirement: REQ-TOP-002 词表外就近映射
当贡献者表示词表内无合适主题时，系统 SHALL 强制映射到至少一个词表内主题（就近：在候选里引导贡献者选定语义最接近者），禁止写入词表外主题或留空；系统 SHALL 在交接的 PR 正文附加「建议新增主题」备注行，不自动新增主题。

#### Scenario: 无合适主题时就近映射
- **WHEN** 贡献者说「这些主题都不合适」
- **THEN** 命令引导其在候选主题中选定最接近的一个，最终 topics 仍非空且 ⊆ 词表，并在 PR 正文附加「建议新增主题」备注行

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
