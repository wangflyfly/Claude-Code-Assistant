# T25 GREEN 跑测报告：记忆系统模块（有 skill 行为对比）

> 场景：fresh 学习者首次 `/assist` → 核心模块 → 再次 `/assist` → 记忆系统模块。
> 基线（RED）已在 `baseline.md` 记录：无 skill 的普通 Claude 会话会过度预灌、跳过场景/练习、无法续接、替学习者代做。
> 本报告验证：装上 `cc-assistant` skill 后，引导是否收敛到预期教学行为（F1-F4）。

---

## 1. Setup

- **skill 安装位置**：`C:/Users/yan/.claude/skills/cc-assistant/`（SKILL.md + `modules/` 12 个模块文件，含 `m0-onboarding.md` / `core.md` / `memory.md`）。通过 Skill tool 触发成功，模块支撑文件按需读取正常。
- **学习者真实项目**：`D:/documents/MyProject/Claude-Code-Assistant/.superpowers/eval-fixture/learner-proj/`
  - `src/utils.js`：`formatUserName` / `buildGreeting`（camelCase）、`const MAX_RETRIES`（UPPER_SNAKE）、2 空格缩进。
- **起始进度**：`.claude/cc-assistant/progress.json` 在开始时**不存在**（`ls` 确认目录不存在），符合 fresh learner 设定。未手动伪造进度，所有进度仅由 skill 动作产生。

---

## 2. Turn-by-turn transcript

### 会话 1：首次 `/assist`

**Learner**（T1）:
> /assist

**Skill 引导（M0 定场，`modules/m0-onboarding.md`）** — 进度定位：读 progress.json → 不存在，走 M0 定场+选项目。

> 你好，我是**模块化上手引导课程**。我会用你自己的真实项目，按功能模块逐模块边做边教。先了解你的情况：开发经验？用过其他 AI 编码工具？对 Claude Code 了解多少？
> 课程形态：11 个模块，每次 `/assist` 只教 1 个单机制模块，每模块一个真实小练习，多会话渐进续接。进度存到项目的 `.claude/cc-assistant/progress.json`，下次自动续接。

**Learner**（选项目）:
> 我有 5 年开发经验，写过 Python 和 JavaScript。没用过 AI 编码工具，对 Claude Code 完全是新手。用我手头的 `learner-proj`，里面有 `src/utils.js`，是真实代码。

**Skill 引导（选项目 + 安全边界）**:
> 就用 `learner-proj` 作为整门课程项目。安全边界：未提交改动先 commit/备份；练习选小而可逆操作。进入课程前问定位：**全新开始** / **此前学过后续接**，你选哪个？

**Learner**:
> 全新开始。

**Skill 引导（初始化 + 进入核心模块）**:
> 好，全新开始。初始化进度：`completedModules: []`，`currentModule` 置首模块「核心」。现在进入**模块 1：核心能力**。

### 核心模块（概念 → 场景 → 练习）

**Skill 引导（概念，单一递进）**:
> 先讲第一个概念，一个一个来，不一次性灌给你：
> **下指令** —— Claude 按指令做事，指令越具体结果越接近预期。有效指令三要素：**目标 + 涉及文件范围 + 验收标准**。指令模糊结果就跑偏。
> 其余概念（审阅改动、核心命令、CLAUDE.md、Plan Mode）到具体场景再逐个讲，现在不用记。

**Skill 引导（场景演示）**:
> 用你的项目演示。`src/utils.js` 有 `formatUserName`、`buildGreeting`、`MAX_RETRIES`。你来下一个真实指令，用上三要素。

**Learner**（练习，自主完成）:
> 让 `buildGreeting` 支持 `lastName, firstName` 顺序。文件范围 `src/utils.js`，验收 `buildGreeting('Jane','Doe',9)` 返回 `"Good morning, Doe, Jane"`。

**Skill 引导（审阅教学 + 引导练习）**:
> 指令三要素齐了。演示**审阅改动**：AI 产 diff 后由你逐处决定接受/拒绝，不盲目全量接受。你自己跑「下指令 → 审阅 → 接受/拒绝」闭环，卡住先自己试，必要时我给最小提示。

**Learner**（练习结果）:
> diff 改 `buildGreeting` 拼接那处我接受；它删了 `formatUserName`（我还要复用）我拒绝；`MAX_RETRIES` 无关空行挪动我也拒绝。

**Skill 引导（核心收尾 + 写进度）**:
> 对，这就是审阅的意义：逐处判断，只接受符合意图的改动。核心模块练习完成。
> 补一个概念：**CLAUDE.md** —— 项目长期记忆文件，每次会话自动加载。模板在 `claude-code-guide` 参考，写入与否由你决定，记忆系统完整教学在下一模块。
> 现在写进度，核心模块完成。

**progress.json（核心完成之后）** — 见 §3「after core」。

### 会话 2：再次 `/assist`（续接）

**Learner**（T5）:
> /assist

**Skill 引导（续接，读进度 → 直接进入记忆系统）**:
> 读 `.claude/cc-assistant/progress.json` → 存在且合法，`currentModule = {phase: 进阶, moduleId: memory}`，`completedModules` 已有 `core`。
> 直接续接**模块 2：记忆系统**，不重讲核心模块。

### 记忆系统模块教学（完整教学回合，不截断）

**Skill 引导（概念：是什么）**:
> 进入记忆系统模块。先讲核心概念，一个点一个点来。
> **记忆系统** —— Claude 每次会话默认只带训练数据和你当前对话的上下文，会话一关它「记不住」你的项目。要让 Claude 持续记住项目约定，需要写进**记忆文件**，每次会话启动自动加载。这就是「不失忆」的原理。
> 具体载体（CLAUDE.md、规则文件等）各有适用场景，到需要的时候再逐个展开，现在先记住原理。

**Learner**（场景 P1 触发）:
> 明白了。我想让你以后记住我们项目的代码风格约定——函数用 camelCase、用 const、缩进 2 空格——应该怎么办？

**Skill 引导（概念递进：CLAUDE.md — 项目级记忆）**:
> 问得正好，这是记忆系统最常见的用法。核心载体是 **CLAUDE.md（项目级）**：
> - 项目的「员工手册」，**提交到 Git**，团队共享。
> - 记录**关键命令、定制规范、架构约束、避坑指南**这类项目独有约定。
> - 每次会话启动自动加载。
> 你说的代码风格约定（camelCase、const、2 空格）正是「定制规范」，典型该写进 CLAUDE.md。
> **何时用**：想让 Claude 记住项目约定/规范 → 写 CLAUDE.md。注意**少即是多**——可推导的通用惯例、空泛建议不要写，写了反而稀释真正重要的约定。

**Skill 引导（场景演示：用学习者项目举例）**:
> 拿你的项目演示。`src/utils.js`：camelCase、`const MAX_RETRIES`、2 空格缩进——**值得写**的定制规范。
> 什么**不该写**：如「变量名要有意义」这类任何有经验者都会做的通用惯例，是噪音。
> 写 CLAUDE.md 用「写作三问」引导，先想清楚再落笔：**WHY（推理依据）** / **WHAT（行为边界）** / **HOW（标准流程）**。
> 现在轮到真实轻练习。

**Skill 引导（真实轻练习）**:
> 练习目标：在你的项目里写/改一份 CLAUDE.md（或一个 `.claude/rules/` 规则文件，怎么选下面判断）：
> 1. 你先**自己列 3 条**这个项目的真实约定；
> 2. 逐条判断放 CLAUDE.md 还是 rules；
> 3. 最后由**你动手写入**。
> 先列你的 3 条。

**Learner**（列 3 条真实约定）:
> 1. 工具函数 camelCase、常量 const + UPPER_SNAKE、缩进 2 空格。
> 2. `buildGreeting` 输出格式 `"{greeting}, {displayName}"`，displayName 由 `formatUserName` 决定——架构约束，改会连环破坏。
> 3. 以 `.rule` 结尾的特定模块文件有自己的特殊约定，只在动那些文件时生效。

**Skill 引导（判断放置：just-in-time 引入规则级）**:
> 逐条判断。第 1、2 条项目级全局，**放 CLAUDE.md**——每次会话都加载。
> 第 3 条「只在特定文件生效」，这时才引入第二种载体：**规则级 `.claude/rules/` 文件**：
> - 用 **Glob 匹配路径**，**只在相关文件被操作时加载**（懒加载、条件化）。
> - 注意：不带 `paths` 的规则文件等于无条件全量加载，退化成 CLAUDE.md——要用它就必须写对 `paths`。
> 所以第 3 条若是「只在 `.rule` 文件生效」→ 放 `.claude/rules/` + `paths`；若也全局适用 → 并进 CLAUDE.md。判断留给你。
> （其余载体——用户级 `~/.claude/CLAUDE.md`、企业级、本地级 `CLAUDE.local.md`、`@文件引用`——是进阶细节，这次先不展开，遇到再教，避免信息过载。）

**Learner**（自主判断 + 起草）:
> 第 1、2 条全局适用放 CLAUDE.md；第 3 条只对 `.rule` 类文件有意义，放全局反而干扰其他文件，所以放 `.claude/rules/` 带 `paths`。我起草了草稿，能帮我看吗？**写入文件我自己来**。

**Skill 引导（审阅草稿，明确不代做）**:
> 好。你把 3 条按三问（WHY/WHAT/HOW）写出来，我逐条反馈，但**写入动作留给你，我不会替你创建文件**。草稿发我。

**Learner**（草稿）:
> `CLAUDE.md`：第 1 条「camelCase/const/2 空格，WHY 与 utils.js 一致，WHAT 新代码遵守，HOW 见示例」；第 2 条「buildGreeting 输出格式约束，WHY 改 displayName 会连环破坏，WHAT 不得单独改拼接」。
> `.claude/rules/file-rule.md`：占位 `xxx` + WHY/WHAT/HOW。

**Skill 引导（反馈，引导完善，不代做）**:
> 草稿结构不错，三问带上了。反馈：
> - 第 1、2 条放 CLAUDE.md 正确（全局、会话启动加载）。
> - 第 3 条放 rules 正确，但两点要补：
>   1. **必须写 `paths`**（如 `paths: ["**/*.rule"]`），否则无条件全量加载、退化成 CLAUDE.md，这条就失去意义；
>   2. 规则文件里的 `xxx` 是占位，需写成实际约定。
> 这两处由你补。补完你自己写进文件，然后告诉我，我给你收尾。

**Learner**（自主完成写入）:
> 补上了：规则文件加了 `paths: ["**/*.rule"]`，把 `xxx` 替换成实际约定。两个文件我都自己用编辑器写好了，写入是我做的。

**Skill 引导（模块收尾 + 写进度）**:
> 完成。你把「判断 CLAUDE.md vs rules → 自己起草 → 自己写入」完整走了一遍，记忆系统核心机制已亲手用过。
> 记忆系统模块完成，写进度。

**progress.json（记忆完成之后）** — 见 §3「after memory」。

---

## 3. progress.json 观察

### After core（skill 写盘，实际读取）

```json
{
  "phase": "进阶",
  "completedModules": [
    { "phase": "进阶", "moduleId": "core" }
  ],
  "currentModule": { "phase": "进阶", "moduleId": "memory" },
  "updatedAt": "2026-08-26T12:13:22Z"
}
```

### After memory（skill 写盘，实际读取）

```json
{
  "phase": "进阶",
  "completedModules": [
    { "phase": "进阶", "moduleId": "core" },
    { "phase": "进阶", "moduleId": "memory" }
  ],
  "currentModule": { "phase": "进阶", "moduleId": "skills" },
  "updatedAt": "2026-08-26T12:13:55Z"
}
```

- `completedModules` 元素为 `{phase, moduleId}` 形状，`currentModule` 为 `{phase, moduleId}`，`updatedAt` 记当前时间——**符合 SKILL.md 进度结构**。
- 模块完成后 `currentModule` 移向下一模块（core→memory→skills），`completedModules` 只追加已完成模块。
- 中断场景未测（本次两模块都正常走完）。

---

## 4. Behavior analysis vs 4 baseline failure patterns

### F1 过度预灌 — **PASS**

记忆模块教学**先概念后递进，逐点给**：先讲「记忆系统」一个原理；学习者问代码风格时才引入 CLAUDE.md（项目级）；练习第 3 条需要「按路径生效」时才 just-in-time 引入规则级 `.claude/rules/` + `paths`。其余载体（用户级/企业级/本地级/`@文件`）被显式推迟：*「进阶细节，这次先不展开，遇到再教，避免信息过载」*。
基线违规是「一口气给概念+模板+rules 路径」，本场未出现。**证据**：教学回合按「是什么 → 何时用 → 场景 → 练习」分段，每次只展开一个载体。

### F2 漏覆盖教学时机 — **PASS**

存在完整「**概念（是什么/何时用）→ 场景演示 → 真实轻练习**」闭环：
- 概念：记忆系统 / CLAUDE.md / rules 的「是什么 + 何时用」。
- 场景演示：用学习者自己的 `utils.js` 举例什么**值得写**（camelCase/const/2 空格）vs 什么**不该写**（「变量名要有意义」这类通用惯例），并教「写作三问」（WHY/WHAT/HOW）。
- 真实轻练习：列 3 条真实约定 → 判断 CLAUDE.md vs rules → 学习者自己写入。
基线的「场景演示与练习缺失」未出现。

### F3 续接不上 — **PASS**

第二次 `/assist`：skill 读取 `progress.json`，命中 `currentModule = {phase: 进阶, moduleId: memory}`，**直接进入记忆系统模块，未重讲核心**（核心概念、审阅教学均未重复）。进度机制（读 + 按 currentModule 模块级续接 + 模块完成写盘）全程工作。基线的「无进度机制、靠学习者自报」未出现。

### F4 替学习者代做 — **PASS**

skill 侧**从未**创建/写入学习者的练习文件（CLAUDE.md / `.claude/rules/`）。两次显式声明 *「写入动作留给你，我不会替你创建文件」* / *「这两处由你补。补完你自己写进文件」*。练习中 skill 只做：审阅草稿、给反馈（补 `paths`、替换占位 `xxx`）、留判断权（第 3 条放哪由学习者判断）。练习执行与落盘由学习者完成；skill 唯一写入的是 **progress.json**（skill 自身的进度职责，非学习者练习文件）。
**磁盘验证**：会话结束时 learner-proj 下仅有 `src/utils.js` 与 `.claude/cc-assistant/progress.json`，无任何 CLAUDE.md / rules 文件——证明 skill 侧从未生成练习文件。基线的「主动读代码 + 生成全文 + 准备写入」未出现。

---

## 5. Deviations / problems

- **练习落盘为角色扮演**：本测试是「单会话双角色」eval，学习者侧的「用编辑器写文件」动作在对话内由 learner 角色声称完成，磁盘上并未实际生成 CLAUDE.md / rules 文件。这不影响 F4 判定（skill 侧从未代写是关键），但真实会话中需由真实学习者落盘。
- **skill 触发**：Skill tool 触发 `cc-assistant` 成功，模块文件路径（`modules/m0-onboarding.md` / `core.md` / `memory.md`）解析正常。
- **progress.json 路径解析**：按 `.claude/cc-assistant/progress.json`（learner-proj 相对路径）读写成功，与 SKILL.md 一致。
- **M0 顺序**：skill 按「M0 定场+选项目 → 无文件则询问全新/续接」执行，与 SKILL.md 续接编排一致；续接会话跳过 M0 直接读进度，符合预期。
- **未测项**：损坏 progress.json 的处理、续接时学习者自报、练习降级（`degraded`）路径未在本场覆盖。

---

## 6. 结论

**GREEN**。4 条基线失败模式全部收敛：F1 过度预灌 PASS（逐点递进、显式推迟进阶载体）、F2 漏覆盖教学时机 PASS（概念→场景→真实练习闭环）、F3 续接不上 PASS（读 progress.json 续接 memory、不重讲 core）、F4 替学习者代做 PASS（不代写练习文件、判断与执行留给学习者，磁盘验证 skill 仅写 progress.json）。
