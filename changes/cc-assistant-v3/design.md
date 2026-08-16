# Design: CC Assistant v3（模块化上手引导课程）

## Context

- **现状**：v2 是「任务驱动·单会话引导」，一次 `/assist` 在一个真实任务里教核心能力与按需进阶，无法系统覆盖 Harness 全能力。
- **约束**：交付形态为 Claude Code Skill + 薄斜杠命令 `/assist`（非插件、非编译代码）；遵循 `docs/skill-development-spec.md`（description SDO、token 精简、TDD 开发）；参考层走 claude-code-guide / 官方文档，不内联复制；书框架（四层架构/触发口诀/关注点分离/选型决策树）按「书框架复用边界」改写为自有表达并归因；安装到用户级 `~/.claude/skills/cc-assistant/`。
- **相关方**：学习者（有开发经验、不会 Claude Code 的开发者）、引导者（Claude 运行时按 SKILL.md 编排）、课程维护者。
- **目标能力**（8 项，来自 proposal/specs）：模块化课程编排、多会话进度续接、每模块真实小练习、两阶段教学、收官整合、参考层交叉引用、安全边界、核心能力教学。

## Goals

- 一次 `/assist` 教 1 个单机制模块，多会话渐进续接，中断后能接上进度。
- 进阶阶段（必修）覆盖全部 11 模块；高阶阶段（可选）对 Agent SDK / Plugins / 工程化深入实操。
- 每模块在学习者真实项目里带一个该模块场景的小练习；收官整合组合 2+ 机制。
- SKILL.md 编排层精简（<200 词目标），模块教学内容在支撑文件。
- 全程本地、零上传；危险操作先征得同意；落地由学习者决定。

## Decisions

### D1 交付形态：编排层 + 支撑文件
**Choice**：`SKILL.md` 只承载课程编排（M0 定场→模块次序→会话流程→续接→安全边界），模块教学内容拆分到 `modules/<module>.md` 支撑文件。
**Rationale**：模块教学内容属 skill-development-spec §2 的**重型参考**类——每模块的教学指令/场景/练习设计超 100 行，符合「重型参考（100+ 行）拆独立文件」的拆分场景；短原则（just-in-time、一次一件事、安全边界）内联在 SKILL.md；支撑文件由 SKILL.md 按模块引导读取（渐进式披露，模块未轮到不加载）。拆分后 SKILL.md 达成 D2 的 <200 词目标，模块内容独立演进。
**Alternatives**：全内联（违反 token 规范且 SKILL.md 远超 §2 内联边界）；每模块做成独立 skill（跨模块进度串联复杂，且污染技能命名空间）。

### D2 SKILL.md 字数档位
**Choice**：按「高频加载」目标，SKILL.md 正文 <200 词。
**Rationale**：`/assist` 进入即加载编排层，token 每个都算数；模块内容在支撑文件，编排层只需流程指令。
**Alternatives**：按「其他 skill」<500 词（可接受但更重）。

### D3 progress.json 编码
**Choice**：结构 `{phase, completedModules[], currentModule, updatedAt}`；`completedModules` 元素为对象 `{phase, moduleId, degraded?}`。
**Rationale**：两阶段复用同模块号、以 `phase` 区分；`degraded` 标记承载 REQ-PME-005 降级场景（记录「概念与场景完成、真实练习降级」）；对象形式可扩展、语义明确。
**Alternatives**：纯字符串对 `"进阶:核心"`（无法表达降级标记）；嵌套 `{phase: {moduleId: {degraded}}}`（过度设计）。
**约束**：`phase ∈ {进阶, 高阶}`；`moduleId` 用模块短名（core/memory/skills/subagent/hooks/mcp/headless/sdk/plugins/engineering/capstone）；`degraded: true` 表示该模块真实练习降级（对应 REQ-PME-005：外部依赖缺失→讲解/演示/模拟），概念与场景学习仍视为完成并计入进度。

### D4 模块内 checkpoint 粒度
**Choice**：不引入模块内 checkpoint；续接为模块级（REQ-SCN-001），中断后重进从当前模块开头做概念回顾后直接进练习。
**Rationale**：一次 `/assist` 只教 1 个模块，模块内中断重来的成本低（概念回顾+练习），引入模块内 checkpoint 增加实现与状态复杂度，收益小。
**Alternatives**：模块内 checkpoint 细化（需求更高，proposal 留 design，此处决策不引入）。

### D5 每模块会话编排
**Choice**：每模块按「概念（是什么/何时用）→ 场景 → 真实轻练习 → 写进度 → 引导续接」推进；just-in-time，不预灌整篇教材。
**Rationale**：继承 v2 教学闭环的「学到即用到」价值，模块内一次讲透一个机制；just-in-time 防过度预灌。
**Alternatives**：按模块线性讲解后再统一练习（割裂「学到即用到」）。

### D6 首次进入流程
**Choice**：无进度时先 M0 定场+选项目，再询问「全新开始 / 此前学过后想续接」，按结果初始化或定位，进入对应模块（REQ-MCO-001 ↔ REQ-SCN-004）。
**Rationale**：把「无文件 ≈ 无进度」与「可能学过但文件丢失」区分开，避免凭空假设进度。
**Alternatives**：无文件一律从核心开始（可能让曾学过的学习者重复）。

### D7 依赖缺失降级
**Choice**：模块练习依赖外部条件（MCP server / API key / Headless / Agent SDK 环境）缺失时，降级为讲解/演示/模拟，该模块记 `degraded: true` 计入 `completedModules[]`，不阻塞课程（REQ-PME-005）。
**Rationale**：保持「真实小练习」价值的同时，不让环境依赖阻塞课程进度；降级显式记录便于学习者日后补做。
**Alternatives**：强制真实练习（环境不具备时卡死）；静默跳过练习（丢失记录，违反可验证）。

### D8 参考层与收官整合体系讲解
**Choice**：参考类内容走 `**REQUIRED SUB-SKILL:** claude-code-guide` + docs.anthropic.com；收官整合的体系讲解（四层架构/触发口诀/关注点分离/选型决策树）改写为自有表达并归因，不内联书原文。
**Rationale**：SKILL.md 不重复复制参考内容（token + 单一事实源）；书框架改写归因满足版权边界，同时保留体系价值。
**Alternatives**：仅内部设计输入不出现（丢失体系讲解价值）；原样引用书框架（违反版权边界）。

### D9 会话与安全继承
**Choice**：安全边界（真实任务小而可逆/危险操作先征得同意/未提交改动先 commit 或备份/必要时建议沙箱/学习者决定权）与核心教学（下指令/审阅改动/核心命令/CLAUDE.md）继承 v2；Plan Mode 由 v2 进阶能力**迁移**到核心模块内按需教学点；v2 其余进阶能力（Skill/Rule/Hook、MCP、Agent/子智能体）**演化**为 v3 独立课程模块，按模块化形态重排。
**Rationale**：v2 已验证的安全与核心教学价值直接延续，避免重复设计。
**Alternatives**：推翻重写（丢失 v2 已验证的防 LLM 失败约束）。

### D10 TDD 验证
**Choice**：按 skill-development-spec 重构 `cc-assistant/eval/cases.md` 为模块化用例面（每模块概念+轻练习场景、多会话续接场景、收官综合场景），用子智能体模拟「学习者」跑无 skill 基线 vs 有 skill 行为对比。
**Rationale**：技能类 skill 用压力/变体场景验证行为差异（skill-development-spec §11）；每个主观成功标准映射到可观察 eval 谓词——如「能说出选型理由」→ 学习者完成综合任务后，skill 核对学习者是否主动给出理由、且理由涉及该机制适用条件（判据：理由非空 + 与任务所用机制匹配）；「能说出是什么/何时用」→ 模块概念问答判据（WHEN 询问该机制适用场景 THEN 学习者回答出至少一个正确触发条件）。规则：每个 Success Criterion 至少挂一条有 WHEN/THEN 的 eval 用例，无谓词的准则不得进入验收。
**Alternatives**：无 TDD 直接写（违反 skill-development-spec 铁律）。

### D11 两阶段组织
**Choice**：进阶阶段覆盖全部 11 模块（每模块概念+场景+轻练习，广度）；高阶阶段复用同一批模块支撑文件、以 `phase=高阶` 区分，对重点模块（Agent SDK/Plugins/工程化）加「深入实操」深化小节，综合项目作为收官的高阶延伸任务。
**Rationale**：复用模块文件避免重复编写；`phase` 字段（D3）区分两阶段进度，`completedModules` 记录 `(phase, moduleId)` 对；进阶必修主线、高阶可选深化，符合 REQ-TPT-001/002。
**Alternatives**：高阶另建独立模块文件（内容重复、维护双份）；高阶并入进阶（失去深度可选价值）。

### D12 「按需」触发判据
**Choice**：进阶阶段为必修主线，**全部 11 模块的概念与场景必讲**（REQ-TPT-001 不留未覆盖）；「按需」判据决定**模块内教学点的引入与否与讲解深度**——模块级覆盖不受按需影响，模块内教学点（如 Plan Mode 是否引入）仍可按需决定（REQ-COR-005）；任务较大需先规划→讲 Plan Mode 用法；遇到可复用重复任务/规范→深入 Skill/Rule/Hook 实操；需接入外部数据/工具→深入 MCP 实操；有多个独立可并行子任务→深入子智能体实操；模块练习依赖外部条件缺失→降级（REQ-PME-005）。模块必讲概念/场景；练习无适用场景时**换用合适载体，仍做真实轻练习**——「降级」严格限定于外部依赖缺失（REQ-PME-005）一个来源，不因无场景跳过/降级练习。
**Rationale**：把「按需」从软描述变为可判定规则（防 LLM 过度预灌），同时不牺牲必修全覆盖——判据管「模块内教学点的引入与深度」，模块级覆盖固定为全部 11 模块。
**Alternatives**：仅「按需」字样（无判据，LLM 执行随意）；判据决定整模块跳过（违背 REQ-TPT-001 必修覆盖）；固定顺序全教（违背 just-in-time）。

### D13 交互模型（谁打字谁操作）
**Choice**：演示/讲解由 skill 负责，练习由学习者动手；学习者请求 skill 代做练习时拒绝并给提示方向（REQ-PME-003）。降级场景（D7）只降练习形式为讲解/演示/模拟，**仍不得替学习者完成可动手的练习**；学习者卡住时先引导其自行尝试，必要时才给最小提示。
**Rationale**：这是引导类 skill 的核心交互契约——「只做不教、替学习者代做」是 LLM 默认失败模式，需显式反向抵消（skill-development-spec §12）；与「学习者决定权」「独立完成」成功标准一致。
**Alternatives**：让 skill 在练习中也主导（学习者变旁观，失去独立完成价值）；无约束（LLM 倾向高效代做，练不到学习者）。

- **多会话续接依赖学习者主动再输 `/assist`**：若学习者长期中断，进度仍在 progress.json，重进可续接；文件丢失由「询问」兜底（D6）。
- **模块内容量大**：11 模块支撑文件 token 成本高；拆分后 SKILL.md 精简，模块文件按需由编排层引导读取（渐进式披露）。
- **书框架改写归因的执行一致性**：LLM 可能照抄原章节结构/句式；用「书框架复用边界」判定标准（不整段照抄、不保留原章节结构/句式）约束，eval 用例覆盖。
- **高阶可选**：部分学习者只走进阶；收官整合（进阶必修）已覆盖体系整合价值，高阶为深化延伸，不强求。
- **真实小练习依赖真实项目**：练习质量依赖学习者项目匹配度；D7 降级兜底环境依赖，项目不匹配时由安全边界（任务选择）缓解。
- **SKILL.md <200 词与编排复杂度**：编排层可能显得精简到「缺上下文」；以支撑文件承载模块细节，SKILL.md 只放流程与跳转，用 eval 验证编排完整性。

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
