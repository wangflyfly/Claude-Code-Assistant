# Claude Code Horse Tamer（驯马师）v4 使用说明书

> 适用版本：cc-assistant v4（模块化上手引导课程 + 社区 Skill 目录）
> 面向读者：学习者（会用 /assist 上课的人）+ 维护者（要安装、改模块、跑测试的人）

---

## 一、这是什么

**Claude Code Horse Tamer**（驯马师，原 CC Assistant）是一个 Claude Code Skill + 薄斜杠命令 `/assist`，给「有开发经验、但不会用 Claude Code」的开发者，用**真实任务边做边教**——像驯服烈马一样驯服 Claude Code，完成从零基础到能独立干活。

v3 从 v2 的「单会话任务引导」升级为**模块化课程·多会话渐进**：

- **11 个课程模块**，按功能机制逐个教学，一次 `/assist` 只教 1 个模块。
- 每模块**概念 + 场景 + 真实小练习**，练习就在你自己的真实项目里做。
- **多会话续接**：中断后随时回来接着学，进度自动保存。
- **两阶段**：进阶阶段（必修，广度覆盖全部模块）→ 高阶阶段（可选，对重点模块深入实操）。
- **收官整合**：最后一环组合 2+ 机制做一个综合任务，把学到的东西讲成体系。
- **社区 Skill 目录（v4）**：每模块内置「社区好 skill」小节，引用本地快照展示对应主题的社区 skill（不联网、不代装）。

---

## 二、安装与触发

### 2.1 安装位置（用户级，任意项目可用）

| 文件 | 位置 | 作用 |
|---|---|---|
| Skill 本体 | `~/.claude/skills/cc-assistant/SKILL.md` | 课程编排层 |
| 模块教学 | `~/.claude/skills/cc-assistant/modules/*.md` | 12 个模块内容 + 社区 skill 快照（`_community-skills.md`） |
| 斜杠命令 | `~/.claude/commands/assist.md` | `/assist` 入口 |

安装即把 `cc-assistant/` 目录（SKILL.md + modules/，含社区 skill 快照）复制到 `~/.claude/skills/cc-assistant/`，并放置 `assist.md` 命令。安装后**在任何项目**输入 `/assist` 即可触发。

### 2.2 触发

```
/assist
```

也可以直接对 Claude 说「教我用 Claude Code」——skill 的 description 会按语义触发。

---

## 三、课程流程（学习者视角）

### 3.1 首次进入（M0 定场 + 选项目）

第一次进课程会先做课前准备：

1. **定场**：介绍这是模块化上手引导课程，会用在你的真实项目里逐模块教。
2. **选真实项目**：选定一门课全程使用的项目（不要空壳/样例仓库）。
3. **询问定位**：全新开始 → 从「核心」模块开始；此前学过 → 按进度续接。

> 有未提交改动时，会先建议 commit 或备份再继续。

### 3.2 11 个课程模块（固定次序）

| 序号 | 模块 | 主题 |
|---|---|---|
| 1 | 核心 | 下指令 / 审阅改动 / 核心命令 / CLAUDE.md / Plan Mode 按需 |
| 2 | 记忆系统 | CLAUDE.md 五层记忆 + 规则级 `.claude/rules/` |
| 3 | Skills | 可复用流程固化成 skill |
| 4 | 子智能体 | 委派独立子任务、隔离上下文 |
| 5 | Hooks | 事件驱动自动检查/拦截 |
| 6 | MCP | 接入外部数据源与工具 |
| 7 | Headless | `claude -p` 脚本化/自动化 |
| 8 | Agent SDK | 把 Claude 嵌进自己的应用 |
| 9 | Plugins | 打包分发一组能力 |
| 10 | 工程化 | 成本 / 安全 / 指令 / 协作 |
| 11 | 收官整合 | 综合任务 + 体系讲解 |

按固定次序推进，**不跳步**；一次 `/assist` 只完整教当前 1 个模块。

### 3.3 每模块教学结构

每个模块按「**概念（是什么/何时用）→ 场景演示 → 真实轻练习**」推进：

- 先讲清这个机制是什么、什么时候用（just-in-time，不预灌整篇）。
- 再拿你项目的真实场景演示。
- 最后引导你**自己动手**做一个贴合该机制的真实小练习。

### 3.4 多会话续接

- 进度存在项目的 `.claude/cc-assistant/progress.json`（个人进度，默认被 gitignore，不进版本库）。
- 模块完成自动写进度；会话中途中断，已完成模块不丢。
- 下次 `/assist` 自动读取进度，从上次 `currentModule` 续接，**不重讲已完成模块**。
- 进度文件缺失/损坏 → 询问定位，不会静默出错。

### 3.5 两阶段教学

- **进阶阶段（必修）**：覆盖全部 11 个模块，广度教学（概念 + 场景 + 轻练习）。
- **高阶阶段（可选）**：完成进阶后自主选择进入，对 Agent SDK / Plugins / 工程化三个重点模块深入实操 + 一个更大综合项目。不进入高阶不视为未达标。

### 3.6 社区 skill 推荐（v4）

每个模块末尾有一个「**社区好 skill**」小节：

- 列出本模块映射的主题，指引查看本地快照 `_community-skills.md` 对应分组下的 skill（名称 + 一句话描述 + install 提示 + repo）。
- **只读本地快照，不联网**；安装与否由你决定，skill 不代装。
- 快照由仓库 CI 从 `catalog/catalog.json` 自动生成，随课程一起安装。

---

## 四、使用规则

### 4.1 交互模型（谁打字谁操作）

- **演示/讲解**由引导者负责；**练习由学习者动手**。
- 学习者卡住时，先引导自己尝试，必要时才给最小提示；**不代做练习**。
- 学习者请求代做 → 拒绝并给提示方向（这是学习目标决定的，不是刁难）。

### 4.2 安全边界

- 练习/任务**小而可逆**，任务过大拆小。
- **危险/不可逆操作**（删除数据、改数据库、force push 等）先说明风险、征得明确同意后才执行；风险过高建议改用沙箱项目。
- 真实项目有**未提交改动** → 先建议 commit 或备份。
- **落地动作由学习者决定**：演示/讲解可以，实际写入配置/创建文件由你决定与执行。

### 4.3 练习降级

模块练习依赖外部条件（MCP server / API key / Headless 环境 / SDK）缺失时，会**降级为讲解/演示/模拟**，记 `degraded: true`，概念与场景仍算完成、不阻塞课程。**只降级外部依赖缺失**；练习没合适场景时会在真实项目里换载体，不降级。

---

## 五、常见问题（FAQ）

**Q：`/assist` 没反应？**
A：确认安装位置正确（`~/.claude/skills/cc-assistant/` + `~/.claude/commands/assist.md`），并重启 Claude Code 会话。

**Q：上次学到一半，回来怎么接着学？**
A：直接 `/assist`，skill 会读 `progress.json` 从上次模块续接。若文件被删/损坏，会被询问「全新开始/续接」。

**Q：练习一定要在自己项目做吗？会不会搞乱项目？**
A：练习都选**小而可逆**的操作，且会先确认你的项目状态（有未提交改动先处理）。安全边界保证可撤销。

**Q：不想进入高阶阶段可以吗？**
A：可以。高阶是可选的深化延伸，不进入不影响课程完成。

**Q：每个模块都要学吗？**
A：进阶阶段 11 个模块是必修主线。想跳过某模块时，会被提示「属进阶必修」并征询确认后再决定。

**Q：想找某主题（如 Hooks）的好 skill 去哪看？**
A：课程模块的「社区好 skill」小节会指引到本地快照 `_community-skills.md` 对应分组；也可以浏览公开网页目录 `site/`（GitHub Pages，按主题/模块筛选）。想推荐新 skill 给社区 → 提 PR，见 `catalog/CONTRIBUTING.md`。

---

## 六、安装与维护（维护者视角）

### 6.1 文件结构

```
cc-assistant/
├── SKILL.md                 # 课程编排层（正文 <200 词）：M0→模块次序→会话流程→续接→安全边界→社区 skill 指引
├── modules/                 # 13 个文件：12 个模块教学 + 1 份社区 skill 快照
│   ├── m0-onboarding.md     # M0 定场+选项目+询问定位
│   ├── core.md              # 核心能力（含社区好 skill 小节）
│   ├── memory.md            # 记忆系统
│   ├── skills.md            # Skills
│   ├── subagent.md          # 子智能体
│   ├── hooks.md             # Hooks
│   ├── mcp.md               # MCP（含降级）
│   ├── headless.md          # Headless（含降级）
│   ├── sdk.md               # Agent SDK（含降级 + 高阶小节）
│   ├── plugins.md           # Plugins（含高阶小节）
│   ├── engineering.md       # 工程化（含高阶小节）
│   ├── capstone.md          # 收官整合（综合任务+体系讲解）
│   └── _community-skills.md # 社区 skill 快照（sync-catalog.mjs 生成，勿手工编辑）
└── eval/
    ├── cases.md             # 场景用例（TDD 输入，34 REQ 覆盖 + RED 基线 + GREEN 区 + M 区目录用例）
```

安装副本：`~/.claude/skills/cc-assistant/`（SKILL.md + modules/，含 `_community-skills.md`）+ `~/.claude/commands/assist.md`。

### 6.2 修改模块 / 新增内容

- 每模块按统一结构编写：**是什么/何时用 → 场景演示 → 真实轻练习 → 交叉引用**（→ 高阶小节，仅 sdk/plugins/engineering）。
- 参考类内容（CLAUDE.md 模板、最佳实践等）用 `**REQUIRED SUB-SKILL:** claude-code-guide` 交叉引用，**不内联复制**；claude-code-guide 未覆盖的引用 docs.anthropic.com。
- 遵守「书框架复用边界」：引用《Claude Code 实战》的原创框架（四层架构/触发口诀等）须**改写为自有表达并归因**，不整段照抄、不保留原句式。
- 改完 `SKILL.md` 后校验正文词数：`sed '/^---\r*$/,/^---\r*$/d' cc-assistant/SKILL.md | wc -w` 应 <200。

### 6.3 测试（eval / TDD）

- 用例面在 `cc-assistant/eval/cases.md`（54 个场景覆盖 34 REQ，每场景 WHEN/THEN 谓词）。
- TDD 方法：用**子智能体模拟「学习者」**——先跑无 skill 基线（RED），再跑有 skill 验证行为收敛（GREEN）。
- 代表场景：记忆系统模块、多会话续接、收官综合任务（组合 2+ 机制 + 说出选型理由）。

### 6.4 发布 / 同步

1. 改动源 `cc-assistant/`。
2. 同步到安装副本：`cp -r cc-assistant/SKILL.md cc-assistant/modules ~/.claude/skills/cc-assistant/`（modules/ 含 `_community-skills.md`），并更新 `~/.claude/commands/assist.md`。
3. 重启会话验证 `/assist` 可用。

### 6.5 社区 Skill 目录子系统（v4）

仓库附带一个社区 Skill 目录，维护者视角：

```
catalog/                          # 目录数据层
├── catalog.json                  # 唯一事实源（skills 数组，REQ-CAT-001）
├── topics.json                   # 主题词表（机器可读唯一源）
├── topics.md                     # 词表说明 + 扩充流程
├── course-mapping.json           # 课程模块 → 主题映射（无 phase 粒度）
├── catalog.schema.json           # catalog 结构 JSON Schema
├── validate.mjs                  # 结构校验（JSON/schema/id 唯一/topics ⊆ 词表/必填/映射键一致）
├── sync-catalog.mjs              # 机器生成三产物 + --check 防漂移
├── validate.test.mjs             # 校验用例矩阵（TDD）
├── sync-catalog.test.mjs         # 输出断言 + 漂移 + CRLF 回归
└── CONTRIBUTING.md               # 贡献指南
site/                             # GitHub Pages 发布源（仅此目录公开）
├── .nojekyll
├── index.html / assets/          # 静态站（客户端 fetch site/data 渲染）
└── data/                         # 生成产物：catalog.json + course-mapping.json
.github/
├── workflows/catalog-ci.yml      # CI：PR validate（只读）+ push main sync（再生成提交）
└── PULL_REQUEST_TEMPLATE/skill-entry.md
```

**本地命令**：

```bash
node catalog/validate.mjs              # 结构校验（退出码 0/1）
node catalog/sync-catalog.mjs          # 重新生成 site/data/ + _community-skills.md
node catalog/sync-catalog.mjs --check  # 防漂移检查（0=一致 / 1=漂移）
```

**维护要点**：
- `catalog.json` 是唯一事实源，条目**不存课程字段**（课程归属由 `course-mapping.json` 推导）。
- 三产物（site/data 两文件 + 快照）为**入库提交的生成产物**，勿手工编辑、勿加入 gitignore；合入 main 后 CI `sync` job 自动再生成。
- 课程改模块名：只改 `course-mapping.json`，catalog 条目不动。
- 收录判据：仅 Claude Code skills（SKILL.md 形态）；无自动合入，合入权在维护者。

---

## 七、设计约定速查

| 项 | 约定 |
|---|---|
| 进度文件 | `.claude/cc-assistant/progress.json`，结构 `{phase, completedModules[{phase, moduleId, degraded?}], currentModule:{phase, moduleId}, updatedAt}` |
| moduleId | core / memory / skills / subagent / hooks / mcp / headless / sdk / plugins / engineering / capstone |
| phase | `进阶`（必修广度）/ `高阶`（可选深度） |
| 降级 | `degraded: true` 仅限外部依赖缺失（REQ-PME-005） |
| 交互 | 演示由 skill、练习由学习者、不代做（D13） |
| 安全 | 小而可逆、危险先征得同意、未提交先处理、落地由学习者决定 |
| catalog 事实源 | `catalog/catalog.json`（skills 数组），条目仅元数据、无课程字段 |
| 主题词表 | `catalog/topics.json`（机器可读唯一源），catalog 条目 `topics` ⊆ 词表 |
| 课程映射 | `catalog/course-mapping.json`（模块→主题），无 phase 粒度（REQ-CMP-005） |
| 生成产物 | `site/data/` 两文件 + `_community-skills.md`，入库提交、`--check` 防漂移 |
| 收录/合入 | 仅 SKILL.md 形态；无自动合入，维护者审核（REQ-CON-004） |
