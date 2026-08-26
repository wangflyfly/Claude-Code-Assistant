# T23 回归与收尾报告

## 全量校验
- `node catalog/validate.mjs` exit 0 ✓
- `node catalog/sync-catalog.mjs --check` exit 0 ✓
- 三产物与源一致：site/data/catalog.json === catalog/catalog.json、course-mapping 一致、快照含条目 ✓

## 网页
- wave-4 本地 HTTP 端点 200；wave-7 复跑 validate/sync 全绿；file:// CORS 提示在位（浏览器交互渲染未实测，已标注）

## 文档残留
- CONTEXT.md 增目录子系统术语；根 CLAUDE.md 追加段（Project 指针/Architecture 未动，git diff 核对）；README 站点入口+贡献引导；.gitignore 生成产物注释
- 全库 grep 无 v2/v1 目录推荐残留（catalog 与 v1 recommendations 无恢复关系已注明）

## 边界/否定型 REQ 断言
- **REQ-LOC-002**：catalog 条目仅元数据（无 content/托管/下载字段）✓
- **REQ-LOC-004**：模块「社区好 skill」小节声明安装由学习者决定；网页免责声明「不构成质量/安全背书」✓
- **REQ-CON-004**：workflow 无自动合入（grep 0 命中）✓
- **REQ-CMP-005**：catalog 条目与 course-mapping 均无 phase 字段 ✓

## 跨 change 核对
- `.claude/cc-assistant/progress.json` 忽略已由 v3 落地（git check-ignore 命中），v4 未重复处理 ✓

## 顺带修复（T22 GREEN 发现）
- validate.mjs：`_community-skills.md` 误当课程模块 → 已排除（含回归）
- sync-catalog.mjs `--check`：CRLF 检出误报漂移 → 行尾归一化（含回归用例）

## 结论
遗留 0 项；tasks 复选框按实现进度统一勾选（T1-T23 全实现）。
