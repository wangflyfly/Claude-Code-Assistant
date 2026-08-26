# 模块 8：Agent SDK（sdk）

> 用 SDK 把 Claude 嵌进自己的应用，从「使用 Claude Code」变成「构建以 Claude 为引擎的应用」。核心主题 = Agent SDK。

## 是什么 / 何时用

- **Agent SDK**（`claude-agent-sdk`，Python/TypeScript）：编程方式调用 Claude Agent。
- **核心 API `query(prompt, options)`**：返回消息流（异步生成器），可流式处理，不是一次性结果。
- **`ClaudeAgentOptions`**：把 CLI 参数变编程接口——model、max_turns、max_budget_usd、allowed_tools、permission_mode、system_prompt 等。
- **权限模式**：default / acceptEdits / plan（只读）/ bypassPermissions（仅限隔离容器，否则等于给 Claude 任意命令权限）。
- **自定义工具**：注册自己的工具（进程内 MCP 服务器）；工具内做零信任参数校验，别信 Claude 传入的参数。

**何时用（触发判据，D12）**：需要在应用里嵌入 Claude Agent（产品功能、自动化流程）→ 用 SDK；需要 if/else 或循环的逻辑 → 用 SDK（比 Headless CLI 适合复杂控制流）。

## 场景演示

- 从学习者项目里找一个「把 Claude 嵌进应用」的真实场景（如一个脚本/服务里调用 query 做分类/摘要）。
- 演示 `query()` 最小调用：发 prompt、遍历消息流、读 result 的 subtype。
- 讲权限模式与安全：默认先最小权限；bypassPermissions 绝不用于真实环境。

## 真实轻练习

- 学习者在自己的项目里用 SDK 写一个真实 `query` 调用（如读一段输入、返回结构化结论），并设好 max_turns/max_budget（REQ-PME-001）。
- **依赖缺失降级（REQ-PME-005）**：若 SDK/API key/环境不可用 → 讲解/演示/模拟，记 `degraded: true`。
- 交互模型（D13）：由学习者动手；卡住给提示方向；不代做。
- 小而可逆（REQ-PME-004）：新建脚本/文件，可删除；API key 由学习者自己管理（SFT-004）。

## 高阶深入实操（可选，phase=高阶时进入）

- 进阶阶段只做最小 `query` 调用（广度）。高阶阶段（REQ-TPT-002）深化：自定义工具注册、结构化输出、权限模式切换、处理错误重试与成本追踪——在学习者项目里做一个更大的集成场景。

## 社区好 skill

- 本模块主题（`sdk`）相关社区 skill 见本地快照 `_community-skills.md` 的 §sdk；只读本地快照、不联网（REQ-LOC-001），安装与否由学习者决定（REQ-LOC-004）。

## 交叉引用

- Agent SDK 参考：**REQUIRED SUB-SKILL:** claude-code-guide。
- Agent SDK 官方文档（未覆盖时）：引用 docs.anthropic.com。
