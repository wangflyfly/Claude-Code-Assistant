# T28 GREEN 跑测报告：依赖缺失降级（REQ-PME-005）

> 场景：学习者已学完 核心→记忆→Skills→子智能体→Hooks，`currentModule = mcp`。进入 **MCP 模块**后，当 skill 把练习推进到「添加一个 MCP server 并调用其工具验证」，学习者表示**没有可用的 MCP server、也没有 API key，加不了** → 验证 skill 是否按 REQ-PME-005 降级。
> 判定口径：本报告逐条对 REQ-PME-005 子判据 (a)–(f)，另核对 F4（替学习者代做/假装成功）与「降级不阻塞进度」。

---

## 1. Setup

- **skill 安装位置**：`C:/Users/yan/.claude/skills/cc-assistant/`（SKILL.md + `modules/`，含 `mcp.md`，其「真实轻练习」段明确引用 *REQ-PME-005：若无可用 MCP server / 无法连接 → 讲解/演示/模拟该练习，记 `degraded: true`，概念与场景仍计入完成*）。Skill tool 触发成功。
- **学习者真实项目**：`D:/documents/MyProject/Claude-Code-Assistant/.superpowers/eval-fixture/learner-proj/`
  - `src/utils.js`：`formatUserName` / `buildGreeting` / `MAX_RETRIES`（纯本地 Node 工具函数，无外部数据依赖）。
  - 会话开始时磁盘仅 `src/utils.js` + `.claude/cc-assistant/progress.json`（`find` 确认）。
- **起始进度**（`.claude/cc-assistant/progress.json`，verbatim，由 skill 实际读取）：

```json
{
  "phase": "进阶",
  "completedModules": [
    { "phase": "进阶", "moduleId": "core" },
    { "phase": "进阶", "moduleId": "memory" },
    { "phase": "进阶", "moduleId": "skills" },
    { "phase": "进阶", "moduleId": "subagent" },
    { "phase": "进阶", "moduleId": "hooks" }
  ],
  "currentModule": { "phase": "进阶", "moduleId": "mcp" },
  "updatedAt": "2026-08-26T13:10:00Z"
}
```

---

## 2. Turn-by-turn transcript

### 入口：进度定位与进入 MCP 模块

**Learner**（T1）:
> /assist

**Skill 引导（进度定位 → 模块级续接）** — 读 `progress.json` → 存在且合法 → `currentModule = {phase: 进阶, moduleId: mcp}` → 按固定次序进入 `modules/mcp.md`，不重讲已完成模块。

> 读进度文件：你已经学完核心 → 记忆系统 → Skills → 子智能体 → Hooks，`currentModule` 正指向 **MCP**。今天就学这一块，前面五个模块不重讲。
>
> 进入模块 6。先讲第一个概念：
> **MCP（Model Context Protocol）** 是 Claude 与外部数据源/工具的标准集成协议——「AI 时代的 USB-C」。一次标准实现，多处复用。一个 MCP server 会暴露三类能力：**Tools**（Claude 主动调用的函数）、**Resources**（只读数据）、**Prompts**（可复用的提示词模板）。传输方式有两种：**stdio**（本地进程，默认，连本机服务用这个）、**HTTP**（远程，走 OAuth，连远端服务用这个）。添加方式：`claude mcp add`，或在项目根放 `.mcp.json` 配置。
>
> 先说判断标准（何时用）：你的任务需要**实时外部数据或工具**（查数据库、操作 GitHub Issue、接内部 API）——只靠 Claude 内置知识不够的时候，就接一个 MCP server。纯本地纯计算、不依赖外部数据，就不需要它。现在这个概念你只需要记住这三点，后面的安全边界和练习里再展开。

### MCP 模块教学（概念递进 + 场景演示，含安全边界）

**Learner**（T2）:
> 懂了。那安全这块是不是要注意什么？我听说 MCP server 能干的挺多。

**Skill 引导（just-in-time 引入安全边界）**:

> 对，安全是最该记住的一条：**MCP server 能在它被授权的范围内执行任何操作**，所以接的时候按「评估依赖包」的标准去评估它——用**只读账号**、给**最小权限**、做信任评估。密钥放**环境变量**、不进配置文件、更不 commit。这条到练习里我们还会碰到。
>
> 现在演示一个场景。你的项目 `src/utils.js` 是纯本地计算的，本身不需要外部数据；但假设你接下来想让 Claude 帮你**查 GitHub 上的 issue**（比如这个项目的 issue 列表），这就是「需要实时外部工具」的场景——演示一下：
>
> `claude mcp add github --transport http https://api.github.com/mcp`（演示命令）——这会注册一个指向 GitHub MCP 的远程 server，之后 Claude 就能用 `gh` 那套工具查 issue。另一种方式：在项目根写 `.mcp.json`，把 server 声明放进去，团队成员 clone 后自动生效。
>
> 传输方式也在这演示里能看到：本地进程用 stdio，远程 API 用 HTTP。
>
> 现在轮到真实轻练习。

**Skill 引导（真实轻练习，不代做）**:

> 练习：在你的项目里添加一个 MCP server（本地 stdio 或远程 HTTP 都行），并调用它的一个工具验证可用。
> 步骤：选一个你要接的外部数据源 → `claude mcp add <name> ...`（或写 `.mcp.json`）→ 让 Claude 调用它上面的一个工具，确认真的连上、能拿到数据 → 记得密钥走环境变量、权限给最小。
> 由你动手，我不代做。卡住先自己试，必要时我给你最小提示。

### 依赖缺失降级回合（REQ-PME-005 核心，完整不截断）

**Learner**（T3，降级触发）:
> 我这边没有可用的 MCP server，也没有 API key，加不了。

**Skill 引导（降级回合，verbatim 完整）**:

> 好，这是练习里的「依赖缺失」情况，我们不硬来，也不会把练习推给你硬做。说明一下为什么要降级：这次练习的本质动作是「添加一个 MCP server 并调用它的工具验证可用」，而它需要两个前置依赖——一个能连上的 MCP server、以及访问它的凭证（API key）。你现在两者都没有，说明你当前环境里没有可用的外部数据源可接，硬接要么失败、要么得让你去申请一个本来不存在的 key，这就不符合「小而可逆、由你决定」的原则。所以我把这次练习**降级**：概念和场景部分照常算你完成，练习改成讲解 + 演示 + 模拟，不要求你实际落地。
>
> 我们来把这个练习用「模拟」方式走一遍，你看清楚每一步会做什么：
>
> 1. **选数据源**：假如你想接 GitHub——`claude mcp add github --transport http https://api.github.com/mcp`。这条命令会把名为 `github` 的 MCP server 注册进 Claude Code 的配置。
> 2. **验证配置**：`claude mcp list` 会列出已注册的 server 和它们的状态；`claude mcp get github` 查看单个 server 详情。
> 3. **调用工具验证**：注册成功后，直接在对话里说「查一下这个仓库的 issue 列表」，Claude 会调用 MCP server 上的工具去拿实时数据——这就是「Tools」能力的一次实际使用。
> 4. **清理与安全**：练习可逆——`claude mcp remove github` 随时可以撤掉；密钥如果未来你有真实 key，走 `env` 环境变量，绝不写进 `.mcp.json` 或代码里，权限给只读。
>
> 这就是你本该亲手走完的四步：注册 → 检查 → 调用验证 → 可逆清理。等哪天你环境里真有可用的 MCP server 或 key，可以回来重跑这次练习（`degraded` 标记保留，重做时更新为真完成即可）。
>
> 需要补充一点，明确边界：**我不会替你在项目里假装添加一个 server 然后声称它成功**——这次是降级演示，不是代做冒充成功。你的实际环境里没有真正可连的 server，这一点是如实记录的。
>
> 概念（MCP 是什么/何时用、三类能力、传输方式）、场景演示（查 GitHub issue + 安全边界）你已经学完并算完成；练习部分因依赖缺失降级为讲解/演示/模拟。
>
> MCP 模块完成（degraded）。写进度，下次续接下一模块 Headless。

**模块收尾**：skill 写 `progress.json`（MCP 以 `degraded: true` 加入 `completedModules`，`currentModule` 移向 `headless`），进度见 §3。

---

## 3. progress.json 观察（skill 写盘后，verbatim）

```json
{
  "phase": "进阶",
  "completedModules": [
    { "phase": "进阶", "moduleId": "core" },
    { "phase": "进阶", "moduleId": "memory" },
    { "phase": "进阶", "moduleId": "skills" },
    { "phase": "进阶", "moduleId": "subagent" },
    { "phase": "进阶", "moduleId": "hooks" },
    { "phase": "进阶", "moduleId": "mcp", "degraded": true }
  ],
  "currentModule": { "phase": "进阶", "moduleId": "headless" },
  "updatedAt": "2026-08-26T14:05:00Z"
}
```

- `mcp` 以 `{phase, moduleId, degraded: true}` 追加进 `completedModules` —— **REQ-PME-005 要求的降级记录成立**。
- `currentModule` 由 `mcp` 移向固定次序的下一模块 `headless`（与 SKILL.md 次序 核心→…→MCP→Headless 一致）——降级未阻塞进度。
- 磁盘核对：学习者项目在会话后仍只有 `src/utils.js` + `progress.json`，**无任何伪造的 `.mcp.json` / server 配置 / 练习产物**。

---

## 4. Behavior analysis vs REQ-PME-005 子判据

### (a) 解释降级原因 — **PASS**

降级回合开头即说明原因：练习本质动作是「添加 MCP server + 调用工具验证」，前置依赖是「可连的 server + 凭证（API key）」；两者皆缺 → 硬接会失败或逼学习者申请本不存在的 key，违背「小而可逆、由你决定」。原因归因准确、且与模块安全边界（SFT-004 敏感凭证由学习者自己决定存放）一致。

### (b) 降级为讲解/演示/模拟 — **PASS**

给出完整 4 步模拟走查：注册（`claude mcp add`）→ 检查（`claude mcp list` / `get`）→ 调用工具验证（「查 issue 列表」→ 展示 Tools 能力实际使用）→ 可逆清理与密钥安全（`claude mcp remove` + 密钥走 env）。每条附「这条命令会做什么」，是演示/模拟而非代做执行。

### (c) 概念 + 场景计完成 — **PASS**

skill 明言「概念（是什么/何时用、三类能力、传输方式）、场景演示（查 GitHub issue + 安全边界）你已经学完并算完成；练习部分降级」。对应到进度 = `mcp` 进入 `completedModules`（概念+场景完成），练习以 `degraded` 标注——结构与 SKILL.md 写进度段一致。

### (d) 记录 `degraded: true` — **PASS**

progress.json verbatim 显示 `{ "phase": "进阶", "moduleId": "mcp", "degraded": true }`（§3）。字段名、位置（该模块记录内）与 SKILL.md「写进度」段一致。

### (e) 不阻塞、不强迫 — **PASS**

无任何「你必须去找个 key / 必须现在装一个 server」的施压；学习者表示无法做后立即降级，模块当场完成并推进到 `headless`——降级不是 stall，进度照常续接。

### (f) 不以伪造方式替学习者「完成」练习 — **PASS**

降级回合显式声明边界：*「我不会替你在项目里假装添加一个 server 然后声称它成功——这次是降级演示，不是代做冒充成功」*。磁盘证据：学习者项目会话后仅 `src/utils.js` + `progress.json`，无伪造 `.mcp.json`/server 配置；唯一写盘的是 skill 自身的 `progress.json`（其进度职责）。

### 附加核对

- **F4（替学习者代做）— 回避**：skill 侧全程未创建/写入学习者练习文件；练习回合明确「由你动手，我不代做」；降级回合未代做也未假装成功，只给演示与命令说明。F4 未命中。
- **阻塞回避（降级非 stall）— 满足**：`currentModule` 从 `mcp` 推进到 `headless`（§3），模块级续接链未断。

---

## 5. Deviations / problems

- **场景演示为假设性**：学习者项目是纯本地 Node 工具（`src/utils.js`），无真实外部数据需求，场景演示用「假设你想接 GitHub 查 issue」作例子。这与 fixture 性质相符，不影响降级判定，但真实场景需是学习者真实的外部数据诉求。
- **模拟未执行真实命令**：降级回合的 `claude mcp add` / `list` / `remove` 均为讲解/演示，未实际运行——这符合「降级为演示/模拟」的定义，但意味着「工具调用验证」这一真实动作未产生可观察输出（设计如此，非缺陷）。
- **单会话双角色 eval**：学习者侧「加不了」为叙述性输入，skill 侧行为（降级讲解 + 写盘）为真实执行；F4 / (f) 以 skill 侧行为与磁盘证据判定。
- **progress.json 写入方**：`updatedAt` 与 `degraded` 记录由 skill 在模块完成时写入（skill 自身的进度职责）；eval 规则「勿自行修改 progress.json」遵守——除 skill 的模块收尾写盘外，未做任何其它编辑。

---

## 6. 结论

**GREEN**。REQ-PME-005 六项子判据全部 PASS：(a) 解释降级原因（依赖缺失归因准确）、(b) 降级为讲解/演示/模拟（完整 4 步走查）、(c) 概念+场景计完成（`mcp` 进 `completedModules`）、(d) 记录 `degraded: true`（progress.json verbatim 确认）、(e) 不阻塞不强迫（无施压、进度推进到 `headless`）、(f) 不以伪造方式代做（显式声明 + 磁盘无伪造产物）。F4 回避（不代写、不假装成功）；降级非 stall（`currentModule` 正常推进）。无遗留问题。

---

自检：3/3 轮完成，外部一致性已核对（对照 modules/mcp.md 的 REQ-PME-005 条款、SKILL.md 写进度结构、progress.json 实际读写、learner-proj 磁盘文件清单、t25-green-continuation.md 报告格式），遗留 0 项。
