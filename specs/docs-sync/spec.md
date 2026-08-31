# Spec: Docs Sync（贡献文档同步）

## ADDED Requirements

### Requirement: REQ-DOC-001 CONTRIBUTING 推荐路径
系统 SHALL 更新 `catalog/CONTRIBUTING.md`，把 `/contribute` 标注为推荐贡献路径，手动流程保留为「原理说明 / 备选」。

#### Scenario: 指南含推荐路径
- **WHEN** 贡献者打开 `catalog/CONTRIBUTING.md`
- **THEN** 能看到「推荐用 `/contribute` 命令」的说明，以及作为备选 / 原理的手动步骤

### Requirement: REQ-DOC-002 README 双语言入口
系统 SHALL 在 `README.md` 与 `README-zh.md` 的贡献段同时提及 `/contribute` 入口，保持中英镜像一致。

#### Scenario: 双语言一致
- **WHEN** 用户分别阅读 `README.md` 与 `README-zh.md` 的贡献段
- **THEN** 两处都提及 `/contribute` 入口，无中英漂移

### Requirement: REQ-DOC-003 eval 贡献者用例
系统 SHALL 在 `cc-assistant/eval/cases.md` 新增 `/contribute` 贡献者场景用例（无命令基线 vs 有命令行为对比），覆盖字段收集、`id` 生成、主题确认、就近映射、校验闭环。

#### Scenario: eval 覆盖命令路径
- **WHEN** 运行 eval 用例模拟贡献者用 `/contribute` 贡献一条 skill
- **THEN** 用例断言：得到合法条目、`validate` / `sync` / `--check` 退出码 0、交接输出含「建议新增主题」备注

### Requirement: REQ-DOC-004 根 CLAUDE.md 指针与入口
系统 SHALL 更新根 `CLAUDE.md` 的「当前 change」指针为 v5，并在「目录子系统」段贡献路径提及 `/contribute`。

#### Scenario: 指针与入口更新
- **WHEN** 阅读根 `CLAUDE.md`
- **THEN** 当前 change 指针指向 `cc-assistant-v5`，目录子系统段含 `/contribute` 入口

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
