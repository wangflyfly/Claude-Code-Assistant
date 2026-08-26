# T20 Implementer Report — progress.json 续接编排

- **Wave**：wave-4-continuity
- **Base**：e1f2419 / **Head**：f990c9e
- **Files changed**：`cc-assistant/SKILL.md`（+10 行，仅此一文件）

## 实现内容

在 `cc-assistant/SKILL.md`「会话编排」段后新增「## 进度续接编排」段，编码四部分：

1. **读**：进课程时读 `.claude/cc-assistant/progress.json`；存在且合法→按 `currentModule` 的 `{phase, moduleId}` 模块级续接、不重讲已完成模块；损坏/结构非法→按无进度处理、询问定位、不静默出错。
2. **无文件询问**：文件不存在时，M0 定场+选项目后询问「全新开始 / 此前学过后续接」；全新→`completedModules: []`、`currentModule` 置首模块；续接→请学习者报出已学模块后定位。
3. **写**：模块完成时更新——以 `{phase, moduleId, degraded?}` 加入 `completedModules`，`currentModule` 移向下一模块，`updatedAt` 记当前时间；练习降级（外部依赖缺失）记 `degraded: true`，概念与场景仍计完成；中断时已完成进度已落盘、未完成模块不标完成。
4. **结构**：`{phase, completedModules[], currentModule, updatedAt}`；`phase ∈ {进阶, 高阶}`；高阶重访同模块以 `(高阶, moduleId)` 追加；是否完成按当前 phase 判断。

## 测试与验证

- **词数**：`sed '/^---\r*$/,/^---\r*$/d' cc-assistant/SKILL.md | wc -w` → **95**（契约约束 <200，满足）。
- **REQ 映射**：REQ-SCN-001（读+损坏询问+最小结构）、SCN-002（(phase,moduleId) 对、高阶追加）、SCN-003（读写时机、中断不标完成）、SCN-004（无文件询问）、SCN-005（续接不重讲）全部编码；D3（结构/phase/degraded）、D4（模块级续接、无模块内 checkpoint）、D6（无进度询问）一致。
- **行尾**：全文件 CRLF 一致（`file` 确认），正文校验命令兼容。

## TDD Evidence

- **RED**：wave-1 基线报告 §K 记录「不续接」为 LLM 失败规律之一；`eval/cases.md` 多会话续接用例（I-1~I-11）为断言面——此前 SKILL.md 仅有续接 stub（第 2 步「读写编排见进度续接段」），无实际编排，续接场景行为不可达。
- **GREEN**：本段为编排实现，编码读/写/询问/续接语义（自然语言编排指令，非代码）；行为性 GREEN 由 wave-6 T25 带 skill 跑测续接场景验证（契约 wave-6 依赖 wave-4）。

## 自审

- 未改动既有步骤/安全边界/交叉引用段；仅追加续接段。
- 未引入模块内 checkpoint（符合 D4）；未代做练习/未扩大范围。
