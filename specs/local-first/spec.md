# Spec: Local-First（全程本地、零上传）

## ADDED Requirements

### Requirement: REQ-LOC-001 课程侧不联网拉取
系统 MUST 让课程侧（cc-assistant 教学引擎）运行时不发起任何网络请求去拉取目录数据——社区 skill 推荐只读本地快照 `cc-assistant/modules/_community-skills.md`，维护 v3「全程本地、零上传」哲学。

#### Scenario: 教学全程离线可用
- **WHEN** 学习者运行课程任何模块（含社区 skill 推荐小节）
- **THEN** 所有教学与推荐内容来自本地文件（SKILL.md / 模块支撑文件 / 本地快照），无网络依赖

### Requirement: REQ-LOC-002 目录仅元数据不做托管分发
系统 SHALL 让 `catalog/catalog.json` 只承载 skill 的元信息与安装指引（`install`），不托管、不下载、不执行任何 skill 内容；安装动作由学习者按 `install` 指引自行决定。

#### Scenario: 目录不做安装
- **WHEN** 学习者或课程看到一条目录 skill 及安装指引
- **THEN** 目录只展示信息与指引，不代装、不执行下载，安装与否由学习者决定

### Requirement: REQ-LOC-003 免责声明管理信任预期
系统 SHALL 在网页与贡献指南中声明「收录仅表示通过结构校验与维护者审核，不构成对 skill 质量 / 安全性的背书；安装 / 使用前请自行核对（评估第三方 skill ≈ 评估依赖）」。

#### Scenario: 免责声明可见
- **WHEN** 用户浏览网页或阅读 `catalog/CONTRIBUTING.md`
- **THEN** 能看到上述免责声明文本（对应 REQ-CON-005）

### Requirement: REQ-LOC-004 安全边界继承
系统 SHALL 让目录 / 网页 / 课程集成延续 v3 安全边界：不诱导学习者对真实项目执行不可逆或危险操作；推荐 skill 的安装与配置动作属于学习者决定权范围，演示与讲解可、实际落地由学习者自行决定。

#### Scenario: 不替学习者落地
- **WHEN** 课程展示某社区 skill 的安装或配置指引
- **THEN** 只讲解 / 演示，落地动作由学习者自行决定并执行
