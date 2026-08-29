# Spec: Type-Aware Display（类型感知展示）

## ADDED Requirements

### Requirement: REQ-TAD-001 产物带 type
系统 SHALL 使 `catalog/sync-catalog.mjs` 再生成产物时标注条目 `type`：`cc-assistant/modules/_community-skills.md` 快照为每条目标注类型（缺省 skill 显式写出）；`site/data/catalog.json` 随 `catalog.json` 保留 `type`（是否归一化缺省值由 design 定，须同步 `--check` 比较语义）；`site/data/course-mapping.json` 是模块→主题映射、不含条目，不涉 type。

#### Scenario: 快照带类型
- **WHEN** 运行 `node catalog/sync-catalog.mjs`
- **THEN** `_community-skills.md` 与 `site/data/catalog.json` 中的条目带 `type`（缺省补 skill）

### Requirement: REQ-TAD-002 站点类型徽章
系统 SHALL 使站点（`site/index.html` + `site/assets/app.js`）为每条目渲染类型徽章（skill / agent / mcp-server / plugin）。

#### Scenario: 徽章展示
- **WHEN** 站点渲染一条 mcp-server 条目
- **THEN** 卡片上显示对应的类型徽章

### Requirement: REQ-TAD-003 站点类型筛选
系统 SHALL 使站点支持按类型筛选（四类 + 全部）。

#### Scenario: 按类型筛选
- **WHEN** 用户点击「plugin」筛选
- **THEN** 列表只显示 plugin 类型条目

### Requirement: REQ-TAD-004 站点文案统一
系统 SHALL 将站点「skill」专属文案统一为「条目 / entry」（footer、空态、计数、卡片文案；`<title>`/`<h1>` 的「社区 Skill 目录」品牌名保留），使四类条目语义一致。

#### Scenario: 文案无 skill 专属
- **WHEN** 浏览站点 footer、空态、计数、卡片文案
- **THEN** 无「skill」专属措辞，统一为「条目 / entry」；品牌名「社区 Skill 目录」保留

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
