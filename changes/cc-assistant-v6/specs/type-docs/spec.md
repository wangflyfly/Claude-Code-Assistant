# Spec: Type Docs（收录范围文档同步）

## ADDED Requirements

### Requirement: REQ-TDC-001 CONTRIBUTING 收录四类
系统 SHALL 更新 `catalog/CONTRIBUTING.md`：收录范围从「仅 SKILL.md skills」改为四类（skill / agent / mcp-server / plugin），说明各类型形态判据、`type` 与 `topics` 正交（type 是工件形态、topics 是发现主题，不强制映射）、被拒原因补充非法 type。

#### Scenario: 指南含四类判据
- **WHEN** 贡献者打开 `catalog/CONTRIBUTING.md`
- **THEN** 能看到四类收录范围、各类型形态说明、type 与 topics 正交说明

### Requirement: REQ-TDC-002 README 双语言贡献引导
系统 SHALL 更新 `README.md` 与 `README-en.md` 贡献段的「贡献什么 / 为什么贡献 / 判据」为四类口径，中英镜像一致。

#### Scenario: 双语言四类口径
- **WHEN** 阅读 README.md 与 README-en.md 贡献段
- **THEN** 两处均表述四类收录（贡献什么/为什么/判据），无中英漂移

### Requirement: REQ-TDC-003 PR 模板类型化
系统 SHALL 更新 `.github/PULL_REQUEST_TEMPLATE/skill-entry.md`：增加 `type` 字段、各类型形态判据、维护者审核清单按类型分支。

#### Scenario: 模板含 type
- **WHEN** 贡献者按模板填 PR
- **THEN** 模板含 `type` 字段选择、各类型形态判据、审核清单按类型分支

### Requirement: REQ-TDC-004 eval 覆盖四类贡献
系统 SHALL 在 `cc-assistant/eval/cases.md` 新增四类（skill / agent / mcp-server / plugin）贡献流程场景用例（无命令基线 vs 有命令），覆盖 type 询问、各类型字段与安装指引、校验闭环。

#### Scenario: eval 覆盖四类
- **WHEN** 运行 eval 用例模拟贡献者用 `/contribute` 贡献四类条目
- **THEN** 用例断言：type 询问、各类型 install 指引、validate / sync / --check 退出码 0

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
