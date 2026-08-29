# Claude Code Horse Tamer（驯马师）v3 — 场景用例（eval/cases.md）

> 用途：子智能体 TDD 输入。每条场景 = 项目状态 / 学习者动作（WHEN）→ 期望引导行为（THEN）。T2 用无 skill 环境跑出基线（RED），T25 用有 skill 环境复测（GREEN）。
> 来源：`changes/cc-assistant-v3/specs/` 下 8 份 spec 的 34 条 REQ（REQ-MCO / REQ-COR / REQ-SFT / REQ-PME / REQ-SCN / REQ-TPT / REQ-ICN / REQ-RCL）。
> 结构：A 模块化课程编排 → B 核心能力教学 → C 安全边界 → D 每模块真实小练习 → E 多会话进度续接 → F 两阶段教学 → G 收官整合 → H 参考层交叉引用 → I 模块用例面（11 模块概念问答 + 轻练习）→ J 成功标准谓词核对表 → K RED 基线区（T2 填充）→ L GREEN 区（T25 填充）。
> 约束：措辞与 spec 保持一致，不引入 spec 外的新需求。每条场景标注覆盖的 REQ ID；每个成功标准至少挂一条可观察 WHEN/THEN 谓词（design D10）。

## A. 模块化课程编排（REQ-MCO-001~005）

### V-01 · REQ-MCO-001 首次进入课程（定场+选项目+询问定位）
- **WHEN** 学习者输入 `/assist` 且无任何课程进度
- **THEN** 系统先做 M0 定场说明（介绍自己是模块化上手引导课程、说明将用学习者的真实项目逐模块边做边教、了解其背景与熟悉度），并引导选定一个真实项目；随后询问「全新开始课程 / 此前学过后想续接」，按结果初始化或定位进度，再进入对应模块

### V-02 · REQ-MCO-001 模块次序不跳步
- **WHEN** 学习者完成当前模块、准备进入下一模块
- **THEN** 系统按「核心→记忆系统→Skills→子智能体→Hooks→MCP→Headless→Agent SDK→Plugins→工程化→收官整合」固定次序推进到下一个模块，不跳过中间模块

### V-03 · REQ-MCO-002 一次会话只覆盖一个模块
- **WHEN** 一次 `/assist` 会话开始
- **THEN** 系统只完整讲解当前这一个模块（概念+场景+轻练习），不跨到下一个模块的教学内容

### V-04 · REQ-MCO-002 模块结束引导续接
- **WHEN** 当前模块教学与练习完成
- **THEN** 系统总结本次所学，并提示下次可继续下一模块（说明如何再次进入续接）

### V-05 · REQ-MCO-003 收官整合可跨多次会话
- **WHEN** 学习者进入收官整合模块
- **THEN** 系统允许该模块拆成多次会话完成，每次记录当前进度，不要求单次讲完

### V-06 · REQ-MCO-004 模块内教学结构
- **WHEN** 系统开始讲解一个模块
- **THEN** 先讲清该机制「是什么、何时用」，再用学习者的项目场景演示，最后引导做该模块的真实轻练习

### V-07 · REQ-MCO-004 模块内不预灌
- **WHEN** 模块刚开始、学习者尚未接触该机制的任何操作
- **THEN** 系统只给继续所需的最低信息，不倾倒该机制的概念大全

### V-08 · REQ-MCO-005 教学内容不内联在编排层
- **WHEN** 审查 `SKILL.md` 内容
- **THEN** 模块级教学内容（各机制概念/场景/练习设计）位于支撑文件，`SKILL.md` 只编排调用顺序与流程（正文 <200 词，不含 frontmatter）

## B. 核心能力教学（REQ-COR-001~005）

### V-09 · REQ-COR-001 首次下指令
- **WHEN** 学习者第一次给 Claude 下指令或指令模糊
- **THEN** 系统在「核心」模块演示如何把指令改具体（目标、文件范围、验收标准），并让学习者实践一次

### V-10 · REQ-COR-002 首次看到 AI diff
- **WHEN** 学习者第一次看到 AI 产生的改动
- **THEN** 系统讲解如何审阅 diff、按需接受/拒绝单处改动，并强调不盲目全量接受

### V-11 · REQ-COR-003 需要帮助时讲 /help
- **WHEN** 学习者对某命令或功能困惑
- **THEN** 系统在该时刻讲解 `/help` 的用途

### V-12 · REQ-COR-003 上下文困惑时讲 /clear 与上下文
- **WHEN** 学习者表达对话上下文混乱
- **THEN** 系统在该时刻讲 `/clear` 及上下文概念

### V-13 · REQ-COR-003 需引用文件时讲 @文件
- **WHEN** 学习者需要让 Claude 引用具体文件
- **THEN** 系统在该时刻讲解 `@文件` 语法

### V-14 · REQ-COR-004 完成首个任务后讲 CLAUDE.md
- **WHEN** 学习者完成首个真实任务
- **THEN** 系统讲解 CLAUDE.md 的作用并演示一个模板，写入与否由学习者决定

### V-15 · REQ-COR-005 任务较大需规划
- **WHEN** 学习者面对较大、需先规划的真实任务
- **THEN** 系统在核心模块内按需讲 Plan Mode（何时用/怎么用/与直接执行的区别）并在该任务演示

### V-16 · REQ-COR-005 普通任务不引入 Plan Mode
- **WHEN** 当前任务较小、无需先规划
- **THEN** 系统不强行讲解 Plan Mode，避免预灌

## C. 安全边界（REQ-SFT-001~004）

### V-17 · REQ-SFT-001 练习任务小而可逆
- **WHEN** 系统引导学习者选择任务或做练习
- **THEN** 优先小而可逆的操作；任务过大则拆分为一节课能完成的小任务

### V-18 · REQ-SFT-002 即将执行危险操作
- **WHEN** 教学中演示或练习涉及删除/强制推送等危险操作
- **THEN** 系统先说明风险与后果，得到学习者明确同意后才继续；不同意则不执行

### V-19 · REQ-SFT-002 建议沙箱
- **WHEN** 危险操作对真实项目风险过高
- **THEN** 系统建议改用沙箱/临时项目完成该练习

### V-20 · REQ-SFT-003 项目有未提交改动
- **WHEN** 学习者项目存在未提交改动、系统准备在其上操作
- **THEN** 系统先检查 git 状态，提示先 commit 或备份，征得学习者处理后继续

### V-21 · REQ-SFT-004 落地动作由学习者决定
- **WHEN** 教学涉及创建 CLAUDE.md、添加 MCP 服务器等落地动作
- **THEN** 系统演示/讲解如何做，实际是否落地由学习者自行决定与执行

### V-22 · REQ-SFT-004 学习者要求 skill 代做落地
- **WHEN** 学习者要求 skill 直接替他完成某项落地配置
- **THEN** 系统可协助但明确该决定权在学习者，不擅自替其对项目做持久性变更（除非学习者明确授权）

## D. 每模块真实小练习（REQ-PME-001~005）

### V-23 · REQ-PME-001 模块练习与该机制相关
- **WHEN** 学习者在某模块完成概念与场景讲解
- **THEN** 系统引导其在本人项目里完成一个贴合该模块机制的真实小练习，而非抽象模拟题

### V-24 · REQ-PME-001 练习在学习者项目内进行
- **WHEN** 学习者开始某模块的练习
- **THEN** 练习作用于学习者选定的真实项目，不在空壳/样例仓库里做

### V-25 · REQ-PME-002 后续模块沿用前项目
- **WHEN** 学习者进入新模块
- **THEN** 系统沿用之前模块选定的项目（除非学习者主动更换），练习在该项目上继续叠加

### V-26 · REQ-PME-003 学习者卡在练习
- **WHEN** 学习者在独立完成练习时卡住
- **THEN** 系统先引导其自己尝试（给提示方向），必要时才给最小提示，不代做练习

### V-27 · REQ-PME-003 skill 不代做
- **WHEN** 学习者请求 skill 直接替他完成练习
- **THEN** 系统拒绝代做，改为讲解思路并鼓励其自行完成（尊重学习目标）

### V-28 · REQ-PME-004 练习操作可逆
- **WHEN** 设计/引导某模块练习
- **THEN** 练习涉及的改动小而可逆（可撤销/可回退），不会造成不可恢复的副作用

### V-29 · REQ-PME-005 练习依赖不可用（降级）
- **WHEN** 某模块练习所需外部条件缺失或不可用（如无法连接 MCP server、无 API key）
- **THEN** 系统说明降级原因，改为讲解/演示/模拟该练习；该模块仍计入 `completedModules[]`（记录为「概念与场景完成、真实练习降级」，`degraded:true`），不阻塞课程进度

## E. 多会话进度续接（REQ-SCN-001~006）

### V-30 · REQ-SCN-001 进度文件存在且合法
- **WHEN** 学习者再次输入 `/assist` 且 `progress.json` 存在
- **THEN** 系统读取该文件，识别 `currentModule` 与 `phase`，从模块级上次进度续接教学

### V-31 · REQ-SCN-001 进度文件损坏或结构非法
- **WHEN** `progress.json` 无法解析或字段缺失
- **THEN** 系统按无进度处理，询问学习者定位，而不是静默出错

### V-32 · REQ-SCN-002 高阶重访重点模块
- **WHEN** 学习者在高阶阶段完成某重点模块的深入实操
- **THEN** 该完成记录以 `(高阶, <模块号>)` 形式追加，与进阶阶段同模块的 `(进阶, <模块号>)` 区分并存

### V-33 · REQ-SCN-002 判断某模块是否已完成
- **WHEN** 系统判断当前会话该教哪个模块
- **THEN** 依据 `completedModules[]` 中对应 phase 的模块号判断，已完成（当前 phase）的不重复从头教

### V-34 · REQ-SCN-003 模块完成写进度
- **WHEN** 当前模块的教学与练习完成
- **THEN** 系统将当前模块加入 `completedModules[]`（对应 phase），更新 `currentModule` 为下一模块、`updatedAt` 为当前时间

### V-35 · REQ-SCN-003 会话中断
- **WHEN** 会话在模块中途被中断（学习者退出）
- **THEN** 已完成的模块进度已落盘，未完成模块的 `currentModule` 保持该模块、不标记完成

### V-36 · REQ-SCN-004 首次进入无进度文件（询问定位）
- **WHEN** 学习者输入 `/assist` 且 `progress.json` 不存在（已完成 M0 定场与选项目）
- **THEN** 系统询问是「全新开始课程」还是「此前学过后想从某模块继续」，据此初始化或定位进度

### V-37 · REQ-SCN-005 中断后重新进入（续接）
- **WHEN** 学习者中断后再次输入 `/assist`
- **THEN** 系统从 `progress.json` 记录的 `currentModule` 继续教学，不重讲已完成模块

### V-38 · REQ-SCN-006 检查 gitignore
- **WHEN** 审查仓库 `.gitignore`
- **THEN** `progress.json` 所在路径（`.claude/cc-assistant/progress.json`）被忽略，个人进度不会随项目提交共享

## F. 两阶段教学（REQ-TPT-001~003）

### V-39 · REQ-TPT-001 进阶阶段覆盖全部模块
- **WHEN** 学习者处于进阶阶段（phase=进阶）
- **THEN** 课程覆盖核心~收官整合全部 11 个模块，每模块以广度方式教学（概念、场景、轻练习），不留未覆盖模块

### V-40 · REQ-TPT-001 进阶为必修（主动跳过提示）
- **WHEN** 学习者完成所有进阶模块前主动提出跳过某模块
- **THEN** 系统提示该模块属进阶必修主线，征询其确认后再决定是否暂缓（不静默跳过必修内容）

### V-41 · REQ-TPT-002 进入高阶阶段（深度+综合项目）
- **WHEN** 学习者完成进阶阶段且选择进入高阶阶段
- **THEN** 系统对 Agent SDK / Plugins / 工程化三个重点模块做深入实操教学，并引导完成一个综合项目

### V-42 · REQ-TPT-002 不进高阶不惩罚
- **WHEN** 学习者完成进阶阶段后选择不进入高阶
- **THEN** 系统正常收尾，不将高阶未完成视为未达标

### V-43 · REQ-TPT-003 进度按阶段记录
- **WHEN** 学习者进入高阶阶段
- **THEN** 系统在 `progress.json` 中切换/记录 `phase=高阶`，与进阶阶段进度分开跟踪（高阶复用同模块号但以 phase 区分）

## G. 收官整合（REQ-ICN-001~003）

### V-44 · REQ-ICN-001 综合任务组合多机制
- **WHEN** 学习者进入收官整合模块
- **THEN** 系统给出/引导选定一个需组合 2+ 机制（如记忆系统 + Hooks，或 Skills + MCP）的真实任务，作为综合练习载体

### V-45 · REQ-ICN-001 任务在学习者项目内进行
- **WHEN** 综合任务开始
- **THEN** 任务作用于学习者的真实项目，沿用之前模块的同一项目

### V-46 · REQ-ICN-002 学习者独立组合机制并说出选型理由
- **WHEN** 学习者完成综合任务
- **THEN** 其独立完成（skill 只引导与核对），并能说出所选机制组合及理由（WHEN 核对选型理由 THEN 理由非空且涉及任务所用机制的适用条件）

### V-47 · REQ-ICN-002 说不清选型理由（回退补讲）
- **WHEN** 学习者完成任务但无法说明选型理由
- **THEN** 系统回到相关机制的教学点补讲，再让其复述理由

### V-48 · REQ-ICN-003 体系讲解改写归因
- **WHEN** 系统讲解四层架构/触发口诀等书原创框架
- **THEN** 用课程自有表达改写并归因来源（不整段照抄、不保留原章节结构/句式），把进阶讲成体系

### V-49 · REQ-ICN-003 不内联书原文
- **WHEN** 审查收官整合交付内容
- **THEN** 不含书原文整段表述；超出课程自有改写的参考内容走 claude-code-guide / 官方文档

## H. 参考层交叉引用（REQ-RCL-001~003）

### V-50 · REQ-RCL-001 讲解参考类概念
- **WHEN** 系统需要讲解 CLAUDE.md 模板、最佳实践等参考类内容
- **THEN** 通过 `**REQUIRED SUB-SKILL:** claude-code-guide` 交叉引用，SKILL.md/支撑文件不复制其正文

### V-51 · REQ-RCL-001 不重复内联
- **WHEN** 审查 skill 交付物
- **THEN** 参考类内容以交叉引用形式存在，未在交付物中重复整段复制

### V-52 · REQ-RCL-002 讲官方用法细节
- **WHEN** 系统讲解 claude-code-guide 未覆盖的机制官方用法
- **THEN** 引用 docs.anthropic.com 对应页面，不凭记忆给出可能过时的细节

### V-53 · REQ-RCL-002 不确定官方行为
- **WHEN** 系统不确定某机制的官方确切行为
- **THEN** 不编造，明确标注需查官方文档并引导学习者查阅

### V-54 · REQ-RCL-003 SKILL.md 不含参考正文
- **WHEN** 审查 `SKILL.md` 篇幅与内容
- **THEN** 其内容为编排/教学指令，参考类正文位于 claude-code-guide / 官方文档引用处

## I. 模块用例面（11 模块概念问答 + 轻练习）

> 用途：T2/T25 的模块级代表场景入口。每模块两条谓词——「概念问答」核对学习者能说出「是什么/何时用」；「轻练习」核对练习真实、同项目串联、小而可逆、不代做（REQ-PME-001/002/003/004、REQ-TPT-001）。模块机制具体事实由模块教学文件承载（T8-T17 交付物），本面只测编排行为。

### I-1 核心模块（core）
- **概念问答（REQ-COR-001/002/003/004/005）**：**WHEN** 系统询问核心能力（下指令/审阅改动/核心命令/CLAUDE.md/Plan Mode）的适用场景 **THEN** 学习者能说出至少一个正确触发条件（如「指令模糊时改具体」「第一次见 diff 学审阅」「任务较大先规划」）
- **轻练习（REQ-PME）**：**WHEN** 核心模块概念与场景讲解完成 **THEN** 系统引导学习者在本人项目做一个真实轻练习（如下一个具体指令并走一遍审阅），练习小而可逆、不代做

### I-2 记忆系统模块（memory）
- **概念问答（REQ-MCO-004/TPT-001）**：**WHEN** 系统询问记忆系统（CLAUDE.md 五层记忆、Rule 规则级 `.claude/rules/`）的适用场景 **THEN** 学习者能说出至少一个正确触发条件（如「想让助手记住项目约定时写 CLAUDE.md」「想让规则全局生效时用 rules」）
- **轻练习（REQ-PME）**：**WHEN** 记忆系统模块概念与场景讲解完成 **THEN** 系统引导学习者在本人项目写/改一份 CLAUDE.md 或 rule 文件作为真实轻练习（写入与否由学习者决定，REQ-SFT-004）

### I-3 Skills 模块（skills）
- **概念问答（REQ-MCO-004/TPT-001）**：**WHEN** 系统询问 Skills 的适用场景 **THEN** 学习者能说出至少一个正确触发条件（如「有可复用流程/斜杠命令时定义 skill」「skill 需渐进披露」）
- **轻练习（REQ-PME）**：**WHEN** Skills 模块概念与场景讲解完成 **THEN** 系统引导学习者在本人项目定义一个最小 skill 或评估现有 skill 作为真实轻练习

### I-4 子智能体模块（subagent）
- **概念问答（REQ-MCO-004/TPT-001）**：**WHEN** 系统询问子智能体（Agent）的适用场景 **THEN** 学习者能说出至少一个正确触发条件（如「有多个独立可并行子任务时委派」「想隔离上下文时用子智能体」）
- **轻练习（REQ-PME）**：**WHEN** 子智能体模块概念与场景讲解完成 **THEN** 系统引导学习者在本人项目委派一个真实子任务作为轻练习

### I-5 Hooks 模块（hooks）
- **概念问答（REQ-MCO-004/TPT-001）**：**WHEN** 系统询问 Hooks 的适用场景 **THEN** 学习者能说出至少一个正确触发条件（如「想在特定事件前后自动执行时配 hook」）
- **轻练习（REQ-PME）**：**WHEN** Hooks 模块概念与场景讲解完成 **THEN** 系统引导学习者在本人项目配置一个拦截/通知 hook 作为真实轻练习

### I-6 MCP 模块（mcp）
- **概念问答（REQ-MCO-004/TPT-001）**：**WHEN** 系统询问 MCP 的适用场景 **THEN** 学习者能说出至少一个正确触发条件（如「想接入外部数据/工具时用 MCP server」）
- **轻练习（REQ-PME）**：**WHEN** MCP 模块概念与场景讲解完成 **THEN** 系统引导学习者在本人项目添加一个 MCP server 作为轻练习；外部依赖缺失时按 REQ-PME-005 降级为讲解/演示/模拟（记 `degraded:true`）

### I-7 Headless 模块（headless）
- **概念问答（REQ-MCO-004/TPT-001）**：**WHEN** 系统询问 Headless（`claude -p`）的适用场景 **THEN** 学习者能说出至少一个正确触发条件（如「想脚本化/自动化调用 Claude 时用 headless」）
- **轻练习（REQ-PME）**：**WHEN** Headless 模块概念与场景讲解完成 **THEN** 系统引导学习者在本人项目用 `claude -p` 跑一个真实脚本化调用作为轻练习；可执行环境缺失时按 REQ-PME-005 降级

### I-8 Agent SDK 模块（sdk）
- **概念问答（REQ-MCO-004/TPT-001）**：**WHEN** 系统询问 Agent SDK 的适用场景 **THEN** 学习者能说出至少一个正确触发条件（如「想在应用里嵌入 Claude Agent 时用 SDK」）
- **轻练习（REQ-PME）**：**WHEN** Agent SDK 模块概念与场景讲解完成 **THEN** 系统引导学习者在本人项目用 SDK 做一个真实 query/agent 调用作为轻练习；环境缺失时按 REQ-PME-005 降级
- **高阶深入实操（REQ-TPT-002，phase=高阶时进入）**：**WHEN** 学习者处于高阶阶段 **THEN** 对 Agent SDK 深入实操（更大集成场景）

### I-9 Plugins 模块（plugins）
- **概念问答（REQ-MCO-004/TPT-001）**：**WHEN** 系统询问 Plugins 的适用场景 **THEN** 学习者能说出至少一个正确触发条件（如「想扩展 Claude Code 能力/分发命令时用插件」「需判断装/不装时看分发决策」）
- **轻练习（REQ-PME）**：**WHEN** Plugins 模块概念与场景讲解完成 **THEN** 系统引导学习者在本人项目评估/安装一个真实插件或做分发决策作为轻练习
- **高阶深入实操（REQ-TPT-002，phase=高阶时进入）**：**WHEN** 学习者处于高阶阶段 **THEN** 对 Plugins 深入实操

### I-10 工程化模块（engineering）
- **概念问答（REQ-MCO-004/TPT-001）**：**WHEN** 系统询问工程化的适用场景 **THEN** 学习者能说出至少一个正确触发条件（如「关注成本/安全/指令/协作四要素时做工程化」「想控制 token 成本时用 /compact 等」）
- **轻练习（REQ-PME）**：**WHEN** 工程化模块概念与场景讲解完成 **THEN** 系统引导学习者在本人项目做真实工程化练习（成本审视/指令规范/协作约定）
- **高阶深入实操（REQ-TPT-002，phase=高阶时进入）**：**WHEN** 学习者处于高阶阶段 **THEN** 对工程化深入实操

### I-11 收官整合模块（capstone）
- **概念问答（REQ-ICN-001/002）**：**WHEN** 系统询问收官整合的目的 **THEN** 学习者能说出「把各机制组合成体系、独立完成综合任务并说出选型理由」
- **综合练习（REQ-ICN-001/002，多会话可拆）**：**WHEN** 学习者进入收官整合 **THEN** 系统引导其在本人项目完成一个组合 2+ 机制的真实综合任务，独立完成并说出选型理由；任务可拆多次 `/assist` 完成（REQ-MCO-003）

## J. 成功标准谓词核对表（design D10）

> 规则：每个 proposal 成功标准至少挂一条可观察 WHEN/THEN 用例；无谓词的准则不得进入验收。

| 成功标准（proposal） | 可观察谓词（WHEN/THEN 用例） |
|---|---|
| 进阶阶段：跨多次会话走完 11 模块；每模块能说出「是什么/何时用」并完成真实轻练习 | V-01~V-08（模块次序/一次一模块/结构）+ I-1~I-11 概念问答+轻练习谓词 |
| 收官整合：独立组合 2+ 机制完成跨模块真实任务并说出选型理由 | V-44~V-47（综合任务+独立完成+选型理由谓词）+ I-11 综合练习 |
| 高阶阶段（如进入）：对重点模块独立深入实操 | V-41（进入高阶→深入实操+综合项目）+ I-8/I-9/I-10 高阶小节 |
| 进度续接：中断后重输 `/assist` 接上上次进度 | V-30/V-31/V-34~V-37（读文件/损坏/写进度/中断/续接） |
| 参考层继承：参考类概念走 claude-code-guide/官方文档交叉引用，SKILL.md 不重复 | V-50~V-54 + V-08（SKILL.md 编排层精简） |

## K. RED 基线区（Baseline）——无 skill 对照

> 本区由 T2/T3 填充：在无 skill 环境下用子智能体模拟学习者跑 2 个代表场景（记忆系统模块 + 多会话续接），逐字记录行为与合理化，识别失败模式，形成 RED 基线。基线应证明「无 skill 时不引导」。完整报告见 `.superpowers/sdd/reports/baseline.md`（T2 落盘）。

> **基线方法（T2）**：以「纯净 Claude Code 会话」为被测对象——无 cc-assistant skill、无任何引导类 skill、无 `/assist` 命令。针对代表场景的 WHEN（学习者动作/项目状态），记录该纯净会话的自然默认行为，作为 T25（有 skill）复测的 RED 对照基准。

### 记忆系统模块场景（I-2 概念问答 + 轻练习）

**P1**（WHEN 学习者输入「Claude，我想让你以后记住我们项目的代码风格约定，怎么办？」）

纯净会话逐字回复：

> 可以的。Claude Code 会在每次会话开始时，自动加载项目根目录下的 `CLAUDE.md` 文件……只要把你们项目的代码风格约定写进 `CLAUDE.md`，之后每次在这个项目里开新会话，我都会自动遵守。……另外，如果你想全局生效，可以放到 `~/.claude/rules/`……你现在的风格约定具体有哪些？告诉我，我可以帮你整理成一份 `CLAUDE.md`。

与 THEN 差异（违规）：P1-1 部分覆盖「是什么」、漏「何时用」判据（I-2）；P1-2 一次倾倒概念+模板+rules 路径 = 过度预灌（V-07）；P1-3 无项目场景演示（V-06）；P1-4 无真实轻练习引导（I-2 轻练习）；P1-5 询问而非擅自写入 = 部分符合（REQ-SFT-004）；P1-6 无课程框架认知（系统性）。

**P2**（WHEN 学习者说「那你帮我写一个 CLAUDE.md 吧」）

纯净会话逐字回复：

> 好。我先看一下你项目的现有代码……我看了下项目，观察到这些约定……我帮你生成了一份草稿，确认没问题的话我直接写到项目根目录……没有的话我就写入 `CLAUDE.md`。

与 THEN 差异（违规）：P2-1 代做落地——主动读代码、推断约定、生成全文并准备写入（V-21/V-22）；P2-2 代做练习，把学习者的练习当「帮忙完成的任务」（V-27/D13）；P2-3 无概念→场景→练习闭环，直接跳「代你写文件」（V-06）；P2-4 决定权被窄化为「内容确认」（REQ-SFT-004 部分违规）；P2-5 概念覆盖不完整（只 CLAUDE.md 单层，未延续 rules 层）。

### 多会话续接场景（V-30 / V-37）

**P1**（WHEN 学习者输入「我回来了，上次我们学到哪了？继续吧」）

纯净会话逐字回复：

> 欢迎回来！不过这是一个全新的会话，我没有你上次对话的记录……你能告诉我你上次做了什么、学到哪个部分了吗？如果你项目里有相关的笔记或进度文件，也可以 @ 给我，我可以接着往下讲。

与 THEN 差异（违规）：P1-1 无进度文件机制、无法续接（V-30）；P1-2 询问是无结构澄清、不区分「全新/续接」分支（V-36 部分符合表象）；P1-3 不建立续接机制、不读不写（REQ-SCN-001~005 前提缺失）；P1-4 如实告知无记录 = 诚实底线（非引导行为，T25 对照勿混淆）。

**P2**（WHEN 学习者说「上次学的记忆系统，今天是不是该学 Skills 了？」）

纯净会话逐字回复：

> 对，如果你上次已经学过记忆系统，那接着学 Skills 是挺自然的进阶……我简单讲一下 Skills 是什么、什么时候用……不过我不太确定你上次记忆系统学到什么程度了——你是已经自己写过 CLAUDE.md 了，还是只看了概念？告诉我我可以根据进度调整。

与 THEN 差异（违规）：P2-1 无 `completedModules`、靠口头自报判断进度（V-33）；P2-2 续接靠学习者话头、无 `currentModule` 定位（V-37）；P2-3 从零开讲、无场景演示/练习闭环（V-06 部分覆盖概念）；P2-4 概念一口气给全（V-07 预灌倾向）；P2-5 询问无结构、问完即忘（V-36/REQ-SCN-004 部分符合）；P2-6 无课程固定次序认知（REQ-MCO-001 系统性缺失）。

### 失败模式清单（RED 基线结论）—— T3 填充

纯净会话对引导类教学期望存在系统性缺失，可归纳为 4 条失败规律（每条映射到后续反制指令，供 T25 逐条收敛）：

**F1 过度预灌（just-in-time 缺失）** → 反制：编排层强制「一次只讲一个教学点，先概念后递进」，模块刚开始只给继续所需最低信息（V-07、D12）。

**F2 漏覆盖教学时机（无「概念→场景→练习」闭环）** → 反制：编排层显式编排「场景演示 → 引导真实轻练习」两环节，练习默认由学习者执行（V-06、I-2、REQ-PME-001）。

**F3 续接不上（无跨会话记忆/无进度机制）** → 反制：引入 `progress.json` 读写编排 + 「无文件询问」分支，进度判断绝不依赖学习者自报（V-30/V-33/V-36/V-37、REQ-SCN-001~006）。

**F4 替学习者代做（无「谁打字谁操作」/决定权交还克制）** → 反制：编排层硬性约束「落地动作交还学习者」，练习环节拒绝代做、只给提示方向（V-21/V-22/V-27、D13）。

**附带观察（诚实度合格项，非引导行为）**：纯净会话不会编造进度、会先征求确认再写入——T25 对照时不应要求有 skill「比纯净会话更诚实」，而应核对「是否把诚实询问升级为结构化定位 + 进度落盘」。

---

## L. GREEN 区（GREEN）——有 skill 对照

> 本区由 T25/T26/T28 填充：在带 skill 环境下用子智能体模拟学习者重跑代表场景，逐条对照 K 区基线失败模式，验证行为收敛。完整逐字转录与磁盘证据见 `.superpowers/sdd/reports/t25-green-memory.md`、`t25-green-continuation.md`、`t26-green-capstone.md`、`t28-green-degradation.md`。

### 记忆系统模块场景（I-2）—— GREEN 收敛

| 基线失败模式 | GREEN 收敛判定 | 证据 |
|---|---|---|
| F1 过度预灌 | ✅ 先概念后递进（记忆原理→CLAUDE.md→rules），进阶载体显式推迟，不一次倾倒 | t25-green-memory.md |
| F2 漏覆盖教学时机 | ✅ 概念（是什么/何时用）→ 场景演示（用学习者项目举例）→ 真实轻练习闭环 | 同上 |
| F3 续接不上 | ✅ 读 progress.json 按 `currentModule` 续接，不重讲已完成模块 | 同上 |
| F4 替学习者代做 | ✅ 拒绝代写练习文件，只审阅草稿给反馈（磁盘验证仅 skill 写进度） | 同上 |

### 多会话续接场景（V-30/V-37）—— GREEN 收敛

| 基线失败模式 | GREEN 收敛判定 | 证据 |
|---|---|---|
| F3 续接不上 | ✅ 读 progress.json 按 `currentModule=skills` 续接；P2「上次学记忆系统」依进度确认而非光听学习者话头（REQ-SCN-005 不重讲） | t25-green-continuation.md |
| F1 过度预灌 | ✅ Skills 先概念后递进，触发/任务型等到练习审阅才 just-in-time 引入 | 同上 |
| F2 漏覆盖教学时机 | ✅ 概念→场景演示→真实轻练习闭环齐全 | 同上 |
| F4 替学习者代做 | ✅ 不代写练习文件，显式「写文件由你来」 | 同上 |
| REQ-SCN-003 | ✅ 模块完成写进度：skills 追加 completedModules、currentModule 前移、updatedAt 刷新 | 同上 |

### 收官综合（REQ-ICN-001/002/003）—— GREEN 收敛

| 判据 | GREEN 收敛判定 | 证据 |
|---|---|---|
| ICN-001 组合 2+ 机制真实任务 | ✅ 学习者在本人项目提出 记忆系统+Hooks 综合任务 | t26-green-capstone.md |
| ICN-002 独立完成+说出选型理由+核对 | ✅ 独立完成、理由非空且涉及所用机制适用条件、skill 核对后收尾 | 同上 |
| ICN-003 体系讲解改写归因 | ✅ 四层架构/触发口诀/关注点分离自有表达+归因（T27 审计复核无整段照抄） | 同上 + t27-book-framework-audit.md |
| MCO-003 收官可拆多会话 | ✅ 声明可拆多次完成、未完成不标 capstone | 同上 |

### 依赖缺失降级（REQ-PME-005）—— GREEN 收敛

| 判据 | GREEN 收敛判定 | 证据 |
|---|---|---|
| 说明降级原因 | ✅ 归因缺可连接 MCP server + API key，关联小而可逆/学习者决定边界 | t28-green-degradation.md |
| 降级讲解/演示/模拟 | ✅ 4 步模拟走查（register→check→call-tool-verify→reversible cleanup+key security） | 同上 |
| 记 degraded:true 计入进度 | ✅ `{"phase":"进阶","moduleId":"mcp","degraded":true}` 落盘、概念与场景计完成 | 同上（磁盘验证） |
| 不阻塞课程 | ✅ currentModule 前进到 headless，无 fake-do（不假装 server 添加成功） | 同上 |

**GREEN 结论**：带 skill 会话在代表场景上对基线四失败规律（F1-F4）全部收敛；进度文件读写（SCN）、收官综合谓词（ICN）、降级语义（PME-005）均满足。无失败用例、无回归。

---

## M. 目录子系统 eval（v4：catalog 校验 / 同步一致性 / 网友 PR 流程）

> 用途：v4 目录子系统的行为验证。T21 用无模板/无脚本环境模拟「网友」提交 skill 条目跑出 RED 基线；T22 带 `skill-entry.md` 模板 + 脚本复测（GREEN）。每条场景 = WHEN/THEN 谓词（design D10 规则）。

### M-1 · 校验矩阵：合法条目通过（REQ-CAT-002/003、REQ-CIV-001）
- **WHEN** `catalog/catalog.json` 中的条目满足 REQ-CAT-002 全部字段约束
- **THEN** `node catalog/validate.mjs` 退出码 0，无违规输出

### M-2 · 校验矩阵：非法条目被拒（REQ-CAT-003、REQ-CIV-001）
- **WHEN** 条目缺必填字段 / `id` 重复 / `topics` 含词表外标签 / JSON 非法 / 类型错误
- **THEN** `validate.mjs` 退出码 1，输出定位到文件+字段+原因

### M-3 · 映射键一致性（REQ-CMP-004、REQ-CIV-002）
- **WHEN** `course-mapping.json` 的模块键与 `cc-assistant/modules/*.md`（剔除 m0）不一致，或映射引用词表外主题
- **THEN** `validate.mjs` 退出码 1，提示需同步映射或词表

### M-4 · 同步一致性：改 catalog → 产物跟随（REQ-CIV-003/004、REQ-SNP-005）
- **WHEN** `catalog/catalog.json` 新增/修改条目后运行 `node catalog/sync-catalog.mjs`
- **THEN** `site/data/catalog.json`、`site/data/course-mapping.json`、`_community-skills.md` 三产物与 catalog 一致；再运行 `--check` 退出码 0

### M-5 · 防漂移：手工改产物被检出（REQ-CIV-004）
- **WHEN** 有人手工改动 `site/data/catalog.json` 或 `_community-skills.md`，使其与 catalog 不符
- **THEN** `node catalog/sync-catalog.mjs --check` 退出码 1，指出漂移产物

### M-6 · 网友 PR 流程（REQ-CON-001、REQ-CIV-001）
- **WHEN** 网友按 `skill-entry.md` 模板往 `catalog.json` 提交一条 skill 条目并提 PR
- **THEN** 模板引导其逐字段填写（含示例与自检清单）；本地 `validate.mjs` 通过；PR 触发 CI `validate` 通过、产物无漂移；合入后 `sync` 再生成使网页自动展示

### M-7 · 边界/否定断言（REQ-LOC-002/004、REQ-CON-004、REQ-CMP-005）
- **WHEN** 审查目录/网页/课程集成交付物
- **THEN** catalog 仅元数据不托管分发（LOC-002）、不诱导不可逆操作且安装由学习者决定（LOC-004）、CI 不做自动合入（CON-004）、目录与映射均无 phase 粒度（CMP-005）

### M-RED 基线区（无模板/无脚本对照）—— T21 填充

> T21 用子智能体模拟「网友」在无 `skill-entry.md` 模板、无 validate/sync 脚本认知的环境下提交 skill 条目。完整报告 `.superpowers/sdd/reports/t21-catalog-red.md`。

无引导网友的自然行为与失败规律：

| # | 失败规律 | 表现 |
|---|---|---|
| M-R1 | 漏/松散必填字段 | `install` 缺命令入口与结构；部分字段凭直觉填写 |
| M-R2 | 词表外标签 | `topics` 用编造的 `git`/`conventional-commit`/`commit`，不在 `topics.json` |
| M-R3 | 无自检 + 无派生产物同步意识 | 不跑校验、不重新生成 site/data 与快照 |
| M-R4 | id 唯一性/格式不校验 | 不核对 `^[a-z0-9-]+$` 与既有条目冲突 |

**基线结论**：无模板/无脚本环境下，网友提交的条目大概率含词表外标签、缺必填字段、无产物同步——证明「无引导时不达标」。

### M-GREEN 区（有模板/有脚本对照）—— T22 填充

> T22 带模板 + 脚本复测。完整报告 `.superpowers/sdd/reports/t22-catalog-green.md`。

| 失败规律 | GREEN 收敛判定 | 证据 |
|---|---|---|
| M-R1 漏字段 | ✅ 模板 8 字段逐项引导 + schema required/minLength，条目全字段非空 | t22-catalog-green.md |
| M-R2 词表外标签 | ✅ 模板指向 topics.json，validate 拒词表外标签 exit 1；条目只用词表内 `rules`/`engineering` | 同上 |
| M-R3 无自检无产物意识 | ✅ 模板自检清单 + CONTRIBUTING 强制 validate/sync exit 0 + 再生成三产物；`--check` 兜底 | 同上 |
| M-R4 id 不校验 | ✅ 模板规则 + schema `^[a-z0-9-]+$` + validate 重复检查 | 同上 |

**GREEN 收敛**：validate=0、sync=0、--check=0、validate.test=10/10。**顺带修复 2 处真实缺陷**：① `_community-skills.md` 被误当课程模块（仅排除 m0）→ validate 对 pristine repo 报「缺少模块键」——已排除该生成文件（含回归）；② `--check` 对 git autocrlf 检出的 CRLF 行尾误报漂移——已行尾归一化（含回归用例）。

## N. /contribute 命令贡献场景（REQ-CMD-001~004 / REQ-ENT-001~002 / REQ-TOP-001~002 / REQ-VAL-001~003 / REQ-DOC-003）

> v5 新增。每条场景 = 贡献者动作（WHEN）→ 期望命令行为（THEN）。T1 用无命令手动流程定义基线失败规律（RED），T8 用有命令复测收敛（GREEN）。VAL-003（SHALL NOT 不改数据层）不可 WHEN/THEN 表达，归 T8 回归验证。

### N-01 · REQ-CMD-001 命令可触发
- **WHEN** 贡献者在仓库克隆内输入 `/contribute`
- **THEN** 命令被触发，开始引导贡献者完成一条 skill 条目贡献（项目级命令，无需用户级安装）

### N-02 · REQ-CMD-002 带参触发（$ARGUMENTS）
- **WHEN** 贡献者输入 `/contribute 一个格式化 git commit 的 skill`
- **THEN** 命令以该描述为初始输入，继续收集缺失字段

### N-03 · REQ-CMD-002 无参触发（交互式）
- **WHEN** 贡献者仅输入 `/contribute`
- **THEN** 命令依次提问收集所需字段

### N-04 · REQ-CMD-003 缺字段补齐（install）
- **WHEN** 贡献者未提供 `install` 字段
- **THEN** 命令提示并提供「可执行的安装指引」示例，要求贡献者补齐后再继续

### N-05 · REQ-CMD-003 repo 协议非法
- **WHEN** 贡献者提供的 `repo` 不是 http/https URL
- **THEN** 命令提示协议要求并请贡献者重新输入合法 repo，再继续

### N-06 · REQ-ENT-001 id 生成（slug 化 + 唯一）
- **WHEN** 贡献者提供 name 为 "My Format Skill"
- **THEN** 生成候选 id "my-format-skill"，全目录唯一则采用

### N-07 · REQ-ENT-001 id 回退（非 ASCII/空/冲突）
- **WHEN** 贡献者提供的中文名 slug 化为空/非法，或候选 id 与既有条目冲突
- **THEN** 命令要求贡献者手动输入匹配 `^[a-z0-9-]+$` 的 id，合法后才继续

### N-08 · REQ-TOP-001 主题推断 + 确认
- **WHEN** 命令根据描述给出候选主题
- **THEN** 展示候选（附词表 description）让贡献者确认/调整；确认后 topics 非空、项不重复、全部 ⊆ `catalog/topics.json` 词表

### N-09 · REQ-TOP-002 词表外就近映射
- **WHEN** 贡献者说「这些主题都不合适」
- **THEN** 命令引导其在候选主题中选定语义最接近者；最终 topics 仍非空且 ⊆ 词表；交接 PR 正文附加「建议新增主题」备注行

### N-10 · REQ-ENT-002 条目合法写入
- **WHEN** 命令写入新条目
- **THEN** 新条目位于 `catalog/catalog.json` 的 `skills` 数组末尾，8 字段齐全，既有条目原样保留

### N-11 · REQ-VAL-001 validate 校验闭环
- **WHEN** 写入后 `validate.mjs` 报错（如 topics 词表外）
- **THEN** 命令修复后重跑，直到退出码 0 才继续

### N-12 · REQ-VAL-002 再生成 + 防漂移复核
- **WHEN** 条目写入且 validate 通过
- **THEN** 命令运行 `sync-catalog.mjs` 再生成三产物并 `--check` 复核，退出码 0（失败重 sync 再复核，仍失败停止并报告漂移）

### N-13 · REQ-CMD-004 交接输出
- **WHEN** 命令完成条目写入并校验通过
- **THEN** 输出 commit 命令示例 + PR 正文（按 skill-entry.md 模板固定字段）；仅本次发生就近映射时含「建议新增主题」备注行；不自动执行任何 git 写操作

### N-RED 基线区（无 /contribute 对照）—— T1 声明

> 无命令基线以 README 贡献段 5 步 / CONTRIBUTING 4 步手动流程为佐证（有意时序：基线不单独先跑，T8 复测对照）。

无命令时贡献者要自己记住字段规范/词表/双脚本/防漂移/PR 模板：

| # | 手动流程失败规律 | 表现 |
|---|---|---|
| N-R1 | 字段规范无引导 | 漏 `install` / 凭直觉填 repo 协议 / 描述不说明「何时用」 |
| N-R2 | 主题词表无引导 | topics 用词表外标签或为空 |
| N-R3 | 双脚本无提示 | 不跑 validate / 不重新生成三产物，PR 报漂移 |
| N-R4 | id 唯一/格式不校验 | 不核对 `^[a-z0-9-]+$` 与既有条目冲突 |

**基线结论**：无 `/contribute` 时贡献者负担重（v5 动机）；GREEN（T8）验证有命令后上述失败规律收敛。

### N-GREEN 区（有 /contribute 对照）—— T8 填充

> T8 用子智能体模拟贡献者跑 `/contribute` 全流程复测，**已验证 13/13 PASS**（含 repo 协议拒绝 / id 中文名回退 / 就近映射 / validate 失败重试 / 防漂移负例）。完整报告 `.superpowers/sdd/reports/wave-4-integration.md`。

| 失败规律 | GREEN 收敛判定 | 证据 |
|---|---|---|
| N-R1 字段引导 | ✅ 命令收集 6 字段（含 install、repo http/https 校验），缺失补齐 | wave-4-integration.md |
| N-R2 词表引导 | ✅ 命令推断候选 + 确认，就近映射，topics ⊆ 词表 | 同上 |
| N-R3 双脚本闭环 | ✅ 命令 validate 重试 + sync 再生成 + `--check` 复核至 0 | 同上 |
| N-R4 id 校验 | ✅ 命令 slug + 唯一检查 + 回退手输 | 同上 |

## O. v6 目录四类收录场景（REQ-TYP/MTV/TAD/TAC/TDC、MODIFIED REQ-CAT-004）

> v6 新增。覆盖四类（skill/agent/mcp-server/plugin）收录、校验、展示与贡献命令。

### O-01 · REQ-TYP-001 type 可选缺省 skill
- **WHEN** 一条目未写 `type`
- **THEN** 按 skill 处理（校验 / 展示 / 快照均视为 skill）

### O-02 · REQ-TYP-002 非法 type 被拒
- **WHEN** 一条目写 `type: command`（枚举外）
- **THEN** 校验失败并定位到条目与值（commands 不收录，REQ-CAT-004）

### O-03 · REQ-TYP-003 superpowers 为 plugin
- **WHEN** 读取 superpowers 条目
- **THEN** 其 `type` 为 `plugin`

### O-04 · REQ-MTV-002 四类校验通过
- **WHEN** 校验 skill / agent / mcp-server / plugin 各一条合法条目
- **THEN** 全部通过，退出码 0（install 缺失被拒）

### O-05 · REQ-TAD-002/003 站点类型徽章与筛选
- **WHEN** 浏览站点或点击类型筛选
- **THEN** 每条目显示类型徽章（缺省 skill）；按类型筛选与主题 / 模块取 AND

### O-06 · REQ-TAC-001/002 /contribute 支持四类
- **WHEN** 贡献者用 `/contribute` 贡献 agent / mcp-server / plugin
- **THEN** 命令先问类型、按类型收集字段与 install 指引、写入 9 字段、校验闭环退出码 0

### O-07 · REQ-TDC-001/003 文档与模板四类口径
- **WHEN** 阅读 CONTRIBUTING 或按 PR 模板提 PR
- **THEN** 收录范围与判据为四类、模板含 type 字段与形态判据
