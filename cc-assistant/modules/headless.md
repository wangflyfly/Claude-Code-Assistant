# 模块 7：Headless 模式（headless）

> 用 `claude -p` 以非交互方式脚本化/自动化调用 Claude。核心主题 = Headless 与自动化。

## 是什么 / 何时用

- **Headless 模式**：`claude -p "任务"` 非交互运行，适合 CI/CD、脚本、Unix 管道集成。
- **关键参数**：`--output-format`（text/json/stream-json）、`--max-turns` 与 `--max-budget-usd`（成本护栏，防失控）、`--allowedTools`/`--disallowedTools`（安全边界）、`--model`/`--fallback-model`（模型与降级）、`--append-system-prompt`。
- **安全**：`--dangerously-skip-permissions` 名称不是装饰，CI 中严禁（除非隔离容器）；生产用白名单 `--allowedTools`。
- **会话管理**：`--resume $SESSION_ID` 跨步骤继承上下文、`--continue` 续最近会话。

**何时用（触发判据，D12）**：想脚本化/自动化调用 Claude（CI 检查、批处理、管道）→ 用 Headless；一行 Shell 能描述的逻辑 → Headless（更复杂再用 Agent SDK）。

## 场景演示

- 从学习者项目里找一个适合自动化的任务（如 PR 自动审查、批量格式化、`cat log | claude -p` 语义分析）。
- 演示 `claude -p` 一次真实调用，讲输出格式与成本护栏参数。
- 讲安全：为何 CI 中要配 `--allowedTools` 白名单、`--max-budget-usd`。

## 真实轻练习

- 学习者在自己的项目里用 `claude -p` 跑一个真实脚本化调用（如管道分析一段文本/代码），并配好成本护栏（REQ-PME-001）。
- **依赖缺失降级（REQ-PME-005）**：若无可用可执行环境/权限受限 → 讲解/演示/模拟，记 `degraded: true`。
- 交互模型（D13）：由学习者动手；卡住给提示方向；不代做。
- 小而可逆（REQ-PME-004）：调用只读、无副作用；避免在真实项目上跑破坏性命令。

## 社区好 skill

- 本模块主题（`headless`）相关社区 skill 见本地快照 `_community-skills.md` 的 §headless；只读本地快照、不联网（REQ-LOC-001），安装与否由学习者决定（REQ-LOC-004）。

## 交叉引用

- Headless/CLI 用法：**REQUIRED SUB-SKILL:** claude-code-guide。
- CLI 官方文档（未覆盖时）：引用 docs.anthropic.com。
