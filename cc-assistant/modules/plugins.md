# 模块 9：Plugins（plugins）

> 把一组能力打包成分发单位，跨项目/团队复用。核心主题 = Plugins 生态与分发决策。

## 是什么 / 何时用

- **Plugin**：打包 Commands、Agents、Skills、Hooks、MCP 配置的「分发单位」。类比 npm/pip：一条命令让一组能力全部就位。
- **结构**：`plugin.json` 必须在 `.claude-plugin/` 子目录；其余功能目录直接在 Plugin 根目录。
- **安装**：`/plugin install`（市场 / URL / 本地目录）；`/plugin list/remove/update` 管理。
- **命名空间**：安装后组件自动加 `plugin-name:` 前缀，团队可放心组合多个 Plugin。
- **分发决策**：单项目 → 项目级 `.claude/`；个人跨项目 → 用户级；跨团队/组织 → Plugin；企业统一 → 组织级 Plugin（版本锁定）。

**何时用（触发判据，D12）**：想扩展 Claude Code 能力/把一组能力打包分发 → 用 Plugin；只服务单个项目 → 不必 Plugin，项目级 `.claude/` 足够。

## 场景演示

- 从学习者项目里讨论：是否有值得打包分发的组合能力（如一组审查命令 + 一个 skill + 一个 hook）。
- 演示 Plugin 的最小结构（plugin.json + 一个组件），讲安装与命名空间。
- 讲分发方式决策表：按「谁用、跨不跨团队」选项目级/用户级/Plugin/组织级。

## 真实轻练习

- 学习者在自己的项目里评估/安装一个真实插件，或做一个分发决策（单项目 vs 插件）并说明理由（REQ-PME-001）。
- 交互模型（D13）：由学习者动手；卡住给提示方向；不代做。
- 小而可逆（REQ-PME-004）：安装/移除插件可撤销；落地由学习者决定（SFT-004）。
- 若学习者项目不适合装插件 → 换合适真实载体，仍做真实轻练习。

## 高阶深入实操（可选，phase=高阶时进入）

- 高阶阶段（REQ-TPT-002）深化：动手做一个最小 Plugin（plugin.json + 一个命令/skill），本地 `--plugin-dir` 实时测试，讲命名空间与分发落地。

## 社区好 skill

- 本模块主题（`plugins`）相关社区 skill 见本地快照 `_community-skills.md` 的 §plugins；只读本地快照、不联网（REQ-LOC-001），安装与否由学习者决定（REQ-LOC-004）。

## 交叉引用

- Plugins 参考：**REQUIRED SUB-SKILL:** claude-code-guide。
- Plugins 官方文档（未覆盖时）：引用 docs.anthropic.com。
