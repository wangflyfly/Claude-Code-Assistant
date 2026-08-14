# Design: CC Assistant v1

## Context

- **现状**：无实现代码。已有需求文档（`cc助手需求.md`）、术语表（`CONTEXT.md`）、真实目录数据（`cc-assistant/data/`）。
- **平台约束**：Claude Code 无定时器、无首次自动触发；写文件/跑命令每次触发权限确认；斜杠命令能跑 git/读文件，但看不到浏览器/编辑器。
- **交付约束**：Skill + 薄斜杠命令（非插件）；v1 = 核心闭环 5 模块。
- **隐私约束**：本地只读，永不回传。
- **利益相关者**：开发者（用户本人）+ 新手/个人开发者（目标用户）。
- **开发自测**：用已安装的 skill-creator 评测 harness（`run_eval` / grader）自测 CC Assistant 的触发准确性与输出质量。

## Goals

- 用 Skill + 斜杠命令实现核心闭环，让 `/assist` 在真实项目跑通「扫描 → 识别 → 推荐 → 代劳启用 → 反馈」。
- 目录真实可安装、两层可配置；推荐诚实（无虚构数字）。
- 双维度引导（用户等级 × 项目意图），新手默认简单。
- 全程本地、零上传。

## Decisions

### D1: 引擎 = 自然语言指令，非代码
- **Choice**：Scanner/Matcher/Recommender/Health/Feedback 的逻辑写在 `SKILL.md` 的自然语言指令里，Claude 运行时执行，不写编译代码。
- **Rationale**：CC Assistant 是 Skill 不是程序；"引擎"是给 Claude 读的行为指令。写代码增加复杂度、偏离 Skill 形态。
- **Alternatives**：用 Python 脚本实现引擎逻辑。缺点：需维护运行环境、与 Skill 形态割裂。仅在需要确定性计算（JSON 合并、评分）时用少量脚本辅助。

### D2: 交付形态 = Skill + 薄斜杠命令
- **Choice**：`SKILL.md` + `.claude/commands/*.md`（`/assist`、`/assist health`、`/assist apply`、`/feedback`）。命令文件内容是"触发 cc-assistant skill 执行对应流程"的指令。
- **Rationale**：skill-creator 产出 Skill；斜杠命令是入口。比插件轻，符合"基于 skill-creator 开发"。
- **Alternatives**：插件（plugin.json）。缺点：更重、需市场/仓库、skill-creator 不产插件。

### D3: 两层可配置目录
- **Choice**：内置 `recommendations.json`（打包）+ 自定义 `custom-recommendations.json`（用户维护），运行时按 `id` 合并，自定义覆盖内置。
- **Rationale**：默认精选与用户自选分离，升级不覆盖用户自定义。
- **Alternatives**：单文件目录。缺点：升级覆盖用户改动。

### D4: 数据分层存储
- **Choice**：用户级 `~/.claude/cc-assistant/profile.json`（经验等级、反馈历史、`visitHistory`、`lastEnabledItems`）+ 项目级 `.claude/cc-assistant/project.json`（技术栈、项目意图、已启用、已跳过）。
- **Rationale**：经验/反馈跨项目共享，技术栈/已启用项目隔离。
- **Alternatives**：全放项目级。缺点：换项目丢经验等级和反馈。

### D5: 运行时路径解析
- **Choice**：安装后数据在 `~/.claude/skills/cc-assistant/data/`、命令在 `~/.claude/commands/`。运行时用"安装后路径"读目录、写规则；SKILL.md 内用相对于 skill 根目录的路径引用自己的 data 文件。
- **Rationale**：源仓库路径（`cc-assistant/data/`）≠ 安装后路径；写死源路径会导致安装后找不到文件。
- **Alternatives**：硬编码源仓库路径。缺点：安装后失效。

### D6: id 映射（去重正确性）
- **Choice**：目录条目的 `id` == 安装后的 skill 目录名（`~/.claude/skills/<id>/`）。Scanner 按目录名匹配 `id` 判定"已启用"。
- **Rationale**：去重依赖"已启用"判定；目录名即 id 最简单可靠。
- **Alternatives**：维护 id→目录名映射表。缺点：增加维护，且 `npx skills add` 的实际目录名不可控。

### D7: 单轮命令交互
- **Choice**：输出推荐 → 用户回一个动作命令（`/assist apply` / 👍👎 / skip），不做自由对话、不做探索者模式。
- **Rationale**：默认简单、避免过载；丰富交互 P1 延后。
- **Alternatives**：多轮对话式交互。缺点：需语义理解，v1 过度设计。

### D8: 场景识别 = 加权信号 + 优先级决胜
- **Choice**：各场景算加权得分，达阈值进候选，得分最高者胜；并列按 `testing > bug-fix > new-feature > docs > refactor`。单时点采样，无信号回退 newbieDefaults。
- **Rationale**：解决场景重叠误判 + 信号时间错配。
- **Alternatives**：规则树 / 机器学习。缺点：v1 过度设计。

### D9: 健康度 = 启发式评分
- **Choice**：基础 20，Skill +5（上限 30）、Rule/Hook +3（上限 15）、综合 +5；等级 优秀≥65 / 良好45-64 / 待改进25-44 / 需关注<25；Hook 与综合 v1 恒 0。
- **Rationale**：让四档真实可达，空项目=需关注、装满=优秀。
- **Alternatives**：基础 60（原方案）。缺点：低分档不可达、空项目已"良好"。

### D10: 代劳执行机制
- **Choice**：`/assist apply` 代劳 = 用 Bash 执行目录条目的 `installCmd`（装 Skill）、用 Write 工具写 `.claude/rules/<id>.md`（写规则）；逐项 best-effort，单项失败不影响其余，最后汇总"未完成项"。
- **Rationale**：平台只有这两种执行手段；best-effort 避免一项失败卡死整个流程。
- **Alternatives**：一次失败即中止。缺点：一个坏条目阻塞所有安装。

### D11: 扫描命令合并
- **Choice**：Scanner 尽量合并扫描为最少 Bash 调用（一次拿到 git status + 文件列表 + 特征文件内容），减少权限弹窗次数。
- **Rationale**：每次 Bash 都弹权限确认，合并可显著降低新手摩擦。
- **Alternatives**：每个信号单独跑命令。缺点：多次弹窗，体验差。

## Risks And Trade-Offs

- **权限摩擦**：每次扫描/安装/写规则都弹确认。v1 接受，靠清晰说明缓解。
- **单快照限制**：`/assist` 点采样，抓不到时间序列，场景可能误判。靠置信度 + 无信号回退兜底。
- **目录真实性**：依赖人工挑选真实条目；`webapp-testing` 的 installCmd 未实测（`verified:false`）。
- **自然语言指令的脆弱性**：引擎逻辑靠 Claude 理解执行，不如代码确定。靠清晰指令 + 少量脚本（JSON 合并、评分）辅助。
- **两层合并的冲突**：自定义覆盖内置，若用户误改 id 可能意外。靠 id 去重 + 文档说明。
- **反馈解析的脆弱性**："解析用户随后输入的 👍/👎"依赖用户紧跟输入。靠 SKILL.md 明确输入约定（裸 👍/👎 紧跟推荐输出 = 对最近一条）降低误判。
