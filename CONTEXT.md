# CONTEXT

CC Assistant（Claude Code 智能效率教练）的领域词汇表。只收录已敲定的规范术语，不含实现细节。

## 核心概念

- **CC Assistant**：一个 Claude Code 扩展，扫描项目环境、识别工作场景、向用户推荐并启用能提升效率的工具。

- **推荐项（recommendable item）**：CC Assistant 会推荐给用户的东西，分两类：
  - **安装类（installable）**：有真实市场 / 安装命令的条目 —— **Skill**（`npx skills add` / 插件）和 **MCP**（`claude mcp add` / `.mcp.json`）。
  - **配置类（config）**：没有市场、由 CC Assistant 直接生成内容写入的东西 —— **Rule**（写入 `.claude/rules/*.md` 的 markdown）和 **Hook**（写入 settings.json `hooks` 字段的内联命令）。

  > 注：早期文档的"四维能力体系（Skill / Rule / Hook / MCP）"已废弃——四者并不对等，Rule 和 Hook 不是可安装条目。

- **场景（scenario）**：用户当前正在做的工作类型（写新功能 / 修 Bug / 写测试 / 代码审查 / 写文档 / 部署 / 数据库操作 / 项目初始化 / 重构），由 Matcher 从环境信号推断。

- **目录 / 精选集（catalog）**：CC Assistant 推荐的工具清单，分两层可配置——内置目录（`recommendations.json`，随 Skill 打包）+ 自定义目录（`custom-recommendations.json`，自行维护），运行时按 `id` 合并。v1 只收录真实存在且可安装的条目。

- **经验等级（experience level）**：`beginner` → `intermediate` → `advanced` → `expert`。与项目意图共同决定推荐层级；按可测条件进阶（启用数 + 回访 + 反馈）。

- **项目意图（project intent）**：`learning` / `personal` / `engineering`，由 Scanner 从文件信号识别（CI、测试、Dockerfile 等）。决定推荐工具的上限。

- **健康度（health score）**：0-100 分的启发式指标，衡量项目配置的完整度。激励性指标，非客观基准；不包含社区对比。

- **反馈（feedback）**：用户对推荐项的评价（👍 / 👎 + 可选文本），用于调整后续推荐。
