# Tasks: CC Assistant v3（模块化上手引导课程）

## File Structure

| 文件 | 动作 | 职责（一句话） |
|---|---|---|
| `cc-assistant/SKILL.md` | Modify | v3 课程编排层：M0→11 模块次序、会话流程、续接、安全边界（<200 词） |
| `cc-assistant/modules/m0-onboarding.md` | Create | M0 定场说明+选真实项目+询问全新/续接 |
| `cc-assistant/modules/core.md` | Create | 核心模块：下指令/审阅改动/核心命令/CLAUDE.md/Plan Mode 按需 |
| `cc-assistant/modules/memory.md` | Create | 记忆系统模块（含 Rule 规则级）教学 |
| `cc-assistant/modules/skills.md` | Create | Skills 模块教学 |
| `cc-assistant/modules/subagent.md` | Create | 子智能体模块教学 |
| `cc-assistant/modules/hooks.md` | Create | Hooks 模块教学 |
| `cc-assistant/modules/mcp.md` | Create | MCP 模块教学 |
| `cc-assistant/modules/headless.md` | Create | Headless 模块教学 |
| `cc-assistant/modules/sdk.md` | Create | Agent SDK 模块教学（含高阶深入实操小节） |
| `cc-assistant/modules/plugins.md` | Create | Plugins 模块教学（含高阶深入实操小节） |
| `cc-assistant/modules/engineering.md` | Create | 工程化模块教学（成本/安全/指令/协作，含高阶深入实操小节） |
| `cc-assistant/modules/capstone.md` | Create | 收官整合模块：跨模块综合任务+体系讲解（改写归因）+高阶综合项目分支 |
| `cc-assistant/eval/cases.md` | Modify | 模块化用例面：每模块概念+轻练习、多会话续接、收官综合、无 skill 基线 vs 有 skill 对比 |
| `~/.claude/commands/assist.md` | Modify | `/assist` 入口，指向 v3 SKILL.md |
| `~/.claude/skills/cc-assistant/SKILL.md` | Modify | 安装副本，与源同步 |
| `CONTEXT.md` | Modify | 术语更新：CC Assistant 定义、引导会话→模块课程、教学时机/独立复现扩展、进阶能力→模块清单（子智能体）、新增 Headless/Agent SDK/Plugins |
| `CLAUDE.md`（根） | Modify | Project 段（第 7 行）指针 v2→v3 + 定义句与 Architecture/Commands 内 v2 描述全部改写为模块化课程 |
| `.gitignore` | Modify | 清理 v1 残留 `.claude/cc-assistant/project.json`（第 29 行）；忽略 `progress.json` |
| `cc助手需求.md` | Modify | 顶部「以 v2 为准」指针更新为 v3 或整体标注废弃 |
| `specs/`（根，6 份 v2 spec） | Modify | 执行期由 spec-merger 合并/替换为 v3 模块化 spec（4 废弃 + 2 继承改写） |

## Interfaces

- **progress.json**：`{phase: "进阶"|"高阶", completedModules: [{phase, moduleId, degraded?}], currentModule: {phase, moduleId}, updatedAt: ISO}`；moduleId ∈ {core, memory, skills, subagent, hooks, mcp, headless, sdk, plugins, engineering, capstone}。
- **SKILL.md → modules/**：编排层按模块次序引导读取 `modules/<module>.md`；模块文件返回「概念/场景/练习/续接提示」结构。
- **SKILL.md → eval**：编排完整性由 eval/cases.md 覆盖（无 skill 基线 vs 有 skill）。
- **assist.md → SKILL.md**：`/assist` 命令体指向 SKILL.md 课程编排。
- **课程模块间**：同一学习者项目串联（REQ-PME-002），进度经 progress.json 续接。
- **spec-merger**：执行期将根 `specs/` 6 份 v2 spec 替换为 v3 模块化 spec（与 T30 对接）。

## Batches

### Batch 1 — eval 基线（RED）

- [x] T1: 重构 `cc-assistant/eval/cases.md` 为模块化用例面——每模块「概念问答+轻练习」场景、多会话续接场景（中断→重进→接上）、收官综合场景（组合 2+ 机制），按 D10 规则每个成功标准挂可观察谓词（WHEN/THEN）；子步骤：模块用例面→续接用例→收官用例→谓词核对；依赖：无；验收：`ssf validate` 通过、每场景有 WHEN/THEN 判据
- [x] T2: 无 skill 基线跑测——用子智能体模拟「学习者」跑 2 个代表场景（记忆系统模块 + 多会话续接），逐字记录基线行为与违规（如模块不覆盖、进度不续接、替学习者代做）；基线报告落盘 `changes/cc-assistant-v3/.superpowers/sdd/reports/baseline.md`；依赖：T1；验收：基线报告存在且含逐字行为记录
- [x] T3: 从基线识别 LLM 失败规律并整理（过度预灌/漏覆盖/不续接/代做），作为 SKILL.md 与模块文件的反制输入；依赖：T2；验收：失败规律清单明确、每条可映射到后续反制指令

### Batch 2 — SKILL.md 编排层

- [x] T4: 重写 `cc-assistant/SKILL.md` 为 v3 课程编排层——frontmatter（name=cc-assistant，description 按 SDO 以 "Use when" 开头、不含工作流摘要、≤1024 字符）、M0 定场→11 模块固定次序、一次一单机制模块、收官整合多会话、**续接入口交接 stub**（具体读写逻辑见 T20）、无文件询问、just-in-time、安全边界、交互模型（演示由 skill/练习由学习者动手/拒绝代做，D13）、`**REQUIRED SUB-SKILL:** claude-code-guide` 交叉引用；正文 <200 词（wc -w 校验）；依赖：T3；验收：满足 D2/D13、REQ-MCO/REQ-SFT/REQ-RCL
- [x] T5: 更新 `~/.claude/commands/assist.md` 指向 v3 SKILL.md 课程编排（保留 `/assist` 触发）；依赖：T4；验收：`/assist` 触发进入课程而非单会话引导
- [x] T6: 同步安装 `cc-assistant/SKILL.md` → `~/.claude/skills/cc-assistant/SKILL.md`（用户级安装）；依赖：T4；验收：安装副本与源一致、在任意项目可触发

### Batch 3 — 模块支撑文件

- [x] T7: 创建 `cc-assistant/modules/m0-onboarding.md`——M0 定场说明+选真实项目+询问「全新/续接」（REQ-MCO-001/SCN-004 流程一致）；依赖：T4；验收：首次进入流程与 SCN-004 一致
- [x] T8: 创建 `cc-assistant/modules/core.md`——核心模块：下指令/审阅改动/核心命令/CLAUDE.md/Plan Mode 按需（REQ-COR-001~005），just-in-time 不预灌；依赖：T4；验收：REQ-COR 全部场景覆盖
- [x] T9: 创建 `cc-assistant/modules/memory.md`——记忆系统（CLAUDE.md 五层记忆+Rule 规则级），配真实轻练习（写/改 CLAUDE.md）；依赖：T4；验收：REQ-PME 练习载体、REQ-MCO 结构
- [x] T10: 创建 `cc-assistant/modules/skills.md`——Skills 模块教学+轻练习（定义/触发/渐进披露）；依赖：T4；验收：结构与 T9 同
- [x] T11: 创建 `cc-assistant/modules/subagent.md`——子智能体模块教学+轻练习（委派/5 种模式）；依赖：T4；验收：结构与 T9 同
- [x] T12: 创建 `cc-assistant/modules/hooks.md`——Hooks 模块教学+轻练习（配置拦截 Hook）；依赖：T4；验收：结构与 T9 同
- [x] T13: 创建 `cc-assistant/modules/mcp.md`——MCP 模块教学+轻练习（添加 server），含依赖缺失降级（REQ-PME-005）；依赖：T4；验收：降级语义与 D3/D7 一致
- [x] T14: 创建 `cc-assistant/modules/headless.md`——Headless 模块教学+轻练习（claude -p），含依赖缺失降级；依赖：T4；验收：结构与 T13 同
- [x] T15: 创建 `cc-assistant/modules/sdk.md`——Agent SDK 模块教学+轻练习（query 调用）+ **高阶深入实操小节**（可选，phase=高阶时进入），含依赖缺失降级；依赖：T4；验收：REQ-TPT-002 承载、结构与 T13 同
- [x] T16: 创建 `cc-assistant/modules/plugins.md`——Plugins 模块教学+轻练习（安装/分发决策）+ **高阶深入实操小节**；依赖：T4；验收：REQ-TPT-002 承载、结构与 T9 同
- [x] T17: 创建 `cc-assistant/modules/engineering.md`——工程化模块教学（成本/安全/指令/协作）+轻练习 + **高阶深入实操小节**；依赖：T4；验收：与书治理四要素对齐、REQ-TPT-002 承载
- [x] T18: 创建 `cc-assistant/modules/capstone.md`——收官整合模块：跨模块综合任务（组合 2+ 机制）+ 四层架构/触发口诀/关注点分离/选型决策树体系讲解（按书框架复用边界改写为自有表达并归因、不内联书原文）+ **高阶综合项目分支**（高阶进入者做更大综合项目，REQ-TPT-002）；依赖：T8-T17；验收：REQ-ICN 全部场景、D8 改写归因
- [x] T19: 全模块交叉核对——11 模块+ M0 与 SKILL.md 编排次序、progress moduleId、phase 一致；显式核对 REQ-PME-002（同项目串联）、REQ-PME-001（不在空壳/样例做）、REQ-PME-004（练习小而可逆）、REQ-TPT-001（进阶必修覆盖 11 模块）、REQ-TPT-003（phase 区分）；练习「无适用场景→同一真实项目内换载体，不降级」（design 第 3 轮 LOW 承接）；依赖：T7-T18；验收：无悬空引用、术语「子智能体」统一、上述 REQ 已由模块/进度结构承载

### Batch 4 — 进度续接

- [x] T20: 在 `cc-assistant/SKILL.md` 写入 progress.json 续接编排指令段（产物为自然语言编排指令，非代码）——读取（存在→从 currentModule 模块级续接；损坏→按无进度询问）、写入（模块完成时更新 completedModules/currentModule/updatedAt，completedModules 元素 `{phase, moduleId, degraded?}`）、无文件→询问定位；依赖：T4、T19；验收：REQ-SCN-001~005、D3 编码

### Batch 5 — 文档影响面

- [x] T21: 更新 `CONTEXT.md`——按 proposal Impact L59：CC Assistant 定义改写、引导会话→模块课程、教学时机/独立复现扩展、进阶能力→v3 模块清单（术语统一「子智能体」）、MCP 条目同步、新增 Headless/Agent SDK/Plugins 术语；依赖：T4；验收：proposal L59 清单逐条落实（文档类，用逐条核对校验）
- [x] T22: 更新根 `CLAUDE.md`——Project 段第 7 行指针 `changes/cc-assistant-v2/`→`changes/cc-assistant-v3/` + 定义句（「用真实任务边做边教」等 v2 描述）与 Architecture/Commands 内全部 v2 措辞一并改写为模块化课程；术语统一「子代理」→「子智能体」（CLAUDE.md 内 L17/L27 等残留）；Project 段 state 描述从「executing」同步为 v3 当前态（specifying）；依赖：T21（CLAUDE.md 引「领域词汇见 CONTEXT.md 唯一术语表」，需 CONTEXT.md 先更新）；验收：全文件无 v2 任务驱动残留、「子代理」清零、state 描述与 `.spec-superflow.yaml` 一致（grep 核对，文档类）
- [x] T23: 更新 `.gitignore`——清理 v1 残留 `.claude/cc-assistant/project.json`（第 29 行）+ 确保 `progress.json` 被忽略（合并 REQ-SCN-006 与 proposal Impact L63）；依赖：无；验收：`git check-ignore` 命中 progress.json、project.json 条目清理（文档类）
- [x] T24: 更新 `cc助手需求.md`——顶部「以 v2 为准」指针更新为 v3 或整体标注废弃；依赖：T21；验收：指针正确、历史归档说明清晰（文档类）

### Batch 6 — eval GREEN 验证

- [x] T25: 有 skill 跑测——用子智能体模拟「学习者」带 skill 跑 T2 的两个代表场景（记忆系统模块 + 多会话续接），对比基线验证行为收敛（模块覆盖、进度续接、不代做）；依赖：T2、T3、T4、T20；验收：对比 T3 失败规律、每项反制生效
- [x] T26: 收官综合场景验证——带 skill 跑跨模块综合任务（组合 2+ 机制），核对学习者独立完成+说出选型理由（D10 谓词）；依赖：T18、T25；验收：REQ-ICN-002 谓词通过
- [x] T27: 全书框架改写抽查——核对 capstone.md 体系讲解无书原文整段照抄、无原章节结构/句式，归因标注；依赖：T18；验收：书框架复用边界判定标准满足
- [x] T28: 模块依赖缺失降级验证——模拟无 MCP server/API key 场景，核对模块降级为讲解/演示/模拟且记 `degraded` 计入进度；依赖：T20、T25；验收：REQ-PME-005 场景通过
- [x] T29: 回归与收尾——全量 eval/cases.md 通过、SKILL.md 与安装副本一致、progress.json 忽略确认；依赖：T23、T25-T28；验收：无失败用例、无回归

### Batch 7 — spec 合并与收尾

- [x] T30: 移交/触发 spec-merger 阶段（spec-superflow 第 7 skill，code-reviewer 之后）——将根 `specs/` 6 份 v2 spec 合并/替换为 v3 模块化 spec（4 废弃：session-orchestration/task-selection/advanced-teaching/independent-reproduction；2 继承改写：core-teaching→REQ-COR、reference-crosslink→REQ-RCL），勿与 v1 已清理产物混淆（proposal Impact L61）；依赖：执行期 code-reviewer 通过（v3 specs 已在 specifying 阶段定稿，spec-merger 时序由 code-reviewer 决定）；验收：根 `specs/` 与 v3 specs 一致、v2 遗留 0 项、`spec_merged: true`
- [x] T31: 全量回归与归档——tasks 复选框全部按实现进度更新、全库旧产品痕迹 grep 确认（v2 任务驱动/单会话/引导会话/`changes/cc-assistant-v2/` 指针清零或标注）、skill 交付物齐备；依赖：T25-T30；验收：遗留 0 项、复选框状态与实际一致

## 依赖与顺序

- T1→T2→T3（RED 基线链）
- T3→T4→(T5,T6)（SKILL.md 编排 + 命令 + 部署）
- T4→T7~T18（模块文件，T8-T17 内部可并行），T19 汇总核对（依赖 T7-T18）
- T4→T20；T19→T20（进度续接编排指令段，需模块核对完成）
- T4→T21→(T22,T24)，T23 独立（文档影响面，逐条核对校验）
- T7-T18→T25（传递，经 T19→T20 覆盖）；T2/T3→T25；T20→T25
- T25→T26；T18→T26（收官综合场景）
- T25→T28；T20→T28；T13/T15→T28（传递，经 T19→T20 覆盖；依赖降级验证需 MCP/SDK 模块）
- T18→T27（书框架改写抽查）
- T23→T29（progress.json 忽略确认）；T25-T28→T29（回归收尾）
- T4→T30（移交 spec-merger 阶段），T25-T30→T31
- 依赖链保证每任务只依赖先前批次；无 TBD/TODO/占位符（T4 的「交接 stub」为 T4→T20 的有意交接点，非占位）。

## 校验

- **skill/eval 类任务**（T1-T20、T25-T29）：走 TDD——先红（基线/断言）后绿（实现），未通过不勾选。
- **文档类任务**（T21-T24、T30-T31）：用逐条核对校验（对照 proposal Impact 清单 / spec REQ）+ T31 另做复选框状态核对，无 eval 用例，不套用 TDD 红绿。
- tasks 复选框状态与实现进度一致（spec-superflow 强制规则 2）：实现后 `- [ ]` → `- [x]`，未实现保持 `- [ ]`。

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
