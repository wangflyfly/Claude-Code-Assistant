# cc-assistant-v3 SDD 进度台账

> 执行模式：sdd（revision 1，9 wave）。tasks.md 复选框统一在 T31 收尾时按实现进度勾选；执行期进度以本台账为准（用户已确认该策略）。

## Wave 1 — wave-1-eval-red（RED 基线）✅

- [x] T1: cases.md 模块化用例面重构（V-01~V-54 覆盖 34 REQ + I-1~I-11 + J 谓词核对表）— commit 94b815d，review pass
- [x] T2: 无 skill 基线跑测 — `reports/baseline.md` 落盘，§K 填充
- [x] T3: F1-F4 失败规律清单（预灌/漏覆盖/不续接/代做）— §K 填充，每条映射反制指令

**Review**：wave-1-eval-red pass（base 11437e7..head 94b815d，报告 `reviews/wave-1-eval-red.md`）；Important「子代理→子智能体」术语残留已修正（cases.md 4 处）。

**batches_completed**：1

## Wave 2 — wave-2-skill-core（SKILL.md 编排层）✅

- [x] T4: SKILL.md v3 课程编排层重写（正文 51 词 <200；description SDO 133 字符 <1024；M0→11 模块次序/一次一模块/收官多会话/续接 stub/无文件询问/just-in-time/安全边界/D13/REQUIRED SUB-SKILL）
- [x] T5: `~/.claude/commands/assist.md` 更新指向 v3 课程编排
- [x] T6: 安装副本 `~/.claude/skills/cc-assistant/SKILL.md` 与源同步（diff 校验一致）

**Review**：待 commit 后 wave-2 review receipt。
**batches_completed**：2

## Wave 3a — wave-3a-modules（模块支撑文件，parallel）✅

- [x] T7: modules/m0-onboarding.md（M0 定场+选项目+询问定位）
- [x] T8: modules/core.md（REQ-COR-001~005）
- [x] T9: modules/memory.md（CLAUDE.md 五层记忆+Rule 规则级）
- [x] T10: modules/skills.md
- [x] T11: modules/subagent.md
- [x] T12: modules/hooks.md
- [x] T13: modules/mcp.md（含 PME-005 降级）
- [x] T14: modules/headless.md（含 PME-005 降级）
- [x] T15: modules/sdk.md（含 PME-005 降级 + 高阶小节 TPT-002）
- [x] T16: modules/plugins.md（含高阶小节 TPT-002）
- [x] T17: modules/engineering.md（含高阶小节 TPT-002）
- 安装副本 modules/ 已同步

**Review**：待 commit 后 wave-3a review receipt。
**batches_completed**：3

## Wave 3b — wave-3b-capstone（收官整合模块）✅

- [x] T18: modules/capstone.md（跨模块综合任务 2+ 机制 + 四层架构/触发口诀/关注点分离/选型决策树体系讲解改写归因 + 高阶综合项目分支 REQ-TPT-002）

**Review**：待 commit 后 wave-3b review receipt。
**batches_completed**：4

## Wave 3c — wave-3c-verify（全模块交叉核对）✅

- [x] T19: 全模块交叉核对（报告 `reports/t19-cross-check.md`）：模块清单四方一致、无悬空、phase 区分、REQ-PME/TPT 承载、术语统一；0 Critical/Important，1 Minor 信息性（T4→T20 交接 stub，预期）

**Review**：待 commit 后 wave-3c review receipt。
**batches_completed**：5

## Wave 4 — wave-4-continuity（进度续接）✅

- [x] T20: SKILL.md 写 progress.json 续接编排指令段（读写/询问/续接，D3 编码，REQ-SCN-001~005）— commit f990c9e（worktree 分支 cc-assistant-v3），review pass（`reviews/wave-4-continuity.md`）；正文 95 词 <200

**batches_completed**：6

## Wave 5 — wave-5-docs（文档影响面）✅

- [x] T21: 更新 `CONTEXT.md`（L59 术语改写：模块课程/真实轻练习/进阶模块清单/新增 Headless·Agent SDK·Plugins）— commit 641174d
- [x] T22: 更新根 `CLAUDE.md`（指针 v2→v3、定义/引擎改写模块化课程、子代理→子智能体、state=executing）
- [x] T23: 更新 `.gitignore`（清理 v1 project.json、忽略 progress.json，check-ignore 实测命中）
- [x] T24: 更新 `cc助手需求.md` 顶部指针 v2→v3（gitignored，仅 main 工作区）

**Review**：wave-5-docs review pass（f990c9e..641174d，报告 `reviews/wave-5-docs.md`）；逐条核对通过，无 Critical/Important。
**batches_completed**：7

## Wave 6 — wave-6-eval-green（eval GREEN 验证）✅

- [x] T25: 有 skill 跑测（子智能体模拟学习者跑记忆系统 + 多会话续接，对照基线 F1-F4 收敛）— `reports/t25-green-memory.md`、`t25-green-continuation.md`；F1-F4 全 PASS，progress 读写正确
- [x] T26: 收官综合场景验证 — `reports/t26-green-capstone.md`；REQ-ICN-001/002/003 + MCO-003 全 PASS（独立完成+选型理由+核对）
- [x] T27: 书框架改写抽查 — `reports/t27-book-framework-audit.md`；无整段照抄，1 处逐字短语「让模型不失忆」已改写（capstone.md）
- [x] T28: 依赖缺失降级验证 — `reports/t28-green-degradation.md`；REQ-PME-005 全子判据 PASS，`degraded:true` 落盘
- [x] T29: 回归与收尾 — `reports/t29-regression.md`；cases.md §L 已填充、SKILL.md/modules 与安装副本一致、progress.json 忽略确认，无失败用例无回归

**Review**：wave-6-eval-green review pass（641174d..dae76d8，报告 `reviews/wave-6-eval-green.md`）；§L 逐行与报告核对一致，无 Critical/Important。
**batches_completed**：8

## Wave 7 — wave-7-spec-merge（spec 合并与归档）✅

- [x] T30: 移交 spec-merger——`ssf sync` 合并 8 份 v3 spec 进根 `specs/`（core-teaching/reference-crosslink 继承改写，6 份新增），4 份 v2 spec 打废弃标注；spec-selfcheck 2 轮（round-1 发现 H1/H2/M1，round-2 verify 全部落实、遗留 0 项）；合并 worktree 分支 cc-assistant-v3→main 解决 H1/H2 外部一致性；`spec_merged: true`
- [x] T31: 全量回归与归档——tasks 复选框 31/31 按实现进度勾选、交付物表面 v2 残留 grep 0 命中、`changes/cc-assistant-v2/` 指针残留 0、skill 交付物齐备（SKILL.md 95 词/modules 12 份/eval cases.md 含 §L）/assist 命令在位）、worktree 已清理

**Review**：wave-7-spec-merge review pass（dae76d8..acd759b，报告 `reviews/wave-7-spec-merge.md`）；spec 合并经独立 spec-selfcheck 2 轮、归档逐项核对通过。
**batches_completed**：9
