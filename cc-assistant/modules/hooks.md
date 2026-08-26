# 模块 5：Hooks（hooks）

> 在 Claude Code 的事件点自动触发脚本/校验，把「应做」变成「强制」。核心主题 = Hooks 事件驱动自动化。

## 是什么 / 何时用

- **Hooks**：在事件（会话开始/结束、工具调用前后、停止时等）自动触发的处理程序。与 CLAUDE.md/Skills 的「建议」不同，Hooks 是系统执行层强制（能否阻止是关键维度）。
- **常用事件**：`PreToolUse`（工具调用前，可 allow/deny/改输入）、`PostToolUse`（调用后，观察/审计）、`Stop`（完成时，质量门控）、`SessionStart`（会话开始，注入环境）。
- **3 种处理器**：`command`（跑 Shell 脚本，最可靠）、`prompt`（小型模型单次语义判断）、`agent`（子智能体多轮验证）。按「command→prompt→agent」降级选型。
- **典型用途**：危险命令拦截、敏感文件保护、提交前检查、保存后格式化、测试质量门控。

**何时用（触发判据，D12）**：有必须强制执行的检查/拦截（如危险命令、敏感文件、提交前校验）→ 配 Hook；只想观察记录 → 用 PostToolUse 只读审计。

## 场景演示

- 从学习者项目里找一个值得「强制」的检查点（如提交前 lint、保护 .env 文件）。
- 演示一个最小 Hook 配置（settings.json 或项目 `.claude/settings.json`），讲事件选择与处理器类型。
- 讲安全边界：改 settings.json 后 Hook 不立即生效，需在 /hooks 确认或重启会话（常见陷阱）。

## 真实轻练习

- 学习者在自己的项目里配置一个拦截/通知 Hook（如 PreToolUse 保护某个敏感文件，或 Stop 质量检查），并验证触发（REQ-PME-001）。
- 交互模型（D13）：由学习者动手；卡住给提示方向；不代做。
- 小而可逆（REQ-PME-004）：配置可随时移除；测试 Hook 用无害命令。
- 若项目不适合配 Hook → 换合适真实载体，仍做真实轻练习。

## 社区好 skill

- 本模块主题（`hooks`）相关社区 skill 见本地快照 `_community-skills.md` 的 §hooks；只读本地快照、不联网（REQ-LOC-001），安装与否由学习者决定（REQ-LOC-004）。

## 交叉引用

- Hooks 参考（事件清单、配置格式）：**REQUIRED SUB-SKILL:** claude-code-guide。
- Hooks 官方文档（未覆盖时）：引用 docs.anthropic.com。
