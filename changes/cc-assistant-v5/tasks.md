# Tasks: CC Assistant v5（/contribute 斜杠命令）

## File Structure

| 文件 | 动作 | 职责（一句话） |
|---|---|---|
| `.claude/commands/contribute.md` | Create | `/contribute` 项目级斜杠命令：frontmatter + 7 步编排（前提校验 / 收 6 字段 / id 生成 / 主题映射 / 写入 catalog.json / 校验闭环 / 交接输出） |
| `cc-assistant/eval/cases.md` | Modify | 新增 `/contribute` 贡献者场景用例（无命令基线 vs 有命令），覆盖 CMD/ENT/TOP/VAL 关键行为 |
| `catalog/CONTRIBUTING.md` | Modify | 把 `/contribute` 标注为推荐贡献路径，手动流程降级为「原理说明 / 备选」 |
| `README.md` | Modify | 贡献段提及 `/contribute` 入口 |
| `README-en.md` | Modify | 贡献段与 README.md 中英镜像同步提及 `/contribute` |
| `CLAUDE.md`（根） | Modify | 当前 change 指针 v4→v5 + 目录子系统段贡献路径提及 `/contribute` |

## Interfaces

- **contribute.md → catalog/catalog.json**：命令向 `skills` 数组**末尾**追加新条目（8 字段，schema 合规），不修改既有条目。
- **contribute.md → catalog/topics.json**：读取词表（13 主题）作为推断候选源；`topics` 非空、项不重复、全部 ⊆ 词表。
- **contribute.md → validate.mjs**：命令运行 `node catalog/validate.mjs`，以退出码 0 判定通过；失败按报错修复重试。
- **contribute.md → sync-catalog.mjs**：命令运行 `node catalog/sync-catalog.mjs`（再生成三产物）与 `node catalog/sync-catalog.mjs --check`（复核），均以退出码 0 判定通过。
- **contribute.md → 三产物**：`site/data/catalog.json`、`site/data/course-mapping.json`、`cc-assistant/modules/_community-skills.md` 由 sync 再生成（命令不手工编辑）。
- **contribute.md → PR 模板**：交接输出引用 `.github/PULL_REQUEST_TEMPLATE/skill-entry.md` 固定字段；仅在就近映射时附加「建议新增主题」备注行（不改模板文件）。
- **eval/cases.md → contribute.md**：贡献者场景用例（T1）为命令行为定义期望（RED），命令实现（T2-T4）须通过用例（GREEN）。

## Batches

### Batch 1 — eval 用例先行（RED）

- [ ] T1: `cc-assistant/eval/cases.md` 新增 `/contribute` 贡献者场景用例——无命令基线 vs 有命令行为对比；覆盖字段收集（含 install / repo 协议）、id 生成回退、主题确认、就近映射、validate/sync/`--check` 闭环、交接输出（含条件性 PR 备注）；依赖：无；验收：每条场景含 WHEN/THEN、标注覆盖的 REQ ID（REQ-CMD/ENT/TOP/VAL 中可 WHEN/THEN 表达的部分全覆盖，VAL-003 归 T8 回归）；无命令基线以 CONTRIBUTING.md / README 贡献段的 5 步手动流程为佐证（有意时序：基线不单独先跑，T8 复测对照）

### Batch 2 — 命令本体（GREEN）

- [ ] T2: 创建 `.claude/commands/contribute.md`——frontmatter（`description`，可含 `argument-hint`）+ 编排步骤 1-2：前提校验（cwd 为仓库根、未提交改动提示）+ 输入形态（`$ARGUMENTS` 可选描述或交互式）+ 6 字段收集（name / description「何时用」 / author / install 给示例 / repo 命令侧校验 http/https / license）；依赖：T1；验收：命令文件可被 `/contribute` 触发（REQ-CMD-001/002/003），字段缺失与 repo 协议非法时提示补齐
- [ ] T3: 补 `.claude/commands/contribute.md` 编排步骤 3-4：id 生成（name slug 化 + 全目录唯一检查 + 非 ASCII/空/冲突回退手输 `^[a-z0-9-]+$`）+ 主题映射（读 topics.json 推断候选 → 贡献者确认/调整 → 词表外就近映射并记 PR 备注）；依赖：T2；验收：id 满足 schema pattern、topics 非空/不重复/⊆ 词表、就近映射分支产出「建议新增主题」备注（REQ-ENT-001、REQ-TOP-001/002）
- [ ] T4: 补 `.claude/commands/contribute.md` 编排步骤 5-7：向 `catalog/catalog.json` 的 `skills` 数组末尾追加条目（8 字段）→ 跑 `validate.mjs`（失败修复重试至 0）→ 跑 `sync-catalog.mjs` 再生成三产物 + `sync-catalog.mjs --check` 复核（`--check` 失败则重 sync 再复核，仍失败则停止并报告漂移）→ 交接输出（commit 示例 + PR 正文按模板固定字段，仅就近映射时附加备注行；不自动 commit/push/PR）；依赖：T3；验收：追加条目合法且既有条目原样、退出码 0、`--check` 失败时重 sync 再复核、仍失败则停止并报告漂移、topics.json / course-mapping.json / catalog.schema.json / validate.mjs / sync-catalog.mjs / .github/workflows/catalog-ci.yml 六文件保持原样（仅 catalog.json 末尾新增）、交接文案含 commit 示例与 PR 正文（REQ-ENT-002、REQ-VAL-001/002/003、REQ-CMD-004）

### Batch 3 — 文档同步

- [ ] T5: `catalog/CONTRIBUTING.md` 更新——把 `/contribute` 标注为推荐贡献路径，手动流程保留为「原理说明 / 备选」；依赖：T4（命令已存在可引用）；验收：指南含「推荐用 /contribute」与手动备选说明（REQ-DOC-001）
- [ ] T6: `README.md` 与 `README-en.md` 贡献段同步提及 `/contribute` 入口；依赖：T5；验收：中英两处均提及、无漂移（REQ-DOC-002）
- [ ] T7: 根 `CLAUDE.md` 更新——当前 change 指针 v4→v5，目录子系统段贡献路径提及 `/contribute`；依赖：T6；验收：指针指向 cc-assistant-v5、目录子系统段含 /contribute 入口（REQ-DOC-004）

### Batch 4 — 集成验证（GREEN 复测 + 回归）

- [ ] T8: 用子智能体模拟贡献者跑 `/contribute` 全流程（对应 T1 eval 用例）——字段收集、id 生成、主题确认、就近映射、校验闭环、交接输出逐项验证；并回归确认既有功能无回归（catalog 校验 / sync 防漂移 / 网页 / 课程快照原样）；依赖：T1、T4、T7；验收：命令行为类 REQ（CMD/ENT/TOP/VAL）逐项满足、无命令基线 vs 有命令行为对比符合 T1 预期、VAL-003 由本次回归验证、DOC 类由对应任务验收（T8 不重复）、既有产物无回归

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
