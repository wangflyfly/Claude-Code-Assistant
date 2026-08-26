# Spec: Reference Cross-linking（参考层交叉引用）

## ADDED Requirements

### Requirement: REQ-RCL-001 参考类内容走 claude-code-guide
系统 MUST 在讲解参考类概念（CLAUDE.md 模板、最佳实践等）时交叉引用 `**REQUIRED SUB-SKILL:** claude-code-guide`，不内联复制其内容。

#### Scenario: 讲解参考类概念
- **WHEN** 系统需要讲解 CLAUDE.md 模板、最佳实践等参考类内容
- **THEN** 通过 `**REQUIRED SUB-SKILL:** claude-code-guide` 交叉引用，SKILL.md/支撑文件不复制其正文

#### Scenario: 不重复内联
- **WHEN** 审查 skill 交付物
- **THEN** 参考类内容以交叉引用形式存在，未在交付物中重复整段复制

### Requirement: REQ-RCL-002 未覆盖内容引用官方文档
系统 MUST 对 claude-code-guide 未覆盖的进阶参考内容（如 MCP / Plan Mode / 子智能体的官方用法）引用官方文档 docs.anthropic.com，不凭记忆编造。

#### Scenario: 讲官方用法细节
- **WHEN** 系统讲解 claude-code-guide 未覆盖的机制官方用法
- **THEN** 引用 docs.anthropic.com 对应页面，不凭记忆给出可能过时的细节

#### Scenario: 不确定官方行为
- **WHEN** 系统不确定某机制的官方确切行为
- **THEN** 不编造，明确标注需查官方文档并引导学习者查阅

### Requirement: REQ-RCL-003 参考层与教学层分离
系统 MUST 保持「编排/教学」与「参考层」分离：`SKILL.md` 编排流程，参考内容走交叉引用，避免 SKILL.md 膨胀。

#### Scenario: SKILL.md 不含参考正文
- **WHEN** 审查 `SKILL.md` 篇幅与内容
- **THEN** 其内容为编排/教学指令，参考类正文位于 claude-code-guide / 官方文档引用处
