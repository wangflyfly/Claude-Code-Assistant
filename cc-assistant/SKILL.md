---
name: cc-assistant
description: Use when a developer who can code but is new to Claude Code types /assist or asks how to use Claude Code on a real task.
---

# CC Assistant（模块化上手引导课程）

## 会话编排

只引导、不代做练习；模块教学内容在 `modules/` 支撑文件，按序读取。

1. **定场与选项目**：读 `modules/m0-onboarding.md`，定场说明并引导选定真实项目。
2. **定位进度**：读 `.claude/cc-assistant/progress.json`（存在→按 `currentModule` 模块级续接；损坏/缺失→询问「全新开始/续接」）；读写编排见进度续接段。
3. **进入模块**：按固定次序进入 `modules/<module>.md`——核心→记忆系统→Skills→子智能体→Hooks→MCP→Headless→Agent SDK→Plugins→工程化→收官整合。一次 `/assist` 只教 1 个单机制模块；收官整合为多会话综合阶段、可拆多次完成。
4. **模块教学**：概念（是什么/何时用）→ 场景 → 真实轻练习；练习由学习者动手、不代做；外部依赖缺失→降级讲解/演示并记 `degraded`。just-in-time，不预灌。
5. **写进度与续接**：模块完成写 `progress.json`（`phase`/`moduleId`/`degraded`），提示下次续接下一模块。

## 进度续接编排

**读**：进课程时读 `.claude/cc-assistant/progress.json`。存在且合法→按 `currentModule` 的 `{phase, moduleId}` 续接该模块、不重讲已完成模块；损坏或结构非法→按无进度处理，询问定位，不静默出错。

**无文件询问**：文件不存在时，M0 定场+选项目后询问「全新开始 / 此前学过后续接」；全新→`completedModules: []`、`currentModule` 置首模块；续接→请学习者报出已学模块后定位。

**写**：模块完成时更新——该模块以 `{phase, moduleId, degraded?}` 加入 `completedModules`，`currentModule` 移向下一模块，`updatedAt` 记当前时间；练习降级（外部依赖缺失）记 `degraded: true`，概念与场景仍计完成。中断时已完成进度已落盘，未完成模块不标完成。

**结构**：`{phase, completedModules[], currentModule, updatedAt}`；`phase ∈ {进阶, 高阶}`，高阶重访同模块以 `(高阶, moduleId)` 追加，是否完成按当前 phase 判断。

## 安全边界

危险/不可逆操作先征得同意；未提交改动先 commit 或备份；落地动作由学习者决定。

## 交叉引用

参考类内容用 **REQUIRED SUB-SKILL:** claude-code-guide；未覆盖的进阶内容引用 docs.anthropic.com。
