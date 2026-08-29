# Spec: Reference Cross-linking（参考层交叉引用）

## ADDED Requirements

### Requirement: REQ-REF-001 交叉引用 claude-code-guide
系统 MUST 在讲解参考类概念时使用 `**REQUIRED SUB-SKILL:** claude-code-guide` 交叉引用，不重复复制 claude-code-guide 的参考内容到 SKILL.md。

#### Scenario: 讲解 CLAUDE.md 最佳实践
- **WHEN** 需要讲解 CLAUDE.md 模板/最佳实践
- **THEN** 系统引用 claude-code-guide，不自行复制其全文

### Requirement: REQ-REF-002 进阶内容来源
系统 SHALL 对 claude-code-guide 未覆盖的进阶内容（MCP / Plan Mode / Agent 等）按需引用官方 Claude Code 文档（docs.anthropic.com）。

#### Scenario: 讲解 MCP
- **WHEN** 需要讲解 MCP 而 claude-code-guide 无相关内容
- **THEN** 系统引用官方 Claude Code 文档（docs.anthropic.com）
