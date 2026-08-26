# 模块 3：Skills（skills）

> 把「可复用的流程/斜杠命令」固化成 Claude Code 的 skill。核心主题 = Skills 工程。

## 是什么 / 何时用

- **Skill**：一个包含 `SKILL.md` 的目录（`.claude/skills/<名称>/SKILL.md`）。`SKILL.md` 用 YAML Frontmatter 声明 name、description 等，正文编排能力。
- **触发**：显式 `/skill-name` 或 Claude 按 description 语义自动匹配。
- **渐进式披露**：description（常驻）→ SKILL.md 正文（触发时加载）→ reference/ 引用文件（执行时按需读）。避免一次加载全部内容。
- **任务型 vs 参考型**：有副作用（自动提交、删除）的任务 → 任务型（`disable-model-invocation: true` 手动触发）；纯参考/分析 → 参考型（自动触发）。
- **allowed-tools**：白名单限定 skill 可用工具；`Bash(*)` 几乎等于无防线，高危 skill 严禁。

**何时用（触发判据，D12）**：有反复要做的流程/斜杠命令 → 定义 skill；流程有副作用 → 任务型；只读分析 → 参考型。

## 场景演示

- 从学习者项目里找一个「反复做」的场景（如重复的代码审查、固定格式的输出），讨论它是否值得固化成 skill。
- 演示 skill 的最小结构：目录 + SKILL.md + description 怎么写（写给 Claude 的「语义指纹」）。
- 讲渐进式披露：大 skill 如何分层，避免一次性把内容灌进正文。

## 真实轻练习

- 学习者在自己的项目里定义一个最小 skill（如一个固定输出格式的小命令），并测试它的触发（REQ-PME-001）。
- 交互模型（D13）：由学习者动手；卡住给提示方向；不代做。
- 小而可逆（REQ-PME-004）：新建目录/文件，可删除。
- 若学习者项目不适合建 skill → 换一个合适的真实载体，仍做真实轻练习（design 第 3 轮 LOW：不因无场景跳过/降级练习）。

## 社区好 skill

- 本模块主题（`skills`）相关社区 skill 见本地快照 `_community-skills.md` 的 §skills；只读本地快照、不联网（REQ-LOC-001），安装与否由学习者决定（REQ-LOC-004）。

## 交叉引用

- skill 编写规范与最佳实践：**REQUIRED SUB-SKILL:** claude-code-guide。
- Skills 官方文档（未覆盖时）：引用 docs.anthropic.com。
