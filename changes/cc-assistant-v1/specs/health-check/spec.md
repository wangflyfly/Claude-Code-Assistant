# Spec: Health Check（健康度评分）

## ADDED Requirements

### Requirement: REQ-HEALTH-001 综合评分
系统 SHALL 计算启发式评分并输出等级（优秀 ≥65 / 良好 45-64 / 待改进 25-44 / 需关注 <25）。评分公式：基础分 20，每个已启用 Skill（安装类）+5（上限 30，6 个）、每个 Rule（配置类）+3（上限 15，5 个）、每个 Hook（配置类）+3（上限 15，5 个）、Skill/Rule/Hook 三类均有 +5 综合加成。v1 目录无 Hook，Hook 与综合加成在 v1 恒为 0（未来引入 Hook 后生效），v1 最高 65 分。

#### Scenario: 空项目评分
- **WHEN** 项目未启用任何 Skill/Rule/Hook
- **THEN** 系统输出 20 分（基础分），等级"需关注"

#### Scenario: 启用 1 个 Skill
- **WHEN** 项目启用了 1 个 Skill
- **THEN** 系统输出 25 分（20 + 5），等级"待改进"

#### Scenario: 装满 Skill 与 Rule
- **WHEN** 启用 ≥6 Skill 且 ≥5 Rule（v1 无 Hook）
- **THEN** 系统输出 65 分（20 + 30 + 15），等级"优秀"

### Requirement: REQ-HEALTH-002 缺失诊断
系统 SHALL 按影响程度列出缺失的关键配置并标注优先级：高 = 缺失整个维度（如无任何 Hook）；中 = 缺失场景相关配置；低 = 补充性建议。

#### Scenario: 缺失诊断输出
- **WHEN** 项目无任何 Hook、无场景相关的 Rule
- **THEN** 系统输出缺失项列表，Hook 维度标"高"、场景 Rule 标"中"

### Requirement: REQ-HEALTH-003 非客观基准标注
系统 MUST 在报告中标注"激励性启发式，非客观基准"，且不展示社区对比。

#### Scenario: 报告标注
- **WHEN** 输出健康报告
- **THEN** 报告含启发式标注，且无"社区平均分对比"

### Requirement: REQ-HEALTH-004 独立调用
系统 SHALL 支持通过 `/assist health` 独立触发完整健康报告（评分 + 等级 + 明细 + 缺失诊断 + 优先级建议），不运行场景识别和推荐流程。该命令复用 Scanner 的"已有配置扫描"计算评分；`/assist` 主流程内联展示的健康度复用同一计算逻辑。

#### Scenario: 独立触发健康报告
- **WHEN** 用户输入 `/assist health`
- **THEN** 系统只输出健康报告（评分/等级/明细/缺失/建议），不输出推荐列表

#### Scenario: 主流程内联健康度
- **WHEN** 用户输入 `/assist`
- **THEN** 系统在推荐输出中内联展示健康度（复用同一评分），并提示可用 `/assist health` 查看完整报告
