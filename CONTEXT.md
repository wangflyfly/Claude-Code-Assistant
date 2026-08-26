# CONTEXT

CC Assistant（Claude Code 上手引导）的领域词汇表。只收录已敲定的规范术语，不含实现细节。

## 核心概念

- **CC Assistant**：一个 Claude Code 上手引导 skill，给有开发经验但不会用 Claude Code 的开发者，以模块化上手引导课程（多会话渐进续接）边做边教，完成从零基础到能独立干活。课程按功能模块组织，每模块含概念/场景/真实轻练习，练习由学习者动手、skill 不代做。

- **模块课程（module course）**：按功能模块组织的上手引导课程——进阶必修主线覆盖 11 个模块（核心/记忆系统/Skills/子智能体/Hooks/MCP/Headless/Agent SDK/Plugins/工程化/收官整合），一次 `/assist` 教 1 个单机制模块，多会话渐进续接（进度存项目级 `.claude/cc-assistant/progress.json`）。编排逻辑写在 `SKILL.md` 的自然语言指令里，由 Claude 运行时执行；教学节奏由 skill 引导，练习与落地交还学习者。

- **教学时机（just-in-time）**：概念只在相关「教学时刻」按需讲解（如第一次进入记忆系统模块才讲 CLAUDE.md 五层记忆），每模块按需讲解、不做课程式预灌整篇教材。

- **交叉引用（claude-code-guide）**：参考类内容用 `**REQUIRED SUB-SKILL:** claude-code-guide` 交叉引用，`SKILL.md` 不重复写参考材料；claude-code-guide 未覆盖的进阶内容（MCP / Plan Mode / Agent 等）引用官方 Claude Code 文档（docs.anthropic.com）。

- **真实轻练习（real micro-exercise）**：每模块配一个与学习者真实项目串联的小练习，由学习者独立完成，作为该模块的成功标准；skill 只演示与核对，失败时回到相关教学点或给最小提示，不代做。收官整合为跨模块综合任务（组合 2+ 机制），完成后学习者说出选型理由。

- **安全边界**：任务选小而可逆的；危险/不可逆操作前先说明风险并征得学习者明确同意，必要时建议沙箱或临时项目；有未提交改动先建议 commit 或备份。

- **学习者决定权**：学习者对自己的项目做决定；演示/讲解可以（如展示如何创建 CLAUDE.md），实际落地（创建文件/安装）由学习者自行决定。

- **进阶能力（advanced capabilities）**：v3 以独立课程模块呈现——Skills、子智能体（Agent）、Hooks、MCP、Headless、Agent SDK、Plugins；Plan Mode 在任务较大需先规划时按需并入核心模块讲；记忆系统（含 Rule 规则级 `.claude/rules/`）为独立模块。按需讲解、不预先灌输。

- **MCP**：进阶能力模块之一——讲解 MCP 是什么、如何添加 server、适用场景（进阶、非必需）；外部依赖缺失时降级讲解/演示/模拟并记 `degraded`。

- **Headless / Agent SDK / Plugins**：进阶能力模块——Headless（`claude -p` 非交互自动化）、Agent SDK（用代码构建 Agent 应用）、Plugins（插件机制与安装分发决策）；高阶阶段可选深入实操，外部依赖缺失时降级。

## 目录子系统（v4）

- **社区 Skill 目录（catalog）**：集中式、机器可读的 Claude Code skill 收录清单，唯一事实源 `catalog/catalog.json`。「catalog」为规范英文词，与文件系统「目录」（directory）区分。本 catalog 与 v1 已删除的推荐目录（recommendations 内置目录）**无恢复关系**。
- **主题标签（topic）**：catalog 条目的分类标签，来自 `catalog/topics.json` 机器可读词表（每主题 `id` + `description`）。
- **课程映射（course mapping）**：课程模块 → 主题标签的映射（`catalog/course-mapping.json`），使目录与课程结构解耦——课程改模块只改映射、catalog 条目不动。
- **快照（snapshot）**：按主题分组的社区 skill 本地快照 `_community-skills.md`，由 `catalog/sync-catalog.mjs` 机器生成、随课程分发，课程运行时不联网。
