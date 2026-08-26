# cc-assistant-v4 SDD 进度台账

> 执行模式：sdd（revision 1，7 wave，23 任务）。tasks.md 复选框统一在 wave-7 收尾时按实现进度勾选；执行期进度以本台账为准（沿用 v3 策略）。

## Wave 1 — wave-1-data-layer（目录数据层）✅

- [x] T1: `catalog/topics.json`（13 主题词表）— commit 973a427
- [x] T2: `catalog/topics.md`（说明+扩充流程）
- [x] T3: `catalog/catalog.schema.json`（顶层对象+skills 结构）
- [x] T4: `catalog/course-mapping.json`（11 模块→主题映射）
- [x] T5: `catalog/catalog.json`（cc-assistant 自荐首条）

**Review**：wave-1-data-layer review pass（a7e38e2..973a427，报告 `reviews/wave-1-data-layer.md`）；验收全过（JSON 合法/键一致/词表归属/schema 约束）。
**batches_completed**：1

## Wave 2 — wave-2-validate（校验脚本，TDD）✅

- [x] T6: `catalog/validate.mjs` + `validate.test.mjs`（RED stub 9 失败 → GREEN 10/10 全过）— commit 4475ab4 + 3e9be45（健壮性补强）；CLI 对真实 catalog exit 0

**Review**：wave-2-validate review pass（973a427..3e9be45，报告 `reviews/wave-2-validate.md`）。
**batches_completed**：2

## Wave 3 — wave-3-sync（同步脚本，TDD）✅

- [x] T7: `catalog/sync-catalog.mjs` + `sync-catalog.test.mjs`（RED stub 8 失败 → GREEN 全过）— commit 76ae882 + c2e27ff（快照头精确化）；三产物首次生成（site/data 两文件 + `_community-skills.md`），`--check` 二次运行 exit 0、手工改产物 exit 1

**Review**：wave-3-sync review pass（3e9be45..c2e27ff，报告 `reviews/wave-3-sync.md`）。
**batches_completed**：3

## Wave 4 — wave-4-site（网页静态站）✅

- [x] T8: `site/.nojekyll` + `site/index.html`（免责横幅/chips/模块下拉/列表）
- [x] T9: `site/assets/style.css`
- [x] T10: `site/assets/app.js`（fetch 两数据、主题/模块筛选、skill 卡片 8 字段、textContent 防 XSS）
- [x] T11: site/data 产物已生成（wave-3）+ 本地 HTTP 验证（端点 200、数据与源一致、file:// CORS 提示）

**Review**：wave-4-site review pass（c2e27ff..06773a1，报告 `reviews/wave-4-site.md`）；XSS 加固 1 处（repo 仅 http/https 生成链接）。
**batches_completed**：4

## Wave 5 — wave-5-ci-contrib（CI 与贡献流程）✅

- [x] T12: `.github/workflows/catalog-ci.yml`（validate PR 只读 + sync push main 再生成提交）
- [x] T13: `.github/PULL_REQUEST_TEMPLATE/skill-entry.md`（字段+示例+自检+审核清单）
- [x] T14: `catalog/CONTRIBUTING.md`（流程/命令/判据/免责）

**Review**：wave-5-ci-contrib review pass（06773a1..21a576f，报告 `reviews/wave-5-ci-contrib.md`）；CI 加固 2 处（sync 限权 + 并发组）。
**batches_completed**：5

## Wave 6 — wave-6-course-integration（课程集成）✅

- [x] T15: `SKILL.md` 编排层补社区 skill 指引（正文 99 词 <200）
- [x] T16/T17: 11 模块各加「社区好 skill」小节（映射主题 + 引用本地快照 §主题），m0 不含
- 安装副本同步（含 `_community-skills.md`，REQ-SNP-002）

**Review**：wave-6-course-integration review pass（21a576f..1d4a692，报告 `reviews/wave-6-course-integration.md`）；§主题引用全可解析。
**batches_completed**：6

## Wave 7 — wave-7-docs-eval（文档影响面 + eval 收尾）✅

- [x] T18: CONTEXT.md 目录子系统术语登记
- [x] T19: 根 CLAUDE.md 追加段（Project/Architecture 未动）
- [x] T20: README + .gitignore 生成产物注释
- [x] T21: cases.md M 区目录 eval 用例 + RED 基线（t21-catalog-red.md）
- [x] T22: GREEN 复测（t22-catalog-green.md）+ 修复 2 处缺陷（validate 排除 _community-skills.md、--check CRLF 归一化）
- [x] T23: 回归 + 边界断言（LOC-002/004、CON-004、CMP-005）+ 复选框统一勾选（T1-T23）

**Review**：wave-7-docs-eval review pass（1d4a692..a01c287，报告 `reviews/wave-7-docs-eval.md`）；7 波全 pass。
**batches_completed**：7
