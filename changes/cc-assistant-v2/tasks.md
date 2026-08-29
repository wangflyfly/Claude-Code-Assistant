# Tasks: CC Assistant v2（上手引导）

> 依赖顺序：Batch 1 → 2 → 3 → 4 → 5。逐批推进，仅依赖前序批次。
> 遵守 `docs/skill-development-spec.md`（description "Use when"、token 精简、TDD 开发）。

## File Structure

| 文件 | 操作 | 职责（一句话）|
|---|---|---|
| `cc-assistant/SKILL.md` | Create | 引导会话编排指令：流程、教学时机、安全边界、验证 |
| `cc-assistant/eval/cases.md` | Create | 学习者场景用例（WHEN/THEN），供子代理 TDD 测试 |
| `~/.claude/commands/assist.md` | Create | `/assist` 引导会话入口命令（用户级）|
| `~/.claude/skills/cc-assistant/SKILL.md` | Install | 用户级安装副本（源 SKILL.md 拷贝）|
| `.claude/always/phase-guard.md` | Delete | v1 阶段守卫（phase guard）|
| `.claude/skills/cc-assistant/` | Delete | v1 项目级 skill（SKILL.md + data/ + scripts/）|
| `.claude/commands/assist.md` | Delete | v1 项目级 `/assist` 命令（Batch 3 T8 先行删除，消除遮蔽）|
| `.claude/commands/{assist-apply,assist-health,feedback}.md` | Delete | v1 项目级命令 3 个（Batch 4 T10）|
| `~/.claude/cc-assistant/profile.json` | Delete | v1 用户级运行时数据 |
| `.claude/cc-assistant/project.json` | Delete | v1 项目级运行时数据 |
| `cc-assistant/data/` | Delete | v1 源数据（recommendations/custom-recommendations）|
| `cc-assistant/scripts/` | Delete | v1 源脚本（如残留：catalog.py / test_catalog.py）|
| `CONTEXT.md` | Modify | CC Assistant 定义改为「上手引导」，移除 v1 专属术语 |
| `CLAUDE.md`（根）| Modify | 定义改「上手引导」；Architecture/Commands/关键公式（v1）等 v1 段落重写或删除 |
| `cc助手需求.md` | Modify | 26KB 需求规格说明书改写为「上手引导」版，或显式标注废弃 |
| `specs/`（根）| Delete | v1 合并产物（scanner/matcher/recommender/health-check/feedback-loop/apply 6 份）|

## Interfaces

跨批次的输入/输出契约：

| 批次 | 生产（Produce）| 消费（Consume）|
|---|---|---|
| B1 | `eval/cases.md` 场景用例 + 基线记录 | 无 |
| B2 | `SKILL.md` 编排指令（覆盖 20 REQ）| B1 基线记录 → 指导内容重点 |
| B3 | `~/.claude/commands/assist.md` + 用户级安装 | B2 的 `SKILL.md` 源 |
| B4 | 清理后状态 + 更新后的 `CONTEXT.md`/`CLAUDE.md` | 依赖 B3 完成安装，避免开发中断 |
| B5 | 验证证据（基线对比 / GREEN / e2e / 校验）| B1 基线 + B2/B3/B4 产物 |

类型契约：
- `SKILL.md` 内参考类内容 → `**REQUIRED SUB-SKILL:** claude-code-guide` 交叉引用，不内联复制
- `eval/cases.md` 场景 → 子代理输入：项目状态 → 期望引导行为

## Batches

### Batch 1 — 测试场景与基线（TDD RED）

Depends on: 无

- [x] T1 创建 `cc-assistant/eval/cases.md`（场景用例）
  - 步骤：1) 枚举 20 REQ 对应场景 2) 每条写 WHEN/THEN 3) 覆盖边界（任务过大 / 危险操作 / 提前退出 / 卡住 / 独立复现失败）4) 校验每条 REQ ≥ 1 场景 5) 定稿
  - Verify: 20 REQ 全覆盖，无占位符
- [x] T2 子代理基线测试（无 skill）
  - 步骤：1) 准备无 skill 环境 2) 子代理模拟学习者跑全部场景 3) 逐字记录行为与合理化 4) 识别失败模式 5) 写入 `eval/cases.md` 基线区
  - Verify: 基线证明「无 skill 时不引导」

### Batch 2 — SKILL.md 编排编写

Depends on: Batch 1

- [x] T3 创建 `cc-assistant/SKILL.md` 骨架 + frontmatter
  - 步骤：1) 定 name（`cc-assistant`）2) description 以 "Use when..." 开头、只写触发条件 3) 建章节骨架（Overview / 会话流程 / 教学要点 / 安全边界 / 验证）4) 词数目标 <500 检查 5) 定稿
  - Verify: frontmatter ≤1024 字符；description 无工作流摘要（skill-development-spec §4）
- [x] T4 编写会话主流程编排（REQ-SESS-001 / 003 / 004）
  - 步骤：1) 定场说明（介绍引导、用真实任务边做边教、了解背景）2) 选真实小任务 3) 教学闭环（下指令→审阅→迭代）4) 独立复现→收尾顺序 5) 一次一件事 + 确认理解 + 独立复现阶段接管/交还控制权
  - Verify: 主流程顺序与 REQ-SESS-001 一致；含「一次一件事」与「交还控制权」
- [x] T5 编写教学时机 + 安全边界（REQ-SESS-002、REQ-TASK-001/002/003）
  - 步骤：1) 教学时机 = just-in-time（第一次见 diff 才讲审阅）2) 任务选小而可逆、过大拆小、无任务给示例 3) 危险/不可逆操作先征得同意或建议沙箱 4) 未提交改动建议 commit/备份 5) 学习者决定权（演示可、落地由学习者定）
  - Verify: 不预灌教材；安全边界逐条对应 REQ-TASK
- [x] T6 编写核心 + 进阶教学（REQ-CORE-001~004、REQ-ADV-001~004）
  - 步骤：1) 下指令教学（目标/范围/验收标准、借模糊指令演示）2) 审阅改动教学（读 diff、接受/拒绝、不盲目接受）3) 核心命令教学（/help、/clear、@文件 按教学时刻）4) CLAUDE.md 教学（作用+模板+落地交学习者）5) 进阶按需：Skill/Rule/Hook、MCP、Plan Mode、Agent/子代理
  - Verify: REQ-CORE-001~004 与 REQ-ADV-001~004 均可追溯
- [x] T7 编写交叉引用 + 独立复现/收尾（REQ-REF-001/002、REQ-INDEP-001/002/003）
  - 步骤：1) 参考类内容用 `**REQUIRED SUB-SKILL:** claude-code-guide` 交叉引用 2) claude-code-guide 未覆盖（MCP/Plan Mode/Agent）标注官方文档来源 3) 独立复现：交还控制权、只观察核对 4) 失败回退（重讲/最小提示/指向 /help 与官方文档）5) 收尾总结 + 后续资源指引
  - Verify: REQ-REF-001/002、REQ-INDEP-001/002/003 均可追溯；无参考内容复制粘贴

### Batch 3 — 命令与安装

Depends on: Batch 2

- [x] T8 创建 `~/.claude/commands/assist.md`
  - 步骤：0) 删除项目级 `.claude/commands/assist.md`（v1 旧命令，先行消除遮蔽窗口）1) frontmatter description（触发 cc-assistant skill）2) 正文调用 skill 启动引导会话 3) 校验命令可被 `/assist` 触发 4) 与 v1 命令名区分（旧命令已在步骤 0 清理）5) 定稿
  - Verify: 项目级旧 `assist.md` 已删且删除先于用户级创建；`/assist` 能拉起 skill
- [x] T9 安装到用户级 + 校验
  - 步骤：1) 拷贝 `cc-assistant/SKILL.md` → `~/.claude/skills/cc-assistant/SKILL.md` 2) 确认 `~/.claude/commands/assist.md` 就位 3) 确认路径为 `~/.claude/`（非项目级）4) 校验可用 5) 记录安装位置
  - Verify: 用户级安装存在；非项目级

### Batch 4 — 清理 v1 与文档更新

Depends on: Batch 3

- [x] T10 清理项目级 v1 产物
  - 步骤：1) 删除 `.claude/always/phase-guard.md`（v1 阶段守卫）2) 删除 `.claude/skills/cc-assistant/`（SKILL.md + data/ + scripts/）3) 删除 `.claude/commands/` 下 `assist-apply.md`、`assist-health.md`、`feedback.md`（`assist.md` 已在 Batch 3 T8 先行删除）4) 确认 v1 命令不再遮蔽新 `/assist` 5) 校验 6) 记录
  - Verify: 项目级 v1 skill、命令与阶段守卫已删净
- [x] T11 清理运行时数据 + 源残留
  - 步骤：1) 删除 `~/.claude/cc-assistant/profile.json` 2) 删除 `.claude/cc-assistant/project.json` 3) 删除 `cc-assistant/data/`（2 个 json）4) 删除 `cc-assistant/scripts/`（如残留）5) 清理残留空目录（如 `.claude/cc-assistant/`）6) 校验
  - Verify: 清理清单逐项确认；无遗留运行时数据
- [x] T12 更新/废弃 v1 文档（CONTEXT.md / 根 CLAUDE.md / cc助手需求.md / 根 specs/）
  - 步骤：1) `CONTEXT.md`：CC Assistant 定义「效率教练→上手引导」、移除 v1 专属术语、MCP 重定义（v1「安装类推荐项」→ v2「进阶教学主题」）2) 根 `CLAUDE.md`：定义改「上手引导」，「以 v1 change 为准」改 v2，Architecture/Commands（含 `data/scenarios.json` JSON 校验命令）/关键公式（v1）等 v1 段落重写或删除 3) `cc助手需求.md`：改写为「上手引导」版，或显式标注废弃 4) 根 `specs/`：清理 v1 合并 6 份 spec（scanner/matcher/recommender/health-check/feedback-loop/apply）5) 校验无 v1 过时描述 + 自检三轮
  - Verify: 4 处文档/目录无 v1 遗留描述

### Batch 5 — 验证（TDD GREEN + e2e）

Depends on: Batch 2-4

- [x] T13 有 skill 场景对比（GREEN）
  - 步骤：1) 带 skill 环境 2) 子代理模拟学习者重跑 B1 场景 3) 对照基线逐条核对行为 4) 修复 SKILL.md 漏洞（如新合理化）5) 复测通过
  - Verify: 基线失败模式均被纠正；引导行为符合
- [x] T14 e2e 完整会话走查
  - 步骤：1) 学习者视角跑完整会话（选任务→教学→独立复现→收尾）2) 抽查安全边界（危险操作/未提交改动）3) 抽查进阶按需讲解 4) 记录走查结果 5) 修复问题
  - Verify: 全流程可走通；成功标准 3 条达成
- [x] T15 全量校验 + 自检三轮 + 刷 hash
  - 步骤：1) `ssf validate changes/cc-assistant-v2` 2) 词数检查（SKILL.md <500）3) 无占位符/TODO 检查 4) 文档自检三轮 5) 刷新 artifacts hash、记录测试结果
  - Verify: validate 全通过；自检 3/3；`test_result: pass`

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
