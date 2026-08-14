# Spec: Feedback Loop（反馈学习）

## ADDED Requirements

### Requirement: REQ-FB-001 显式反馈记录
系统 SHALL 记录 👍/👎 及可选文本反馈，写入 `feedbackHistory`。

#### Scenario: 记录 👍
- **WHEN** 用户对某条推荐输入 👍
- **THEN** 系统在 `feedbackHistory` 追加一条 `{itemId, type, feedback:"useful", timestamp}`

### Requirement: REQ-FB-002 反馈关联到条目
系统 SHALL 把反馈关联到具体推荐条目：推荐输出中每条附 `id`，用户随后输入的裸 👍/👎（或 "👍 <id>"）关联到最近一次推荐输出中的对应条目。

#### Scenario: 关联正确条目
- **WHEN** 推荐输出含 `id = "test-generator"`，用户随后输入 👍
- **THEN** 系统把 👍 关联到 `test-generator`，而非其他条目

#### Scenario: 显式指定条目
- **WHEN** 用户输入 "👎 react-best-practices"
- **THEN** 系统把 👎 关联到 `react-best-practices`

### Requirement: REQ-FB-003 偏好调整
系统 SHALL 对用户拒绝（👎/跳过）次数多的同类条目降权，降低后续推荐概率；"跳过"与"👎"分别记录，跳过 = 本次不装，👎 = 明确不适用（👎 降权幅度更大）。

#### Scenario: 同类降权
- **WHEN** 用户对 `deploy-helper` 多次 👎 或跳过
- **THEN** 后续推荐中同分类条目排序靠后或不再出现

### Requirement: REQ-FB-004 下次顺带问
系统 MUST 在下次 `/assist` 时，若发现上次启用项，顺带询问"还在用吗？感觉如何？"。为此 profile 需记录上次启用项及时间（`lastEnabledItems`）。

#### Scenario: 顺带询问
- **WHEN** 上次 `/assist` 启用了 `test-generator`（记录在 `lastEnabledItems`），本次再次运行 `/assist`
- **THEN** 系统输出中附带一句对 `test-generator` 的"还在用吗"询问
