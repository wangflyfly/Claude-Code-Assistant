# Spec: CI Validation（CI 校验与合入同步）

## ADDED Requirements

### Requirement: REQ-CIV-001 PR 触发结构校验
系统 SHALL 在 GitHub Actions（`.github/workflows/catalog-ci.yml`）中，对改动到 `catalog/catalog.json`、`catalog/topics.json`、`catalog/course-mapping.json` 的 PR 执行校验 job，校验项至少包括：JSON 合法、`catalog.schema.json` 结构校验、`id` 唯一、`topics` ⊆ `topics.json`、必填字段齐全。

#### Scenario: 合法 PR 通过校验
- **WHEN** PR 按模板正确新增一条 skill 条目
- **THEN** 校验 job 通过，无失败项

#### Scenario: 非法 PR 校验失败
- **WHEN** PR 含非法 JSON / schema 违规 / `id` 重复 / 词表外 `topics` / 缺必填字段
- **THEN** 校验 job 失败，并在日志中明确指出违规文件、字段与原因

### Requirement: REQ-CIV-002 映射一致性校验
系统 SHALL 在 CI 校验 `course-mapping.json` 的模块键与 `cc-assistant/modules/` 课程模块文件名（剔除 `m0-onboarding.md`）一致，校验 `topics.json` 中每个被 `course-mapping.json` 引用的主题存在。

#### Scenario: 映射漂移被拦
- **WHEN** 课程模块改名但映射未同步，或映射引用了词表外主题
- **THEN** 校验失败，提示需同步映射或词表

### Requirement: REQ-CIV-003 合入后机器再生成
系统 SHALL 在 PR 合入 `main` 后，由 CI（或维护者按约定运行 `catalog/sync-catalog.mjs`）重新生成 `site/data/` 数据文件（`catalog.json` 与 `course-mapping.json`）与 `cc-assistant/modules/_community-skills.md` 并提交，使「网页无需人工改动即自动展示新 skill」成立。

#### Scenario: 合入后产物自动更新
- **WHEN** 一条目录 PR 合入 main
- **THEN** 同步 job 重新生成三产物（site/data 两文件 + 课程快照），生成结果与 `catalog/catalog.json`（及 `course-mapping.json`）一致，并提交更新

### Requirement: REQ-CIV-004 生成产物防漂移
系统 SHALL 在 CI 校验已提交的 `site/data/catalog.json`、`site/data/course-mapping.json` 与课程快照是否为 `catalog/catalog.json`（及 `course-mapping.json`）的最新生成结果；不一致视为漂移并失败（或触发再生成），保证生成产物不被人工二次编辑。

#### Scenario: 漂移被检出
- **WHEN** 有人手工改动了 `site/data/catalog.json` 或快照，使其与 catalog 不符
- **THEN** CI 检出漂移并失败，要求以 `sync-catalog.mjs` 重新生成

### Requirement: REQ-CIV-005 同步脚本可本地运行
系统 SHALL 让 `catalog/sync-catalog.mjs` 可在本地运行（输入 `catalog/catalog.json` + `course-mapping.json`，输出 `site/data/catalog.json`、`site/data/course-mapping.json` 与课程快照），供维护者本地预校验与贡献者自检。

#### Scenario: 本地运行脚本
- **WHEN** 贡献者或维护者本地执行 `node catalog/sync-catalog.mjs`
- **THEN** 脚本成功重生成三产物（site/data 两文件 + 课程快照），无网络依赖，退出码 0 表示生成一致
