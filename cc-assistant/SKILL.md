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

## 安全边界

危险/不可逆操作先征得同意；未提交改动先 commit 或备份；落地动作由学习者决定。

## 交叉引用

参考类内容用 **REQUIRED SUB-SKILL:** claude-code-guide；未覆盖的进阶内容引用 docs.anthropic.com。
