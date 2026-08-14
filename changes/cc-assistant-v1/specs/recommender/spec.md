# Spec: Recommender（智能推荐）

## ADDED Requirements

### Requirement: REQ-REC-001 两层目录合并
系统 SHALL 合并内置目录 `recommendations.json` 与自定义目录 `custom-recommendations.json`，按 `id` 去重，自定义覆盖内置同 `id`。

#### Scenario: 自定义覆盖内置
- **WHEN** 内置与自定义均含 `id = "test-generator"`，但 `installCmd` 不同
- **THEN** 系统采用自定义目录的 `installCmd`

#### Scenario: 自定义文件缺失
- **WHEN** `custom-recommendations.json` 不存在
- **THEN** 系统视其为空目录，仅用内置目录，不报错

### Requirement: REQ-REC-002 简单规则排序
系统 SHALL 按「场景匹配 → 技术栈匹配 → 去重（已启用的不再推荐）→ 新手过滤」筛选排序，不使用加权评分算法。

#### Scenario: 技术栈过滤
- **WHEN** 技术栈 = `python`，目录含 `react-best-practices`（techStacks 仅 react/next）
- **THEN** 系统不推荐 `react-best-practices`

#### Scenario: 已启用去重
- **WHEN** `test-generator` 已在"已启用列表"中
- **THEN** 系统不推荐 `test-generator`

### Requirement: REQ-REC-003 双维度引导
系统 SHALL 按「用户经验等级 × 项目意图」决定推荐数量与层级上限。

| 项目意图 | 新手 | 进阶/专家 |
|---|---|---|
| learning | 1-2 个最通用 | 保守，不塞高级工具 |
| personal | 2-3 个基础栈 | 中等，不含进阶层 meta 工具 |
| engineering | 完整基础栈（3 Skill + 2 Rule + 1 Hook） | 完整工具链（含进阶层） |

#### Scenario: 学习项目 + 新手
- **WHEN** 经验等级 = beginner 且项目意图 = learning
- **THEN** 系统只输出 1-2 个最通用条目

#### Scenario: 个人项目 + 新手
- **WHEN** 经验等级 = beginner 且项目意图 = personal
- **THEN** 系统输出 2-3 个基础栈条目

#### Scenario: 工程化项目 + 新手
- **WHEN** 经验等级 = beginner 且项目意图 = engineering
- **THEN** 系统输出完整基础栈（≤3 Skill + ≤2 Rule + ≤1 Hook），不含进阶层工具

### Requirement: REQ-REC-004 新手过滤
系统 SHALL 对新手不推荐 MCP，且 Skill/Rule/Hook 数量不超过 3/2/1。

#### Scenario: 新手上限
- **WHEN** 经验等级 = beginner
- **THEN** 推荐列表不含 MCP，且 Skill ≤ 3、Rule ≤ 2、Hook ≤ 1

### Requirement: REQ-REC-005 推荐输出诚实
系统 MUST NOT 展示编造的分钟数、热度、使用次数；每条推荐只含名称、一句话说明、定性收益、置信度、启用命令。

#### Scenario: 无虚构数字
- **WHEN** 输出推荐列表
- **THEN** 输出中不含"预计节省 N 分钟/天"、热度值、使用次数

### Requirement: REQ-REC-006 场景映射与回退
系统 SHALL 用 `scenarios` 字段把场景映射到条目；无映射场景回退到 `newbieDefaults`。

#### Scenario: 映射命中
- **WHEN** 场景 = `testing`
- **THEN** 推荐 `scenarios.testing` 映射的条目（test-generator、webapp-testing）

#### Scenario: 无映射回退
- **WHEN** 场景 = `init`
- **THEN** 按 `newbieDefaults` 输出

### Requirement: REQ-REC-007 候选为空回退
系统 MUST 在筛选（技术栈 + 去重 + 新手过滤）后候选为空时，回退到 `newbieDefaults` 中技术栈匹配的条目；若仍为空，输出"暂无适配推荐"。

#### Scenario: 筛选后为空
- **WHEN** 技术栈过滤 + 去重后候选为空
- **THEN** 系统回退到 newbieDefaults 中技术栈匹配的条目

#### Scenario: 彻底为空
- **WHEN** newbieDefaults 中也没有技术栈匹配的条目
- **THEN** 系统输出"暂无适配推荐"，不报错

### Requirement: REQ-REC-008 经验等级进阶
系统 SHALL 在用户达到进阶条件时提示"可以进阶到 X 了，要解锁更多推荐吗？"，用户确认后更新 `experienceLevel`。进阶条件（可测）：beginner→intermediate = 已启用 ≥3 Skill 且在 ≥2 个不同日期运行过 `/assist`；intermediate→advanced = 已启用 ≥6 配置项（Skill+Rule+Hook）且反馈 ≥5 条；advanced→expert = 已启用 ≥10 配置项且近 4 周持续回访。为此 profile 需记录运行 `/assist` 的日期历史（`visitHistory`）。

#### Scenario: 触发进阶提示
- **WHEN** 已启用 ≥3 Skill 且在 ≥2 个不同日期运行过 `/assist`
- **THEN** 系统提示"可以进阶到 intermediate 了"，等待用户确认

#### Scenario: 用户确认进阶
- **WHEN** 用户确认进阶
- **THEN** 系统把 `experienceLevel` 更新为 intermediate
