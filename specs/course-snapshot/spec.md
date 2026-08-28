# Spec: Course Snapshot（课程内置快照）

## ADDED Requirements

### Requirement: REQ-SNP-001 快照由同步脚本生成
系统 SHALL 让 `catalog/sync-catalog.mjs` 从 `catalog/catalog.json` 与 `catalog/course-mapping.json` 机器生成课程快照 `cc-assistant/modules/_community-skills.md`，按主题分组列出每个主题下的 skill（`name` + 一句话描述 + `install` 提示 + `repo`）。

#### Scenario: 快照按主题分组
- **WHEN** 运行 `sync-catalog.mjs` 生成快照
- **THEN** 快照按主题（`topics.json` 中的主题）分组，每个主题下列出对应的 skill 及其 name / 描述 / install / repo

### Requirement: REQ-SNP-002 快照随课程分发并入库提交
系统 SHALL 让课程快照 `cc-assistant/modules/_community-skills.md` 作为**必须入库提交**的生成产物随课程分发（安装到 `~/.claude/skills/` 时随支撑文件带过去），由 CI 合入再生成防漂移，不允许人工二次编辑。

#### Scenario: 快照随课程安装
- **WHEN** 学习者安装 cc-assistant（含 v4 更新后的课程）
- **THEN** `_community-skills.md` 快照随模块支撑文件一起就位，本地可读

### Requirement: REQ-SNP-003 各课程模块展示对应主题推荐
系统 SHALL 让 v3 课程各模块文件（core ~ capstone，不含 m0-onboarding）新增「社区好 skill」短小节：列出本模块映射主题，并引用本地快照 `_community-skills.md` 对应主题小节；课程运行时不联网。

#### Scenario: 模块内展示社区 skill 推荐
- **WHEN** 学习者进入某个课程模块（如 Hooks）
- **THEN** 该模块的「社区好 skill」小节列出 Hooks 模块映射主题（如 hooks / engineering），并指引查看本地快照对应主题小节下的 skill 列表

#### Scenario: 模块不联网拉取
- **WHEN** 模块展示社区 skill 推荐
- **THEN** 只读本地快照 `_community-skills.md`，不发起任何网络请求

### Requirement: REQ-SNP-004 快照不含 m0-onboarding
系统 SHALL 让课程快照只覆盖 11 个课程模块（core ~ capstone）映射的主题，不含 `m0-onboarding`（课前准备不需要社区 skill 推荐）。

#### Scenario: 快照范围限定
- **WHEN** 审查快照内容与 course-mapping.json
- **THEN** 快照按课程模块映射的主题生成，`m0-onboarding` 不产生任何推荐小节

### Requirement: REQ-SNP-005 快照与 catalog 一致
系统 SHALL 让快照内容与 `catalog/catalog.json` 保持同步（CI 合入再生成 + `--check` 防漂移）；任何 catalog 变更后，快照不滞后。

#### Scenario: catalog 更新后快照跟随
- **WHEN** 目录新增一条 skill 且其 `topics` 命中某模块映射主题
- **THEN** 合入后重新生成的快照包含该 skill 于对应主题小节，旧快照被替换
