# 模块 6：MCP（mcp）

> 让 Claude 接入外部数据源与工具。核心主题 = MCP 集成。

## 是什么 / 何时用

- **MCP（Model Context Protocol）**：Claude 与外部数据源/工具的标准集成协议（「AI 时代的 USB-C」）。一次标准实现，多处复用。
- **服务器暴露 3 类能力**：Tools（Claude 主动调用的函数）、Resources（只读数据）、Prompts（可复用提示词模板）。
- **传输方式**：stdio（本地进程，默认）、HTTP（远程，OAuth 认证）。本地选 stdio、远程选 HTTP。
- **添加方式**：`claude mcp add` 或项目 `.mcp.json` 配置。
- **安全**：MCP 服务器能执行授权范围内任何操作 → 用只读账号、最小权限、信任评估（评估 MCP 服务器 ≈ 评估依赖包）；密钥放环境变量、不进配置文件。

**何时用（触发判据，D12）**：需要实时外部数据/工具（数据库、GitHub、内部 API）→ 接入 MCP server；只凭 Claude 内置知识不够 → 接外部源。

## 场景演示

- 从学习者项目里找一个「需要外部数据/工具」的真实场景（如查数据库、操作 GitHub Issue）。
- 演示添加一个 MCP server（`claude mcp add` 或 `.mcp.json`），讲三种能力与传输方式。
- 讲安全边界：只读账号、密钥放环境变量、信任评估。

## 真实轻练习

- 学习者在自己的项目里添加一个 MCP server（本地 stdio 或远程 HTTP），并调用它的一个工具验证可用（REQ-PME-001）。
- **依赖缺失降级（REQ-PME-005）**：若无可用 MCP server / 无法连接 → 讲解/演示/模拟该练习，记 `degraded: true`，概念与场景仍计入完成。
- 交互模型（D13）：由学习者动手；卡住给提示方向；不代做。
- 小而可逆（REQ-PME-004）：添加/移除 server 可撤销；敏感凭证由学习者自己决定存放（SFT-004）。

## 交叉引用

- MCP 概念与配置：**REQUIRED SUB-SKILL:** claude-code-guide。
- MCP 官方文档（未覆盖时）：引用 docs.anthropic.com。
