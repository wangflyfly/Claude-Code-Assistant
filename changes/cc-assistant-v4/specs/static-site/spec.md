# Spec: Static Site（网页静态展示）

## ADDED Requirements

### Requirement: REQ-SIT-001 site/ 为发布源且隔离内部产物
系统 SHALL 以 `site/` 目录作为 GitHub Pages 发布源，`site/.nojekyll` 关闭 Jekyll；`changes/` 与 `specs/` 等内部 spec-superflow 产物不随站公开。

#### Scenario: 发布源限定 site/
- **WHEN** GitHub Pages 从仓库发布
- **THEN** 发布源是 `site/` 目录，仓库根的 `changes/`、`specs/`、`.superpowers/` 等内部目录不可通过站点访问

### Requirement: REQ-SIT-002 客户端读取数据渲染
系统 SHALL 让 `site/index.html` 通过浏览器客户端读取 `site/data/` 数据文件（`catalog.json` 与 `course-mapping.json`，均为机器生成副本）渲染目录，无后端、无构建工具链。

#### Scenario: 打开网页看到目录
- **WHEN** 用户访问站点（HTTP 服务，非 `file://`）
- **THEN** 页面从 `site/data/` 数据文件（catalog.json 与 course-mapping.json）读取数据并渲染 skill 列表

### Requirement: REQ-SIT-003 按主题标签筛选
系统 SHALL 让网页提供按主题标签筛选的能力，展示每个主题下匹配的 skill。

#### Scenario: 选择主题筛选
- **WHEN** 用户在网页选择一个主题标签（如 `hooks`）
- **THEN** 列表只展示 `topics` 含该标签的 skill，并显示当前筛选条件与结果数

### Requirement: REQ-SIT-004 按课程阶段筛选
系统 SHALL 让网页提供按课程模块（阶段）筛选的能力，依据 `site/data/course-mapping.json`（`catalog/course-mapping.json` 的站内机器生成副本，模块 → 主题）推导：选定模块时展示其映射主题下匹配的 skill。

#### Scenario: 选择课程模块筛选
- **WHEN** 用户在网页选择一个课程模块（如「Hooks」）
- **THEN** 页面按该模块在 `course-mapping.json` 中映射的主题集合，展示对应的 skill

### Requirement: REQ-SIT-005 展示信息与 catalog 一致
系统 SHALL 让网页展示的每条 skill 信息（名称、描述、作者、repo、install、license、topics）与 `catalog/catalog.json` 完全一致；`site/data/catalog.json` 为机器生成副本，不允许人工二次编辑。

#### Scenario: 网页与目录一致
- **WHEN** 比对网页渲染内容与 `catalog/catalog.json` 源数据
- **THEN** 两者字段一致，无人工编辑产生的差异（CI 防漂移校验兜底）
