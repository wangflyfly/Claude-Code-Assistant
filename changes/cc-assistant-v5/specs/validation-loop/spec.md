# Spec: Validation Loop（校验 / 再生成闭环）

## ADDED Requirements

### Requirement: REQ-VAL-001 结构校验闭环
系统 SHALL 在写入条目后运行 `node catalog/validate.mjs`；若失败，系统 SHALL 根据报错修复（字段 / 词表 / 格式问题）并重试，直至退出码 0。

#### Scenario: 校验失败重试
- **WHEN** 写入后 validate 报错（如 topics 词表外）
- **THEN** 命令修复后重跑，直到退出码 0 才继续

### Requirement: REQ-VAL-002 再生成与防漂移复核
系统 SHALL 运行 `node catalog/sync-catalog.mjs` 再生成三产物（site/data/catalog.json、site/data/course-mapping.json、cc-assistant/modules/_community-skills.md），再运行 `node catalog/sync-catalog.mjs --check` 复核，退出码必须为 0。

#### Scenario: 三产物就绪
- **WHEN** 条目写入且 validate 通过
- **THEN** 命令再生成三产物并 `--check` 复核退出码 0

### Requirement: REQ-VAL-003 不改数据层
系统 SHALL NOT 修改 `catalog/topics.json`、`catalog/course-mapping.json`、`catalog/catalog.schema.json`、`catalog/validate.mjs`、`catalog/sync-catalog.mjs`、`.github/workflows/catalog-ci.yml`；对 `catalog/catalog.json` 仅做 skills 数组末尾追加。

#### Scenario: 数据层原样
- **WHEN** 命令执行完毕后
- **THEN** 上述数据层文件除 catalog.json 末尾新增条目外，其余保持原样

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
