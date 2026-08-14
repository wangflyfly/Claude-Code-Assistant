# Proposal: CC Assistant v1

## Why

Claude Code 用户（尤其新手和个人开发者）面临"发现难 / 匹配难 / 配置难 / 过载难 / 评估难"：不知道有哪些 Skill/规则/Hook 可用、当前场景该用什么、怎么配置启用、自己配置是否健康。现有环境只给基础对话，用户要么靠自己摸索、要么信息过载。需要一个本地工具，扫描项目环境、识别工作场景、推荐并代劳启用合适的工具，用反馈持续优化。

## What Changes

新增一个 Claude Code Skill `cc-assistant`（skill-creator 规范产出），配薄斜杠命令（`/assist` 等），实现核心闭环：

- **Scanner**：技术栈识别、已有配置扫描、可检测场景信号、项目意图识别（学习/个人/工程化）
- **Matcher**：场景识别（只留本地可检测信号）
- **Recommender**：内置+自定义两层目录合并（按 id 去重）、简单规则排序、双维度引导（用户等级 × 项目意图）、新手过滤
- **Health Check**：0-100 启发式评分 + 等级 + 缺失诊断
- **Feedback Loop**：👍/👎、偏好调整、下次顺带问
- **代劳启用**（`/assist apply`）：装 Skill / 写规则，启用前产品级显式确认

## Scope

### In

- Skill 本体（`SKILL.md`）+ 薄斜杠命令（`.claude/commands/`）
- 核心闭环 5 模块
- 两层可配置目录：`recommendations.json`（内置真实目录 + `scenarios` 场景映射）+ `custom-recommendations.json`（自定义，按 id 合并）
- 本地分层数据：用户级 `~/.claude/cc-assistant/profile.json` + 项目级 `.claude/cc-assistant/project.json`，永不回传
- 代劳启用：装 Skill / 写规则（项目级 `.claude/rules/`），启用前产品级显式确认

### Out

- MCP 助手、社区Hub、Subagent、定时推送、快速初始化、Skill 创建助手
- 任何网络上传 / 跨用户聚合
- 插件（plugin.json）形态
- 推荐 MCP（v1 不推荐）
- 探索者模式 / 丰富交互（搜索、完整列表、"为什么"、自定义权重）—— v1 仅单轮命令交互（`/assist apply` / 👍👎 / skip）
- 配置管理（`/assist config`）与快速摘要（`/assist quick`）—— P1 延后，v1 仅 4 命令

## Impact

- 新增目录：`cc-assistant/`（`SKILL.md`、`commands/`、`data/`）
- 新增数据文件：`recommendations.json`（真实目录 + `scenarios`）、`custom-recommendations.json`
- 运行时数据：`~/.claude/cc-assistant/profile.json`、`.claude/cc-assistant/project.json`
- 开发依赖：`skill-creator`（已安装）；运行时依赖：`npx skills add`（安装推荐 Skill）

## Capabilities

- 环境扫描（Scanner）
- 场景识别（Matcher）
- 智能推荐（Recommender）
- 健康度评分（Health Check）
- 反馈学习（Feedback Loop）
- 代劳启用（`/assist apply`）
