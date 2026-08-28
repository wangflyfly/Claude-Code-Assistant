# Claude Code Skill 开发规范

> 指导如何开发、测试、部署自己的 Claude Code Skill。
> 综合自：Skill 作者规范（[agentskills.io/specification](https://agentskills.io/specification)）、skill 写作方法论（TDD 式）、Claude Code 使用最佳实践。

---

## 1. 什么是 Skill

**Skill 是一份「经过验证的技巧 / 模式 / 工具」的参考指南**，让未来的 agent 能发现并复用它。

| 是 | 不是 |
|---|---|
| 可复用的技巧（Technique） | 一次性的解决方案 |
| 思考模式（Pattern） | 「我上次怎么解决某问题」的流水账叙事 |
| API / 工具参考文档（Reference） | 已被广泛文档化的标准实践 |
| 跨项目通用的流程 | 仅适用于某项目的约定（应放 CLAUDE.md） |

### 何时创建 Skill

**创建当：**
- 该技巧对你不是「显而易见」的
- 你会跨项目反复查阅
- 模式可推广到多个场景
- 他人也能受益

**不要创建当：**
- 一次性方案
- 已有完善文档的标准实践
- 项目专属约定（放进指令文件 / CLAUDE.md）
- 纯机械约束（能用正则/校验强制时，直接自动化——文档留给「需要判断」的场景）

---

## 2. 目录结构

```
skills/
  skill-name/
    SKILL.md              # 主文档（必需）
    supporting-file.*     # 仅在需要时
```

- **扁平命名空间**：所有 skill 共用一个可搜索命名空间
- **拆分为独立文件的场景**：
  1. 重型参考（100+ 行，如 API 文档、完整语法）
  2. 可复用工具（脚本、工具、模板）
- **保持内联**：
  - 原则与概念
  - 代码模式（< 50 行）
  - 其他一切内容

### 三种文件组织形态

| 形态 | 目录 | 适用场景 |
|---|---|---|
| 自包含 | `skill/` 只有 `SKILL.md` | 内容都能装下，无重型参考 |
| 含可复用工具 | `SKILL.md` + `example.ts` | 工具是可复用代码而非叙事 |
| 含重型参考 | `SKILL.md` + `ref.md` + `scripts/` | 参考材料太大，无法内联 |

---

## 3. SKILL.md 格式规范

### frontmatter（YAML）

- **必填字段：`name` 和 `description`**（支持字段见 [agentskills.io/specification](https://agentskills.io/specification)）
- **总长不超过 1024 字符**
- `name`：只允许字母、数字、连字符（禁止括号、特殊字符）
- `description`：第三人称，**只描述何时使用**（不是描述它做什么）

```markdown
---
name: Skill-Name-With-Hyphens
description: Use when [具体的触发条件与症状]
---

# Skill Name
...
```

### 正文标准结构

```markdown
# Skill Name

## Overview
是什么？核心原则 1-2 句。

## When to Use
（若决策非显而易见，可用小型内联流程图）
- 症状与使用场景的列表
- 何时不该用

## Core Pattern（技巧/模式类）
- 前后对比的代码示例

## Quick Reference
- 表格或列表，便于快速扫读常见操作

## Implementation
- 简单模式：内联代码
- 重型参考/工具：链接到独立文件

## Common Mistakes
- 会出什么问题 + 修复方法

## Real-World Impact（可选）
- 具体成果
```

---

## 4. description 写作规范（SDO · Skill Discovery Optimization）

**关键原则：description = 何时使用，不是「它做什么」。**

未来 agent 靠读取 description 决定「现在该不该加载这个 skill」。它必须能回答：「我现在该读这个 skill 吗？」

### 为什么不能写工作流摘要

测试发现：当 description 总结了 skill 的工作流，agent 会**照着 description 做一遍而跳过正文**——即使正文的流程图明确要求两阶段评审，agent 也可能只做一次。

- 陷阱：总结工作流的 description 会变成捷径，skill 正文变成被跳过的文档。

### 正确 / 错误对比

```yaml
# ❌ 错误：总结工作流——agent 可能照此执行而跳过正文
description: Use when executing plans - dispatches subagent per task with code review between tasks

# ❌ 错误：过程细节过多
description: Use for TDD - write test first, watch it fail, write minimal code, refactor

# ✅ 正确：只写触发条件，不写工作流
description: Use when executing implementation plans with independent tasks in the current session

# ✅ 正确：仅触发条件
description: Use when implementing any feature or bugfix, before writing implementation code
```

```yaml
# ❌ 错误：太抽象模糊，没有「何时用」
description: For async testing

# ❌ 错误：第一人称
description: I can help you with async tests when they're flaky

# ❌ 错误：skill 本身与技术无关却提技术
description: Use when tests use setTimeout/sleep and are flaky

# ✅ 正确：以 "Use when" 开头，描述问题，不写工作流
description: Use when tests have race conditions, timing dependencies, or pass/fail inconsistently

# ✅ 正确：技术相关 skill，明确触发条件
description: Use when using React Router and handling authentication redirects
```

### description 硬性要求

- 以 **"Use when..."** 开头，聚焦触发条件
- 描述**问题本身**（如「竞态条件」「行为不一致」），而非语言症状（如 `setTimeout`/`sleep`）
- 除非 skill 本身技术相关，否则触发词保持与技术无关
- 技术相关 skill：在触发词中明确技术
- 第三人称（会被注入系统提示词）
- **绝不总结 skill 的过程 / 工作流**
- 尽量 < 500 字符

---

## 5. 命名规范

**用主动语态、动词开头：**

- ✅ `creating-skills`（不是 `skill-creation`）
- ✅ `condition-based-waiting`（不是 `async-test-helpers`）
- ✅ `root-cause-tracing`（不是 `debugging-techniques`）

**按「你做的事」或「核心洞见」命名：**

- ✅ `flatten-with-flags`（优于 `data-structure-refactoring`）
- ✅ `using-skills`（不是 `skill-usage`）

**动名词（-ing）适合描述流程：**

- `creating-skills`、`testing-skills`、`debugging-with-logs`
- 主动、描述你正在采取的动作

---

## 6. Token 效率规范（关键）

**问题：** getting-started 与高频引用的 skill 会加载进**每一次对话**，每个 token 都算数。

### 字数目标

| 类型 | 目标 |
|---|---|
| getting-started 工作流 | < 150 词 |
| 高频加载 skill | < 200 词 |
| 其他 skill | < 500 词 |

### 技巧

**1. 把细节移入工具 help：**
```bash
# ❌ 在 SKILL.md 里罗列所有参数
search-conversations supports --text, --both, --after DATE, --before DATE, --limit N

# ✅ 引用 --help
search-conversations 支持多种模式与过滤。运行 --help 查看详情。
```

**2. 交叉引用其他 skill：**
```markdown
# ❌ 重复工作流细节（20 行重复指令）

# ✅ 引用其他 skill
**REQUIRED SUB-SKILL:** 使用 [other-skill-name] 处理该工作流。
```

**3. 压缩示例** —— 一个最小可读示例胜过冗长叙事。

**4. 消除冗余：**
- 不重复被交叉引用的内容
- 不解释命令已显而易见的部分
- 不包含同一模式的多个示例

**校验：**
```bash
wc -w skills/path/SKILL.md
```

---

## 7. 代码示例规范

**一个优秀的示例胜过多个平庸示例。**

选最相关语言：
- 测试技巧 → TypeScript/JavaScript
- 系统调试 → Shell/Python
- 数据处理 → Python

**优秀示例：**
- 完整可运行
- 注释解释 **WHY**
- 来自真实场景
- 清晰展示模式
- 可直接适配（非通用填空模板）

**不要：**
- 用 5+ 种语言实现
- 写填空式模板
- 编造别扭的示例

---

## 8. 流程图使用规范

**只在以下场景用流程图：**
- 非显而易见的决策点
- 可能过早停止的流程循环
- 「A vs B 何时用」的决策

**永远不用流程图处理：**
- 参考材料 → 用表格、列表
- 代码示例 → 用 Markdown 代码块
- 线性指令 → 用编号列表
- 无语义含义的标签（step1、helper2）

---

## 9. 交叉引用其他 Skill

引用其他 skill 时用 **skill 名称 + 明确必需标记**：

- ✅ `**REQUIRED SUB-SKILL:** 使用 superpowers:test-driven-development`
- ✅ `**REQUIRED BACKGROUND:** 你必须理解 superpowers:systematic-debugging`
- ❌ `参见 skills/testing/test-driven-development`（不明确是否必需）
- ❌ `@skills/testing/test-driven-development/SKILL.md`（force-loads，浪费 200k+ context）

**为什么不用 `@` 链接：** `@` 语法会立即强制加载文件，在需要之前就烧掉大量 context。

---

## 10. TDD 式开发流程（RED-GREEN-REFACTOR）

**写 skill 就是「把 TDD 应用到流程文档」上。核心铁律：**

```
没有先写失败测试的 skill 就不是 skill —— 删掉重来
```

对**新 skill** 和**编辑已有 skill** 都适用，无例外：
- 不是「简单补充」
- 不是「只是加个章节」
- 不是「文档更新」
- 不要保留未测试的改动当作「参考」
- 不要在跑测试时顺手「适配」
- 删就是删

### TDD 概念映射

| TDD 概念 | Skill 创建 |
|---|---|
| 测试用例 | 用子代理跑压力场景 |
| 生产代码 | Skill 文档（SKILL.md） |
| 测试失败（RED） | 无 skill 时 agent 违反规则（基线行为） |
| 测试通过（GREEN） | 有 skill 时 agent 遵守 |
| 重构 | 堵漏洞且保持合规 |
| 先写测试 | 写 skill 前先跑基线场景 |
| 观察失败 | 逐字记录 agent 的合理化借口 |
| 最小代码 | 只写针对这些具体违规的指导 |
| 观察通过 | 验证 agent 现在遵守 |
| 重构循环 | 发现新借口 → 堵上 → 复测 |

### 三步流程

**RED — 写失败测试（基线）**
- 用**无 skill** 的子代理跑压力场景
- 逐字记录行为：做了什么选择？用了什么合理化借口？哪些压力触发违规？
- 必须先看到「没有 skill 时 agent 的自然行为」，才知道要教什么

**GREEN — 写最小 skill**
- 只针对基线中出现的具体违规写指导，**不为假设场景加内容**
- 用同一场景 + skill 复测，agent 应能遵守

**REFACTOR — 堵漏洞**
- agent 又找到新借口？加显式反制，再测，直到无懈可击

### 措辞微测（micro-test）先行

完整压力场景是最终关卡，但慢且贵。先微测措辞本身：

1. **每次一个全新上下文样本**——裸 API 调用，或单发子代理。系统提示 = 指导将要生活的完整环境（不是孤立的一段指导）
2. **永远带「无指导对照」**——对照没表现出问题，就说明没东西要修，停手
3. **每个变体 5+ 次重复**——单次样本会说谎
4. **人工审读每一个标记命中**——模板回显与引用反例会伪装成命中
5. **方差本身是度量**——指导生效时，重复会收敛到同一形态；5 次 5 种解释 = 措辞没约束力

---

## 11. 测试方法论

### 不同 skill 类型的不同测法

**纪律强制型（规则/要求）**——如 TDD、验证后再交付
- 学术问答：他们懂规则吗？
- 压力场景：压力下会遵守吗？
- 多重压力叠加：时间 + 沉没成本 + 疲惫
- 找出合理化借口并加显式反制
- **成功标准**：最大压力下 agent 仍遵守规则

**技巧型（how-to 指南）**——如条件等待、根因追踪
- 应用场景：能正确应用技巧吗？
- 变体场景：能处理边界情况吗？
- 缺失信息测试：指令有漏洞吗？
- **成功标准**：agent 能把技巧成功应用到新场景

**模式型（心智模型）**
- 识别场景：知道何时该用吗？
- 应用场景：能用这个心智模型吗？
- 反例：知道何时不该用吗？
- **成功标准**：agent 能正确判断何时/如何应用

**参考型（文档/API）**
- 检索场景：能找到对的信息吗？
- 应用场景：找对了能用对吗？
- 缺口测试：常见用例覆盖了吗？
- **成功标准**：agent 能发现并正确应用参考信息

---

## 12. 防理性化（Bulletproofing）

**适用范围：** 纪律失败——agent 知道规则但压力下跳过。对「输出形状不对」或「缺要素」的问题，反效果，改用配方/结构（见下节）。

### 显式堵住每个漏洞

不要只陈述规则——要禁止具体变通：

```markdown
# ❌
先写代码再写测试？删掉。

# ✅
先写代码再写测试？删掉。重新开始。

**无例外：**
- 不要留作「参考」
- 不要在写测试时「顺手适配」
- 不要看它
- 删就是删
```

### 处理「精神 vs 字面」争论

早期加入基本原则：

```markdown
**违反规则的文字，就是违反规则的精神。**
```

这能切断一整类「我是按精神来的」的合理化。

### 建立合理化表格

把基线测试抓到的每条借口都放进表格：

```markdown
| 借口 | 现实 |
|---|---|
| 「太简单不用测」 | 简单代码也会坏。测试只要 30 秒。 |
| 「我之后再测」 | 测试瞬间通过证明不了任何事。 |
| 「后测能达到同样目的」 | 后测 = 「这代码干嘛的？」先测 = 「这代码该干嘛？」 |
```

### 建立红旗清单

让 agent 能自查：

```markdown
## 红旗——停下来重新开始
- 先写代码再写测试
- 「我已经手动测过了」
- 「后测能达到同样的目的」
- 「重要的是精神不是仪式」
- 「这个不一样因为……」
**以上任一条 = 删代码，用 TDD 重新开始。**
```

### 按失败类型选择表达形式

| 基线失败类型 | 正确形式 | 错误形式 |
|---|---|---|
| 压力下跳过/违反规则（知道但照样做） | 禁令 + 合理化表 + 红旗清单 | 软指导（「尽量…」「考虑…」） |
| 遵守了但输出形状不对 | 正性配方/契约：规定输出「是什么」——各部分、按顺序 | 禁令清单（「不要重述…」） |
| 已有产出物缺了必需元素 | 结构性：模板里的 REQUIRED 字段/槽位 | 模板旁的散文提醒 |
| 行为依赖某个条件 | 条件化：挂在可观察谓词上（「若 brief 存在则引用它」） | 无条件规则 + 豁免条款 |

**为什么禁令会反噬形状类问题：** 在竞争激励下，agent 会和「不要 X」讨价还价。措辞测试中，禁令组产出的非预期内容明显多于配方组——按自己情况微测，但默认不选禁令。

**无论选哪种形式：**
- **不加细微例外条款**。「不要 X 除非必要」会重新打开谈判——真实例外写成独立的条件规则
- **豁免条款不会限定范围**。「此限制不适用于代码块」照样压制代码块。若某部分必须豁免，就重构结构让规则够不着它

---

## 13. 常见反模式

| 反模式 | 例子 | 为什么坏 |
|---|---|---|
| 叙事式示例 | 「在 2025-10-03 会话中我们发现 projectDir 为空…」 | 太具体，不可复用 |
| 多语言稀释 | example-js.js + example-py.py + example-go.go | 平庸质量、维护负担 |
| 流程图里写代码 | `step1 [label="import fs"]` | 无法复制粘贴、难读 |
| 泛化标签 | helper1、helper2、step3、pattern4 | 标签应有语义含义 |

---

## 14. Skill 创建清单（TDD 适配）

> **为下面每一项创建一个 todo 项。**

**RED 阶段——写失败测试：**
- [ ] 创建压力场景（纪律型 skill 需 3+ 压力叠加）
- [ ] 无 skill 跑场景，逐字记录基线行为
- [ ] 识别合理化/失败的规律

**GREEN 阶段——写最小 skill：**
- [ ] 名称只用字母、数字、连字符
- [ ] YAML frontmatter 含必填 `name` + `description`（总长 ≤ 1024 字符）
- [ ] description 以 "Use when..." 开头，含具体触发词/症状
- [ ] description 第三人称
- [ ] 全文埋搜索关键词（错误信息、症状、工具）
- [ ] 清晰的 Overview + 核心原则
- [ ] 针对 RED 阶段识别的具体基线失败
- [ ] 指导形式与失败类型匹配（见第 12 节）
- [ ] 行为塑形类指导：措辞已对照「无指导对照」微测（5+ 次重复，人工审读每个命中）——纯参考 skill 不适用
- [ ] 代码内联或链接到独立文件
- [ ] 一个优秀示例（非多语言）
- [ ] 带 skill 跑场景，验证 agent 现在遵守

**REFACTOR 阶段——堵漏洞：**
- [ ] 从测试识别新的合理化
- [ ] 加显式反制（纪律型 skill）
- [ ] 从所有测试迭代建立合理化表
- [ ] 建立红旗清单
- [ ] 复测直到无懈可击

**质量检查：**
- [ ] 仅当决策非显而易见时才用小流程图
- [ ] 快速参考表
- [ ] Common Mistakes 章节
- [ ] 无叙事式故事
- [ ] 独立文件仅用于工具或重型参考

**部署：**
- [ ] 提交 skill 到 git 并推送
- [ ] 若广泛有用，考虑通过 PR 回馈上游

---

## 15. 发现流程（agent 如何找到你的 skill）

1. 遇到问题（「测试 flaky」）
2. 搜索 skills（grep descriptions、浏览分类）
3. 找到 SKILL（description 匹配）
4. 扫读 Overview（相关吗？）
5. 读模式（快速参考表）
6. 加载示例（只在实现时）

**为此优化：** 把可搜索词放在开头且反复出现。

---

## 16. 交付检查清单

- [ ] 已安装到 `~/.claude/skills/<name>/`（个人环境）或在插件市场发布
- [ ] `wc -w` 字数符合目标（高频 < 200，其他 < 500）
- [ ] description 只写触发条件、不含工作流摘要
- [ ] 已在带 skill / 不带 skill 的场景下验证行为差异
- [ ] 提交到 git，必要时推送
