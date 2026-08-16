# Wave 1 评审报告：wave-1-eval-red（T1-T3）

- **评审范围**：Base 11437e7 → Head 94b815d（`cc-assistant/eval/cases.md` 重构 + `changes/cc-assistant-v3/` 变更目录）
- **评审对象**：T1 模块化用例面（cases.md A-L）、T2 无 skill 基线报告（reports/baseline.md + cases.md §K）、T3 失败规律清单（F1-F4）
- **评审方式**：全量 diff 静态核对 + `ssf validate changes/cc-assistant-v3`（只读验证，通过）+ 对照 8 份 spec 34 REQ 逐条比对
- **结论**：**pass**（全部 T1-T3 验收达成；1 条 Important 术语问题非本 wave 阻塞，wave-5/7 处理）

---

## Part 1 — 规范符合（重点）

### 1.1 cases.md 对 34 条 REQ 的覆盖：全部覆盖，无 spec 外需求

`cc-assistant/eval/cases.md` 的 V-01~V-54 共 54 条场景，覆盖全部 8 份 spec 的 54 个 Scenario / 34 条 REQ，逐条核对：

| Spec 族（REQ 数） | 覆盖场景 | 核对 |
|---|---|---|
| MCO×5 | V-01~V-08（8 场景，含 MCO-001×2 / 002×2 / 003 / 004×2 / 005） | 完整，无缺 |
| COR×5 | V-09~V-16（8 场景，含 COR-003×3、COR-005×2） | 完整 |
| SFT×4 | V-17~V-22（6 场景，含 SFT-002×2、SFT-004×2） | 完整 |
| PME×5 | V-23~V-29（7 场景，含 PME-001×2、PME-003×2） | 完整 |
| SCN×6 | V-30~V-38（9 场景，含 SCN-001×2 / 002×2 / 003×2） | 完整 |
| TPT×3 | V-39~V-43（5 场景，含 TPT-001×2、TPT-002×2） | 完整 |
| ICN×3 | V-44~V-49（6 场景，全部 Scenario×2） | 完整 |
| RCL×3 | V-50~V-54（5 场景，含 RCL-001×2、RCL-002×2） | 完整 |

逐条比对确认：每条 V-xx 的 WHEN/THEN 措辞与对应 spec Scenario 一致（如 V-01↔MCO-001「首次进入课程」、V-29↔PME-005「练习依赖不可用」、V-38↔SCN-006「检查 gitignore」逐字对应）。

**无 spec 外需求引入**：I 区模块概念/练习的具体事实均源于 proposal/spec 内容（I-2「五层记忆」出自 proposal Scope、I-10「成本/安全/指令/协作」出自 proposal 与 tasks T17、I-7 `claude -p` 出自 proposal）；V-08 的「正文 <200 词」与 V-29 的 `degraded:true` 分别来自 design D2/D3，是设计编码的验收口径，非新需求。头部「约束」行声明的「不引入 spec 外的新需求」成立。

### 1.2 WHEN/THEN 判据：每场景都有，无「无谓词」混入验收

- 全部 54 条 V-xx 场景均为单一 `**WHEN**`/`**THEN**` 配对（cases.md L10-238）。
- I 区 11 模块的「概念问答」与「轻练习」谓词均含 WHEN/THEN；I-8/I-9/I-10 的「高阶深入实操」亦含 WHEN/THEN（L275/280/285）。
- J 区成功标准谓词核对表（L291-301）将 proposal 的 5 条 Success Criteria 全部映射到 V-xx/I-xx 谓词，满足 design D10「无谓词的准则不得进入验收」。
- §K 基线区为行为记录（P1/P2 带 WHEN + 逐字回复 + 与 THEN 差异），非验收场景；§L 为 T25 占位。无谓词场景未混入验收。

### 1.3 §K 基线区与 baseline.md 一致性、F1-F4 映射：一致且引用准确

- **一致性**：cases.md §K（L303-357）与 `reports/baseline.md`（§2/§3）同为「记忆系统模块（I-2）+ 多会话续接（V-30/V-37）」两个代表场景、同一组 P1/P2 逐字回复、同一组与 THEN 差异结论，内容一致、如实反映「纯净会话无引导」（§K 与报告均标注「纯净会话逐字回复」）。
- **F1-F4 反制映射**（baseline.md §4 + cases.md §K，L345-355），每条可映射到后续反制指令且 THEN 引用准确：
  - F1 过度预灌 → V-07（REQ-MCO-004 模块内不预灌）、D12 ✓
  - F2 漏覆盖教学时机 → V-06（模块内教学结构）、I-2 轻练习、REQ-PME-001 ✓
  - F3 续接不上 → V-30/V-33/V-36/V-37（读文件续接/判断完成/无文件询问/中断续接）、REQ-SCN-001~006 ✓
  - F4 替学习者代做 → V-21/V-22/V-27、D13 ✓
- 基线差异表中全部 THEN 引用（V-07/V-06/V-30/V-33/V-36/V-37/V-21/V-22/V-27）均与 cases.md 中对应场景定义一致，无张冠李戴。

### 1.4 I 模块用例面贴合 34 REQ（尤其 PME 系列）：贴合

- I-1~I-11 覆盖全部 11 模块，次序与 REQ-MCO-001 固定次序一致（core→…→capstone）。
- PME 贴合：I 区引导语（L242）显式声明轻练习谓词核对「真实、同项目串联、小而可逆、不代做（REQ-PME-001/002/003/004）」；REQ-PME-002 同项目串联由 V-25 承载；不代做由 V-26/V-27 承载；小而可逆由 V-28 承载；REQ-PME-005 降级仅在 I-6/I-7/I-8 出现且严格限定「外部依赖缺失/环境缺失」（L266/270/274），design D12「降级严格限定于外部依赖缺失一个来源」未被违反——未引入「无适用场景→降级」谓词。
- REQ-TPT-001/002 贴合：I 区每模块广度概念+轻练习 + sdk/plugins/engineering 三模块高阶深入实操小节（I-8/I-9/I-10），与 V-39~V-43 呼应。

---

## Part 2 — 质量

- **结构（A-J）**：A-H 八个分区与 8 份 spec 族一一对应，I 模块用例面、J D10 谓词核对表、K RED 基线、L GREEN 占位，与头部声明的结构（L5）完全一致，逻辑清晰。V-xx 编号连续（V-01~V-54）便于引用。
- **v2 残留**：C-xx 场景编号、REQ-SESS/TASK/CORE/ADV/REF/INDEP、T13、「单会话引导」措辞均清零（grep 无命中）。T13→T25、T2→T2/T25 引用已更新。
- **markdown 有效性**：所有场景标题（`### V-xx`/`### I-x`）与 WHEN/THEN 一对一配对，J 表、基线差异表格式正确，无破格。
- **过度设计**：无。363 行对应 54 场景 + 11 模块面 + 基线区，均为 T1/T2/T3 与 D10 直接要求。

---

## 发现分级

### Critical（0）
无。

### Important（1）

**IMP-1｜cases.md:257 I-4 子智能体模块概念问答示例使用旧术语「子代理」**
- 位置：`cc-assistant/eval/cases.md:257`（「想隔离上下文时用子代理」）。
- 证据：I-4 模块名「子智能体模块（subagent）」、v3 全案（proposal、specs、tasks T2/T25「用子智能体模拟『学习者』」）统一用「子智能体」；tasks T22/T31 显式要求「『子代理』清零 / 术语『子智能体』统一」。该谓词是学习者概念问答的可观察判据，示例用旧词会向教学内容漂移。
- 建议：改为「想隔离上下文时用子智能体」。

### Minor（3）

**MIN-1｜cases.md:3/305/363 eval 方法论叙述用「子代理」**（「子代理 TDD 输入」「用子代理模拟学习者」）
- 与 skill-development-spec §11（「用子代理跑压力场景」）及当前 CONTEXT.md（L21，pre-T21）一致，但与本 change 内 tasks.md「用子智能体模拟」不一致；属 v2 时期沿用，建议在 wave-5 术语收敛（T21/T22）时一并统一为「子智能体」。

**MIN-2｜cases.md §K 逐字回复为省略版（「…… 」缩写），完整逐字仅在 baseline.md**
- T2 验收「基线报告存在且含逐字行为记录」由 `reports/baseline.md`（§2.2/2.4/3.2/3.4 完整逐字）满足；§K 自注「完整报告见 reports/baseline.md」。§K 缩写忠实于原文，可接受，但单独阅读 §K 无法核对完整措辞。

**MIN-3｜diff 文件不含任务描述所称的 commit 列表/stat**
- 提供视图为纯 `git diff` 输出（L1 起即 `diff --git`），无 commit 列表与 stat 段；所需变更内容齐全，不影响评审结论。

---

## 验证记录

- `ssf validate changes/cc-assistant-v3`：✅ 全部 11 个工件 valid（0 errors/0 warnings），确认 T1 验收「ssf validate 通过」成立。
- T2 验收：baseline.md 存在于规定路径且含两场景 P1/P2 逐字行为记录 ✓。
- T3 验收：F1-F4 失败规律清单明确、每条可映射到反制指令且 THEN 引用准确 ✓。
- 本评审只读，未修改任何文件、未改变 git 状态（`ssf validate` 为只读校验）。

---

自检：评审仅静态核对 + 只读 validate，未改动交付物；发现均已给出文件:行号证据。
