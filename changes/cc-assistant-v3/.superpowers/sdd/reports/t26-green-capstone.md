# T26 GREEN Eval — 收官整合 (capstone) 综合场景验证报告

- **日期**：2026-08-26
- **被测对象**：`cc-assistant` skill（安装于 `C:/Users/yan/.claude/skills/cc-assistant/`，含 `modules/capstone.md`）
- **被测要求**：REQ-ICN-001/002/003、REQ-MCO-003、F2/F4（baseline 对比）
- **判定**：**PASS（带 1 项环境性限制说明）**

---

## 1. Setup

### progress.json 初始内容（真实 fixture，仅 skill 动作可修改）
路径 `learner-proj/.claude/cc-assistant/progress.json`：
```json
{
  "phase": "进阶",
  "completedModules": [
    { "phase": "进阶", "moduleId": "core" },
    { "phase": "进阶", "moduleId": "memory" },
    { "phase": "进阶", "moduleId": "skills" },
    { "phase": "进阶", "moduleId": "subagent" },
    { "phase": "进阶", "moduleId": "hooks" },
    { "phase": "进阶", "moduleId": "mcp" },
    { "phase": "进阶", "moduleId": "headless" },
    { "phase": "进阶", "moduleId": "sdk" },
    { "phase": "进阶", "moduleId": "plugins" },
    { "phase": "进阶", "moduleId": "engineering" }
  ],
  "currentModule": { "phase": "进阶", "moduleId": "capstone" },
  "updatedAt": "2026-08-26T12:20:00Z"
}
```
即：进阶 10 个单机制模块全部完成，`currentModule = capstone`，符合「多会话累积后今天开收官」的设定。

### 学习者项目
- `D:/documents/MyProject/Claude-Code-Assistant/.superpowers/eval-fixture/learner-proj/`，含 `src/utils.js`（`formatUserName` / `buildGreeting` / `MAX_RETRIES` 的字符串格式化小工具）。
- 与课程 10 个进阶模块共用同一真实项目（REQ-ICN-001「沿用同一项目」成立）。

### 会话形态
- 学习者输入 `/assist` → 通过 Skill 工具真实调用 `cc-assistant` skill（SKILL.md + capstone.md 载入），非凭记忆角色扮演。
- 学习者「独立完成」的部分按 eval 规则以**叙述呈现**（详见 §5 限制），skill 只引导与核对。

---

## 2. Turn-by-turn 转录

### Turn 1 — Skill: 收官整合入口 + 引导选综合任务（verbatim）
> 欢迎回来！进度文件显示：进阶阶段 10 个模块（核心 / 记忆系统 / Skills / 子智能体 / Hooks / MCP / Headless / Agent SDK / Plugins / 工程化）全部完成，今天进入第 11 模块——**收官整合**。
>
> **收官整合是什么**：课程的最后一环，不是学新机制，而是把前面 10 个模块学到的机制**组合起来**，在你自己的项目里做一个跨模块综合任务，并把各机制的定位讲成体系——从「会用单个机制」升级到「知道何时用哪个、怎么组合」。
>
> **综合任务**：需要组合 **2 种以上** Harness 机制的真实任务。参考方向：
> - **记忆系统 + Hooks**：如「写一个 CLAUDE.md 项目约定 + 配一个 Hook 强制检查」，做一个带质量门控的项目；
> - **Skills + MCP**：如「做一个能汇总 diff 的 skill + 一个 Hook 触发它」，做一个带外部数据的自动化流程。
>
> 任务沿用你之前的同一项目（learner-proj）。**注意：这是多会话综合阶段**——今天做不完没关系，可拆成多次 `/assist` 完成，每次我会记录进度（REQ-MCO-003）。
>
> 你想在 learner-proj 里做什么综合任务？请自己提出一个组合 2 种以上机制的真实任务。

### Turn 2 — 学习者：提出 2+ 机制综合任务
> 我做一个**带质量门控的项目约定**，组合**记忆系统 + Hooks**：
> - **记忆系统**：在 learner-proj 根目录写 `CLAUDE.md`，记录小工具项目的代码约定——导出函数必须带 JSDoc、主逻辑禁止 `console.log`、命名用 camelCase。
> - **Hooks**：在 `learner-proj/.claude/settings.json` 配 `PostToolUse` hook，每次工具调用后检查被改的 `.js` 文件，发现违反约定就警告并拦下。
>
> 这样组合：CLAUDE.md 负责「项目知道什么约定」，Hook 负责「这一步能不能放行」，两个机制各管一段。

### Turn 3 — Skill: 引导第 1 步（写 CLAUDE.md，只引导不代做）
> 好，任务正把「记忆系统」和「Hooks」两条机制串起来。分两步做，先记忆层、再强制层。
>
> **第 1 步：写 `CLAUDE.md`（记忆系统）**。回忆记忆系统模块：CLAUDE.md 是项目级记忆，让 Claude 每次进入项目「不失忆」，解决「项目知道什么」。你来写，我只引导和核对、不代做。注意三点：约定要**可检查**（后面 Hook 要据此判断）；放项目根目录；小而准。
>
> 写完把内容贴给我看。

### Turn 4 — 学习者：给出 CLAUDE.md
> 写好了，`learner-proj/CLAUDE.md`：
> ```markdown
> # learner-proj
> 小工具项目：字符串格式化（src/utils.js）。
> ## 代码约定（质量门控，供 Hook 检查）
> - 每个导出的函数必须有 JSDoc 块注释。
> - 主逻辑（src/ 下非测试文件）禁止 console.log。
> - 函数与变量命名用 camelCase。
> ```
> 我只写 3 条，每条都能被脚本检查。

### Turn 5 — Skill: 核对 + 引导第 2 步（配 Hook）+ 明示多会话可拆
> 核对：CLAUDE.md 不错——约定少而可检查，正好当 Hook 的检查标准。camelCase 那条脚本严格判定有点微妙，但 JSDoc、console.log 两条是明确的，够了。
>
> **第 2 步：配 `PostToolUse` Hook（Hooks）**。回忆选型：这是「强制检查」场景，用 `PostToolUse`（工具调用后审计），处理器按 command→prompt→agent 降级，这里 `command` 最可靠；matcher 选 `Edit|Write`。你来写 `learner-proj/.claude/settings.json`，我只核对不代做。记得 Hooks 模块的陷阱：改完 settings.json 后 Hook 不立即生效，需确认或重启会话。
>
> 顺带确认：如果你今天想先到这里、Hook 下次再配，完全没问题——收官整合可拆多次完成，未完成我不会标 capstone 完成，进度留在该模块。写好把内容贴给我看。

### Turn 6 — 学习者：给出 settings.json + 触发测试叙述
> 配好了，`learner-proj/.claude/settings.json`：
> ```json
> { "hooks": { "PostToolUse": [ { "matcher": "Edit|Write", "hooks": [ { "type": "command", "command": "sh .claude/hooks/check-conventions.sh" } ] } ] } }
> ```
> 配套 `.claude/hooks/check-conventions.sh`：对本次改动的 `.js` 文件逐个检查，导出的函数前无 JSDoc 或含 console.log 就 `::error::` 并 exit 1；无违规静默通过。重启会话后做了触发测试：先加 console.log 确认 Hook 拦截，去掉后确认放行。

### Turn 7 — Skill: 核对 + **选型理由检查**（verbatim）
> 核对：配置选型合理——`PostToolUse` + `command` 符合「强制检查选 command、只看结果用 PostToolUse」判据；`Edit|Write` matcher 覆盖改代码时机；触发测试「先拦截违规、去掉后放行」是完整验证闭环。很好。
>
> 现在收官的关键一步——**说出你的选型理由**：
> 1. 为什么选**记忆系统 + Hooks**，而不是别的组合（如 Skills + MCP，或只用其中一个）？
> 2. 什么条件下这条规则该进 CLAUDE.md（记忆层）、什么条件下该交给 Hook（执行层）——两个机制的适用条件分别是什么？
>
> 说得出，这套课就真正收官；说不上来，我们回相关模块补讲后再复述。

### Turn 8 — 学习者：选型理由（非空 + 覆盖两机制适用条件）
> 1. **为什么选这两个**：任务本质是「定约定 + 强制守住约定」。Skills 是固化重复步骤、MCP 是接外部数据，跟「约定/强制」不匹配；只有 CLAUDE.md 能持续告知模型项目约定，只有 Hooks 能在事件点强制拦截，所以选这两者。
> 2. **适用条件**：
>    - 用**记忆系统（CLAUDE.md）**的条件：内容是「项目应该知道什么」——规范/约定/术语，给模型当背景知识，写进去每次会话生效。我的代码约定属于这类。
>    - 用**Hooks**的条件：内容是「必须强制执行、不能只靠建议」——有明确触发事件、可被脚本拦截的检查。我的「违反约定就拦下」属于这类。
>    - 反过来，若只是「想提醒一句」而非「必须拦住」，只用 CLAUDE.md 就够，不必上 Hook。

### Turn 9 — Skill: 核验理由 + 体系讲解（REQ-ICN-003）+ 收官 + 写进度
> 理由很扎实——你既说清了「为什么用 A 不用 B」，又点出两个机制的适用条件（记忆层 = 项目知道什么；执行层 = 必须强制），正是收官要的能力。做一次系统性确认：
>
> **体系讲解（把机制放进一张图）**
> - **记忆层**：CLAUDE.md / 规则文件——让模型「不失忆」，管「项目知道什么」。
> - **扩展层**：Commands、Skills、子智能体、Hooks——扩展能力各管一段：命令靠人手动唤出、Skill 靠 description 自动匹配、子智能体靠点名或委派、Hooks 靠事件到点自动拦。
> - **集成层**：MCP、Headless——连接外部工具与环境。
> - **编程层**：Agent SDK——用代码构建 Agent 应用。
> - **选型决策树**：先问「知识还是执行」→ 知识进记忆层；执行再问「人/模型/事件触发」→ 分别进命令、Skill、Hook；连外部走集成层；当产品代码走编程层。
> - （四层架构 / 触发口诀 / 选型决策树框架来源：黄佳《Claude Code 实战》（人民邮电出版社），此处为课程自有改写并归因，不内联原文。）
>
> **收官**：你独立完成组合 2+ 机制的综合任务并说清选型理由，进阶阶段全部收官。我把 capstone 记入 `completedModules`。进阶没有下一模块了；高阶（可选）是更大的综合项目，想继续就进高阶，不想就到此收官。

---

## 3. progress.json 会话后状态

```json
{
  "phase": "进阶",
  "completedModules": [
    { "phase": "进阶", "moduleId": "core" },
    { "phase": "进阶", "moduleId": "memory" },
    { "phase": "进阶", "moduleId": "skills" },
    { "phase": "进阶", "moduleId": "subagent" },
    { "phase": "进阶", "moduleId": "hooks" },
    { "phase": "进阶", "moduleId": "mcp" },
    { "phase": "进阶", "moduleId": "headless" },
    { "phase": "进阶", "moduleId": "sdk" },
    { "phase": "进阶", "moduleId": "plugins" },
    { "phase": "进阶", "moduleId": "engineering" },
    { "phase": "进阶", "moduleId": "capstone" }
  ],
  "currentModule": { "phase": "进阶", "moduleId": "capstone" },
  "updatedAt": "2026-08-26T13:05:00Z"
}
```

- ✅ skill 把 `{phase: 进阶, moduleId: capstone}` 加入 `completedModules`（11 个进阶模块全齐）。
- ✅ `updatedAt` 更新为当前时间。
- ⚠️ `currentModule` 保持 `{进阶, capstone}`：capstone 是进阶最后一个模块，schema 无「毕业」标志、也无「下一模块」可移。skill 的处理是依赖 `completedModules` 判定「进阶 capstone 已完成、不重讲」（对应 REQ-SCN-002 的「已完成（当前 phase）不重复从头教」），并显式告知高阶为可选延伸。**这是 design 未明确规定的边界行为**（见 §5）。

---

## 4. Analysis（PASS / FAIL + 证据）

### REQ-ICN-001 跨模块综合真实任务 — **PASS**
- 证据：Turn 1 系统引导「组合 2 种以上机制的真实任务」并给出两类示例；Turn 2 学习者在 **learner-proj（真实项目，沿用同一项目）** 提出**记忆系统（CLAUDE.md）+ Hooks** 综合任务，2 机制明确、落地载体具体。谓词（给出/引导 2+ 机制任务；任务在学习者项目内、沿用同一项目）全部满足。

### REQ-ICN-002 独立完成并说出选型理由 — **PASS**
- 独立完成：Turn 3/5 skill 明确「你来写，我只引导和核对、不代做」，两次均只核对不代做（F4，见下）；内容（CLAUDE.md 约定、settings.json、检查脚本、触发测试）全部由学习者产出。
- 说出选型理由：Turn 7 skill 主动要求「说出选型理由」，问题 2 显式要求「两个机制的适用条件」；Turn 8 学习者理由**非空**（为什么选这 2 个、不选 Skills+MCP）、且**涉及所选用机制的适用条件**（CLAUDE.md = 项目知道什么/每次会话生效；Hook = 必须强制/事件触发可拦截，并给出「只提醒则只需 CLAUDE.md」的反向判据）。
- 核验：Turn 9 skill 对理由给出肯定判定（理由非空 + 覆盖适用条件均满足），并仅在确认后才标 capstone 完成。谓词（学习者独立完成 + 能说出机制组合及理由；skill 检查理由）满足。
- 「说不清选型理由 → 回补讲再复述」分支未触发（理由一次达标），属未执行分支、非失败。

### REQ-ICN-003 体系讲解按书框架复用边界 — **PASS**
- 证据：Turn 9 体系讲解覆盖四层架构（记忆/扩展/集成/编程层）、触发口诀（命令靠人、Skill 靠描述、子智能体靠点名、Hooks 靠事件）、关注点分离（记忆管「知道什么」、Hook 管「放行与否」）、选型决策树；全部为课程自有表达，显式归因「黄佳《Claude Code 实战》（人民邮电出版社），此处为课程自有改写并归因，不内联原文」，未照抄书原文。谓词满足。

### REQ-MCO-003 收官整合为多会话综合阶段 — **PASS**
- 证据：Turn 1 入口即声明「可拆多次 `/assist` 完成，每次我会记录进度」；Turn 5 再确认「未完成我不会标 capstone 完成，进度留在该模块」（不误标完成、不清空进度）。本会话一口气完成，未实际拆分，但 skill 允许拆分的语言与「未完成不标完成」的写进度语义均到位，行为谓词满足。

### F2（概念→场景→练习结构）— **PASS**
- 概念（收官整合 = 组合 2+ 机制 + 讲成体系）→ 场景（两个综合任务示例 + 学习者项目内落地）→ 练习（分两步：写 CLAUDE.md、配 Hook；每步「概念提示→学习者动手→核对」）。结构与模块文件一致。

### F4（skill 不代做综合任务）— **PASS**
- Turn 3/5/7 全部为「你来写 / 我只引导和核对、不代做」；skill 从未代写 CLAUDE.md、settings.json 或脚本，也未替学习者选机制（Turn 2 的机制组合是学习者自己提出）。学习者产出了全部综合任务工件。

---

## 5. 偏差 / 问题

1. **环境性限制（已按 eval 规则声明）**：按本轮 eval 规则「Do NOT write the learner's task files」，学习者的综合任务工件（CLAUDE.md、settings.json、检查脚本）以**叙述/贴出内容**呈现，未真正落盘到 `learner-proj`。因此「独立完成」与「触发测试（先拦截、后放行）」的判定依赖会话叙述证据，未做文件级复核。**skill 的引导/核对流程为真实调用与产出**；仅学习者落盘动作被规则约束为叙述。此为 eval 规则造成，非 skill 缺陷；后续 RED/回归轮可放开此限制做实盘复核。
2. **进阶收官 currentModule 边界未定义**：capstone 为进阶最后一模块，schema（`{phase, completedModules[], currentModule, updatedAt}`）无「课程完成/毕业」标志，design D3/D4 亦未规定收官后 `currentModule` 去向。skill 采用「capstone 入 completedModules + currentModule 保持 capstone + 依赖 completedModules 避免重讲 + 口头告知高阶可选」的稳妥处理，行为自洽，但**建议 design 明确收官语义**（如加 `graduate: true` 或 `currentModule` 置高阶 capstone），避免下次 `/assist` 出现「capstone 已完成却又指向 capstone」的歧义。
3. **顺带观察（非本场景失败）**：Turn 5 skill 对 `camelCase` 约定提示「脚本严格判定有微妙」，属合理提示，不构成问题。

---

## 结论

**PASS**。REQ-ICN-001/002/003 全部谓词通过；REQ-MCO-003（可拆多会话、未完成不标完成）语言与写进度语义到位；F2（概念→场景→练习）、F4（skill 只引导核对不代做）成立。skill 以真实调用驱动完成完整收官流程并写入 `progress.json`（capstone 入 completedModules、updatedAt 更新）。唯一保留项为 eval 规则导致的学习者工件未实盘（§5.1）与收官 `currentModule` 语义的 design 空白（§5.2）。
