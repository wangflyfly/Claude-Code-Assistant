# Spec: Community Contribution（社区 PR 贡献）

## ADDED Requirements

### Requirement: REQ-CON-001 skill 条目 PR 模板
系统 SHALL 提供 `.github/PULL_REQUEST_TEMPLATE/` 下的 skill 条目 PR 模板，引导贡献者按 REQ-CAT-002 字段逐项填写，并附带填写说明与自检清单。

#### Scenario: 贡献者按模板提交
- **WHEN** 网友想往目录加 skill、创建 PR
- **THEN** 模板列出需填写的字段（id/name/description/author/install/repo/license/topics）、示例条目、以及提交前自检清单（本地 `node` 校验脚本可跑）

### Requirement: REQ-CON-002 贡献指南
系统 SHALL 提供 `catalog/CONTRIBUTING.md`，说明贡献流程：如何加一条 skill、如何本地预校验、CI 会查什么、收录判据（REQ-CAT-004）、审核流程。

#### Scenario: 贡献者阅读指南
- **WHEN** 贡献者打开 `catalog/CONTRIBUTING.md`
- **THEN** 能找到完整的「新增 skill 条目」步骤、本地校验命令、以及被拒的常见原因

### Requirement: REQ-CON-003 维护者审核清单
系统 SHALL 在 PR 模板或 CONTRIBUTING.md 中给出维护者审核清单，核对项至少包括：SKILL.md 形态（REQ-CAT-004）、`repo` 可访问且指向真实来源、`license` 明确、`description` 描述「何时用」且与正文一致、`topics` 与 skill 实际能力匹配。

#### Scenario: 维护者按清单审核
- **WHEN** 维护者收到一条目录 PR
- **THEN** 按审核清单逐项核对，不满足任一项则要求修改或拒绝，通过后才合入

### Requirement: REQ-CON-004 合入权在维护者
系统 SHALL 不做 PR 自动合入——任何目录变更（含新增、修改、删除条目）都需维护者显式批准合入。

#### Scenario: 无自动合入
- **WHEN** 一条目录 PR 的 CI 全部通过
- **THEN** 仍等待维护者批准才合入；CI 通过不等价于已收录

### Requirement: REQ-CON-005 免责声明
系统 SHALL 在网页与贡献指南中声明「收录仅表示通过结构校验与维护者审核，不构成对 skill 质量 / 安全性的背书；安装前请自行核对」，以管理第三方 skill 推荐的风险预期。

#### Scenario: 网页与指南含免责声明
- **WHEN** 用户浏览网页或阅读贡献指南
- **THEN** 能看到上述免责声明文本
