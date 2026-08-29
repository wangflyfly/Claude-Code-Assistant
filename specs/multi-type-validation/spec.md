# Spec: Multi-Type Validation（多类型校验）

## ADDED Requirements

### Requirement: REQ-MTV-001 schema 声明式枚举
系统 SHALL 在 `catalog/catalog.schema.json` 增加 `type` 可选字段（枚举 `skill`/`agent`/`mcp-server`/`plugin`）；既有字段结构与必填项不变（四类共享 8 字段结构，`type` 为唯一新增字段）。

#### Scenario: schema 约束 type
- **WHEN** schema 校验一条带 `type` 的条目
- **THEN** `type` 不在枚举时失败；缺省（无 type）时通过

### Requirement: REQ-MTV-002 validate 运行时校验
系统 SHALL 在 `catalog/validate.mjs` 显式校验：`type` ∈ 枚举（缺省按 skill，运行时实现——`validateAgainstSchema` 不处理 enum 关键字，非法 type 的拒绝由 validate.mjs 显式逻辑承担）、8 字段必填齐全、`install` 安装指引非空（四类共享字段结构，`install` 单字符串承载各类型安装指引）。

#### Scenario: 四类条目校验通过
- **WHEN** 校验 skill / agent / mcp-server / plugin 各一条合法条目
- **THEN** 全部通过，退出码 0

#### Scenario: 非法 type 被拒
- **WHEN** 一条目写 `type: command`（枚举外）
- **THEN** validate.mjs 报错定位到条目与非法值，退出码 1

#### Scenario: install 缺失被拒
- **WHEN** 一条目 `install` 为空
- **THEN** 校验失败，报错定位到字段

### Requirement: REQ-MTV-003 测试矩阵扩展
系统 SHALL 扩展 `catalog/validate.test.mjs` 与 `catalog/sync-catalog.test.mjs`，覆盖四类条目的合法（含缺 type 按 skill）与非法（非法 type、install 缺失）用例。

#### Scenario: 四类用例矩阵
- **WHEN** 运行 validate 与 sync 测试套件
- **THEN** 四类合法条目通过、非法用例各自失败，退出码 0

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
