# Spec: Matcher（场景识别）

## ADDED Requirements

### Requirement: REQ-MATCH-001 场景识别
系统 SHALL 根据采集的信号计算各场景的加权得分（核心信号权重 3、辅助信号权重 2、弱信号权重 1），得分达到该场景阈值（默认 3）的场景进入候选，输出得分最高者。

信号定义：

| 场景 | 信号（权重） |
|---|---|
| **new-feature** | untracked 源码文件（3）、新建非测试源码文件（2） |
| **bug-fix** | 分支名 `fix/*` 或 `bugfix/*`（3）、改动 error/日志/异常处理文件（2）、commit message 含 fix/bug/hotfix（1，仅弱信号） |
| **testing** | 创建/修改 `.test`/`.spec` 文件（3）、修改测试配置（2） |
| **docs** | 创建/修改 `.md` 或 README（3） |
| **refactor** | modified 文件数 ≥ 10 且无 untracked 源码文件（3）、重命名（2） |
| **init** | 无 `.claude/` 配置 **且** 项目基本为空（无 src/、无 package.json）（复合条件，作为单个核心信号权重 3） |

#### Scenario: 识别"写新功能"
- **WHEN** git status 显示 untracked 的 `src/*.tsx`
- **THEN** new-feature 得分 ≥ 3，输出场景 = new-feature

#### Scenario: 成熟项目不误判为 init
- **WHEN** 项目无 `.claude/` 配置，但存在 `src/` 目录和 `package.json`
- **THEN** init 不得分，不输出 init 场景

### Requirement: REQ-MATCH-002 场景优先级决胜
系统 SHALL 在多个场景同时达到阈值时，按固定优先级取最高者：`testing > bug-fix > new-feature > docs > refactor`。

#### Scenario: TDD 重叠
- **WHEN** 同时新建 `.test` 文件和源码文件（testing 与 new-feature 都达到阈值）
- **THEN** 输出场景 = testing（优先级更高）

#### Scenario: 修 bug 顺带改源码
- **WHEN** 分支名为 `fix/login` 且同时有 modified 源码文件（bug-fix 与 new-feature 都达到阈值）
- **THEN** 输出场景 = bug-fix（优先级更高）

### Requirement: REQ-MATCH-003 置信度分级
系统 SHALL 按加权得分输出置信度：得分 ≥ 5 为高，3-4 为中，< 3 为低（未达阈值）。

#### Scenario: 高置信度
- **WHEN** 命中 2 个核心信号（得分 ≥ 5）
- **THEN** 输出置信度 = 高

#### Scenario: 单一核心信号
- **WHEN** 仅命中 1 个核心信号（得分 = 3）
- **THEN** 输出置信度 = 中

### Requirement: REQ-MATCH-004 无信号回退
系统 MUST 在所有场景得分均低于阈值时，回退到技术栈无关的通用推荐（newbieDefaults）。

#### Scenario: 空仓库无信号
- **WHEN** 项目无 git 历史、无近期修改、无特征场景信号
- **THEN** 按 newbieDefaults 输出推荐，而非报错

> 已知限制：`/assist` 是单时点采样，无法追踪"先建文件→后写测试"的时间序列；靠置信度 + 无信号回退兜底。
