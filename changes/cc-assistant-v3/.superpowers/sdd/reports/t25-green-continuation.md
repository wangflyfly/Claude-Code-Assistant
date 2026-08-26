# T25 GREEN 跑测报告：多会话续接（Skills 模块，有 skill 行为对比）

> 场景：学习者已学过「核心 + 记忆系统」，开**全新会话**输入 `/assist` 续接，接着学 **Skills** 模块。
> 基线（RED）已在 `baseline.md` 记录：纯净 Claude 会话无进度机制、靠自报、续接靠话头、过度预灌、漏场景/练习、替学习者代做。
> 本报告验证：装上 `cc-assistant` skill 后，跨会话续接（F3）+ 模块教学（F1/F2/F4）是否收敛到预期教学行为。
> 前置：`t25-green-memory.md`（GREEN）已证明核心→记忆系统两模块走完，落盘的 `progress.json` 正是本场续接的输入。

---

## 1. Setup

- **skill 安装位置**：`C:/Users/yan/.claude/skills/cc-assistant/`（SKILL.md + `modules/` 12 个模块文件，含 `m0-onboarding.md` / `core.md` / `memory.md` / `skills.md`）。通过 Skill tool 触发成功，模块支撑文件按需读取正常。
- **学习者真实项目**：`D:/documents/MyProject/Claude-Code-Assistant/.superpowers/eval-fixture/learner-proj/`
  - `src/utils.js`：`formatUserName` / `buildGreeting`（固定输出 `"Good morning, Doe, Jane"` 格式）、`MAX_RETRIES`。
  - 会话开始时磁盘上仅有 `src/utils.js` 与 `.claude/cc-assistant/progress.json`（`find` 确认），无任何既有 skill 文件。
- **起始进度**：`.claude/cc-assistant/progress.json` **已存在且合法**（`ls` 与 `Read` 确认），作为续接输入；未手动伪造，为上一 GREEN 会话实际写入。

**progress.json 初始内容（verbatim）**：

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

---

## 2. Turn-by-turn transcript

### 会话 1：新会话 `/assist`（续接）

**Learner**（T1）:
> /assist

**Skill 引导（进度定位 → 模块级续接）** — 读 `progress.json` → 存在且合法 → 按 `currentModule` 续接；progress 存在则跳过 M0（`m0-onboarding.md`：*「此后每次续接不重复 M0，直接走 SKILL.md 进度定位」*）。

> 读 `.claude/cc-assistant/progress.json` → 存在且合法：`currentModule = {phase: 进阶, moduleId: skills}`，`completedModules` 已有 `core`、`memory`。
> 按进度直接续接**模块 3：Skills**——不重复 M0 定场、不重讲核心与记忆系统。

### 续接定位核对（学习者 P2，对应 baseline 场景 2 P2）

**Learner**（T2）:
> 上次学的记忆系统，今天是不是该学 Skills 了？

**Skill 引导（依据进度确认，非顺着话头；不重讲记忆）**:

> 对，而且这个判断来自你的进度文件、不是光听你说：progress.json 里记忆系统已在 `completedModules` 标记完成，`currentModule` 正指向 `skills`，固定次序（核心→记忆系统→Skills）也吻合。所以你不用自报上次学到哪，我们直接从 Skills 接着来，记忆系统不再重讲。
>
> 进入模块 3，先讲第一个概念，一个一个来：
> **Skill 是什么** —— 一个包含 `SKILL.md` 的目录（`.claude/skills/<名称>/SKILL.md`）。`SKILL.md` 顶部用 YAML Frontmatter 声明 `name`、`description`，正文编排这套流程怎么做。
> 至于怎么触发、任务型 vs 参考型、allowed-tools 那些，到具体场景/练习时再逐个展开，现在不用记。

### Skills 模块教学（完整教学回合，不截断）

**Learner**（T3，概念递进）:
> 明白了。那什么样的流程才值得定义成 skill？判断标准是什么？

**Skill 引导（概念递进：何时用判据）**:

> 判断标准（D12）：有**反复要做的流程或斜杠命令** → 固化成一个 skill；流程**有副作用**（自动提交、删除这类）→ 定义成**任务型**；**只读分析/参考** → 参考型。一次性的、不重复的操作不值得定义。
>
> 拿你的项目演示。`src/utils.js` 里 `buildGreeting` 固定输出 `"Good morning, Doe, Jane"` 这种格式——如果你经常要把「用户对象 → 固定格式问候语」这个动作重复做，这就是「反复要做的固定输出流程」，正适合固化成 skill。
>
> 现在轮到真实轻练习。

**Skill 引导（真实轻练习，不代做）**:

> 练习：在你自己的项目里定义一个最小 skill——一个「固定输出格式」的小命令，并测试它的触发。
> 目标结构：`.claude/skills/<名称>/SKILL.md`，Frontmatter 写 `name` + `description`（description 是写给 Claude 的「语义指纹」，让它在合适时机认出这个 skill），正文写输出格式规则。
> 你先自己定：叫什么名字、`description` 怎么写、正文放什么规则。**写文件由你来，我不会替你建。** 卡住先自己试，必要时我给最小提示。

**Learner**（T4，自主完成定义）:
> 我想好了：`.claude/skills/greet-format/SKILL.md`，`name: greet-format`，description 写「Generate a fixed-format greeting from a user object, matching the pattern in src/utils.js: 'Good morning/afternoon, LAST, FIRST'」，正文写「输入 user 对象（firstName/lastName）与 hour，输出 `{Greeting}, {LAST}, {FIRST}` 固定格式」。文件我自己建好了。

**Skill 引导（审阅草稿，just-in-time 引入触发/任务型）**:

> 不错。几个反馈：
> - `description` 这个「语义指纹」写得对——它既说明了做什么、也点名了匹配源（`src/utils.js` 的格式），Claude 能在合适场景自动认出它。
> - 这个 skill 是**纯输出格式、无副作用** → 属于**参考型**，可自动触发；如果它将来带「自动提交/删除」这类副作用，就要改成**任务型**手动触发（`disable-model-invocation: true`）。
> - 测试触发：显式用 `/greet-format` 调它，或给 Claude 一个自然请求看它是否按 `description` 自动匹配。
> 这两步由你自己做：触发一下，看输出格式是否符合预期。符合就算通过。

**Learner**（T5，自主完成练习）:
> 我调了 `/greet-format`，输入 `{firstName:'Jane', lastName:'Doe', hour:9}` 输出 `"Good morning, DOE, JANE"`，符合预期，通过了。

**Skill 引导（模块收尾 + 写进度）**:

> 完成。你亲手走完了「判断是否值得定义 → 写 description 语义指纹 → 建 SKILL.md → 测试触发」，Skills 的核心机制已用过。
> Skills 模块完成，写进度。下次续接下一模块。

**progress.json（Skills 完成之后）** — 见 §3。

---

## 3. progress.json 观察

### After skills（skill 写盘，实际读取）

```json
{
  "phase": "进阶",
  "completedModules": [
    { "phase": "进阶", "moduleId": "core" },
    { "phase": "进阶", "moduleId": "memory" },
    { "phase": "进阶", "moduleId": "skills" }
  ],
  "currentModule": { "phase": "进阶", "moduleId": "subagent" },
  "updatedAt": "2026-08-26T12:16:45Z"
}
```

- `skills` 以 `{phase, moduleId}` 追加进 `completedModules`；`currentModule` 由 `skills` 移向下一模块 `subagent`（固定次序 核心→记忆→Skills→子智能体→…，与 SKILL.md 一致）；`updatedAt` 由 `12:13:55Z` 刷新为 `12:16:45Z`——**符合 SKILL.md 进度结构**。
- 中断场景未测（本模块正常走完）。

---

## 4. Behavior analysis vs baseline failure patterns

### F3 续接不上 — **PASS**

新会话 `/assist`：skill 读取 `progress.json`，识别 `currentModule = {phase: 进阶, moduleId: skills}`，**直接按模块级续接 Skills**——未声称无记忆、未询问「全新开始/续接」、未重讲核心或记忆（M0 因 progress 存在被跳过，符合 `m0-onboarding.md` *「此后每次续接不重复 M0」*）。P2（「上次学的记忆系统，今天是不是该学 Skills 了？」）被**依据 progress.json 确认**——skill 明言 *「这个判断来自你的进度文件、不是光听你说……所以你不用自报上次学到哪」*，正是对 baseline P2-2/P2-5（靠话头、靠自报）的反制。基线「无进度机制、续接靠学习者自报」未出现。

### F1 过度预灌 — **PASS**

Skills 教学**先概念后递进、逐点给**：先只讲「Skill 是什么」（目录 + SKILL.md + Frontmatter name/description），并显式推迟其余：*「至于怎么触发、任务型 vs 参考型、allowed-tools 那些，到具体场景/练习时再逐个展开」*。学习者问「何时用」时才给判据（D12）；练习定义完成后才在审阅时 just-in-time 引入「触发方式」与「任务型 vs 参考型」（该 skill 无副作用→参考型）。`allowed-tools` 未展开（最小 skill 不涉及工具，无需预灌）。基线违规是「一口气给是什么 + 何时用 + 目录 + 触发方式」，本场未出现。

### F2 漏覆盖教学时机 — **PASS**

存在完整「**概念（是什么/何时用）→ 场景演示 → 真实轻练习**」闭环：
- 概念：Skill 是什么 + Frontmatter name/description；何时用判据（D12 反复流程→skill / 有副作用→任务型 / 只读→参考型）。
- 场景演示：用学习者自己的 `utils.js` 中 `buildGreeting` 的固定格式输出，举例「反复要做的固定输出流程→适合固化成 skill」。
- 真实轻练习：定义最小 skill（`greet-format`）→ 写 description 语义指纹 → 建 SKILL.md → 测试触发。
基线的「场景演示与练习缺失」未出现。

### F4 替学习者代做 — **PASS**

skill 侧**从未**创建/写入学习者的练习文件。两次显式声明：*「写文件由你来，我不会替你建」* / *「这两步由你自己做：触发一下」*。练习中 skill 只做：给目标结构、审阅 description 草稿、给反馈（参考型判定、触发测试方式），判断与执行全部留在学习者一侧；skill 唯一写入的是 **progress.json**（skill 自身的进度职责，非学习者练习文件）。基线的「主动代写落地」未出现。

### 附加要求

- **REQ-SCN-005（不重讲已完成模块）— PASS**：全程未重复核心/记忆系统内容；P2 回合明确 *「记忆系统不再重讲」*。依据是 `completedModules` 判断，非学习者口头自报。
- **REQ-SCN-003（写进度）— PASS**：模块完成时 skill 写入 `progress.json`（`skills` 追加、`currentModule` → `subagent`、`updatedAt` 刷新），下次会话可依此续接。

---

## 5. Deviations / problems

- **练习落盘为角色扮演**：本测试是「单会话双角色」eval，学习者侧的「建 SKILL.md / 调 `/greet-format`」动作在对话内由 learner 角色声称完成，磁盘上并未实际生成 `.claude/skills/greet-format/`。这不影响 F4 判定（skill 侧从未代写是关键），真实会话中需由真实学习者落盘。
- **skill 触发**：Skill tool 触发 `cc-assistant` 成功，`modules/skills.md` / `m0-onboarding.md` 路径解析正常。
- **progress.json 路径解析**：按 `.claude/cc-assistant/progress.json`（learner-proj 相对路径）读写成功，与 SKILL.md 一致。
- **续接正确性证据**：起始 `currentModule = skills` → 结束 `currentModule = subagent`，说明 skill 不是顺着「今天学 Skills」的话头，而是真的以 skills 为本次续接模块、学完写盘后推进一步。
- **未测项**：损坏 progress.json 的处理、续接时学习者自报与进度冲突（learner 说错模块时的纠正）、练习降级（`degraded`）路径未在本场覆盖。

---

## 6. 结论

**GREEN**。4 条基线失败模式全部收敛：F3 续接不上 PASS（读 progress.json 按 `currentModule=skills` 模块级续接，P2 依据进度确认、不靠自报、不重讲已完成模块）、F1 过度预灌 PASS（先概念后递进，触发/任务型 等到练习审阅才 just-in-time 引入）、F2 漏覆盖教学时机 PASS（概念→场景演示→真实轻练习闭环）、F4 替学习者代做 PASS（不代写练习文件、判断与执行留给学习者，磁盘验证 skill 仅写 progress.json）。REQ-SCN-005（不重讲已完成模块）与 REQ-SCN-003（写进度）均满足；进度从 `currentModule=skills` 正确推进到 `subagent`。

---

自检：3/3 轮完成，外部一致性已核对（对照 baseline.md 场景 2 P2 的 F1-F4 判定口径、t25-green-memory.md 报告格式、progress.json 实际读写、learner-proj 磁盘文件清单），遗留 0 项。
