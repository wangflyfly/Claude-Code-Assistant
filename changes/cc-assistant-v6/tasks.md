# Tasks: CC Assistant v6（目录收录扩展：agents / MCP servers / plugins）

## File Structure

| 文件 | 动作 | 职责（一句话） |
|---|---|---|
| `catalog/catalog.json` | Modify | 每条目加可选 `type`（缺省 skill）；superpowers 重标 plugin；新增 agent / mcp-server / plugin 样例各一条 |
| `catalog/catalog.schema.json` | Modify | `properties` 新增 `type`（string + enum 四类），既有 8 字段结构不变 |
| `catalog/validate.mjs` | Modify | 显式校验 `type` ∈ 枚举（缺省按 skill），非法 type 拒绝（validateAgainstSchema 无 enum 分支） |
| `catalog/validate.test.mjs` | Modify | 四类用例矩阵：合法含缺 type、非法 type、install 缺失 |
| `catalog/sync-catalog.mjs` | Modify | 快照 `_community-skills.md` 每条目标注类型（缺省补 skill）；`site/data/catalog.json` 保持直拷不归一化 |
| `catalog/sync-catalog.test.mjs` | Modify | 同步测试扩展四类（快照类型标注、--check 逐字语义） |
| `site/index.html` | Modify | 类型筛选 UI（chip 组）+ footer 文案「条目 / entry」 |
| `site/assets/app.js` | Modify | 类型徽章（缺省 `type ?? 'skill'`）+ 类型筛选（与主题/模块取 AND）+ 空态/计数文案统一 |
| `.claude/commands/contribute.md` | Modify | 先问 `type`，按类型收集（字段 8→9），install 各类型指引，交接 PR 正文含 type |
| `.github/PULL_REQUEST_TEMPLATE/skill-entry.md` | Modify | 加 `type` 字段选择 + 各类型形态判据 + 维护者审核按类型分支 |
| `catalog/CONTRIBUTING.md` | Modify | 收录范围改四类（含 commands 仍不收）+ 各类型判据 + type/topics 正交说明 |
| `README.md` / `README-en.md` | Modify | 贡献段「贡献什么 / 为什么 / 判据」改四类口径（中英镜像） |
| `cc-assistant/eval/cases.md` | Modify | 新增四类贡献流程场景用例（无命令基线 vs 有命令） |
| `site/data/catalog.json` | Regenerate | 经 `sync-catalog.mjs` 再生成（直拷 catalog.json，随源入库提交） |
| `site/data/course-mapping.json` | Regenerate | 经 `sync-catalog.mjs` 再生成（模块→主题映射，不涉 type） |
| `cc-assistant/modules/_community-skills.md` | Regenerate | 经 `sync-catalog.mjs` 再生成（快照，每条目标注类型，随源入库提交） |

## Interfaces

- **catalog.json**：`SkillRecord[]`，每条目可选 `type` ∈ {skill, agent, mcp-server, plugin}，缺省按 skill；其余 8 字段同 v4/v5。
- **catalog.schema.json**：`properties.type` 声明式 enum；`additionalProperties:false` 要求 type 必须登记进 properties。
- **validate.mjs**：校验 `type` ∈ 枚举（缺省 skill）+ 沿用 schema 8 字段必填 / install 非空；退出码 0=通过 / 1=失败。
- **sync-catalog.mjs → 三产物**：`site/data/catalog.json` 直拷（不归一化）；`_community-skills.md` 快照每条目标注类型（缺省补 skill）；`site/data/course-mapping.json` 是模块→主题映射、不涉 type；`--check` 逐字比较语义不变。
- **site/assets/app.js**：`entry.type ?? 'skill'` 兜底徽章；类型筛选与主题 chips、模块下拉取 AND。
- **contribute.md**：先问 type → 收集 9 字段（8 + type）→ validate/sync/--check → 交接 PR 正文含 type。
- **PR 模板 / CONTRIBUTING / README×2**：四类收录口径一致；commands 显式排除。

## Batches

### Batch 1 — 数据层 + 校验（TDD）

- [x] T1: `catalog/catalog.json` 每条目加可选 `type`——`cc-assistant` 保持缺省 skill（REQ-TYP-001）、`superpowers` 重标 `plugin`；新增三条样例：`agent`（任一真实 repo 的 agent.md，install 指引「复制到 `~/.claude/agents/`」）、`mcp-server`（候选 `modelcontextprotocol/servers`，install 指引「`claude mcp add` / `.mcp.json` 配置」）、`plugin`（候选 `obra/superpowers-marketplace`，install 指引「`/plugin install`」）；每条 8 字段 + type，repo 须 http/https 可访问（`new URL` 验证）；依赖：无；验收：四类各至少一条样例、既有 2 条目字段兼容、JSON 合法（REQ-TYP-001/003/004）
- [x] T2: `catalog/catalog.schema.json` `properties` 新增 `"type": {"type":"string","enum":["skill","agent","mcp-server","plugin"]}`；既有 8 字段结构与 required 不变；依赖：T1；验收：带 type 条目过 schema、枚举外 type 失败、缺 type 通过（REQ-MTV-001、REQ-TYP-002）
- [x] T3: `catalog/validate.mjs` 加显式 `type` 枚举检查（缺省按 skill，运行时拒绝非法 type）——实现后内联自验（RED 正式用例归 T4）；依赖：T2；验收：非法 type 报错定位条目与值退出码 1、缺省按 skill 通过、install 缺失仍被拒（REQ-MTV-002、REQ-TYP-002）
- [x] T4: `catalog/validate.test.mjs` 与 `catalog/sync-catalog.test.mjs` 扩展四类用例矩阵（合法含缺 type、非法 type、install 缺失）；依赖：T3；验收：测试套件全过、四类合法条目通过、非法用例各自失败（REQ-MTV-003）

### Batch 2 — 同步 + 展示

- [x] T5: `catalog/sync-catalog.mjs` 快照 `_community-skills.md` 每条目标注类型（缺省补 skill）；`site/data/catalog.json` 保持直拷（不归一化，--check 逐字语义不变）；依赖：T1、T4；验收：快照条目带类型标注、site/data/catalog.json 与 catalog.json 逐字一致（REQ-TAD-001）
- [x] T6: `site/assets/app.js` 类型徽章（`entry.type ?? 'skill'`）+ 类型筛选（四类 + 全部，与主题 chips / 模块下拉取 AND）+ 空态/计数文案统一为「条目 / entry」；依赖：T5；验收：四种类型徽章正确、类型筛选 AND 组合正确、空态/计数无 skill 措辞（REQ-TAD-002/003/004）
- [x] T7: `site/index.html` 类型筛选 chip 组 UI + footer 文案「贡献新 skill」改「贡献新条目」；依赖：T6；验收：chip 组渲染、footer 无 skill 措辞、品牌名「社区 Skill 目录」保留（REQ-TAD-002/003/004）

### Batch 3 — 贡献命令 + 文档

- [x] T8: `.claude/commands/contribute.md` 先询问 `type`（skill/agent/mcp-server/plugin），按类型收集字段（字段 8→9 加 type）、`install` 给各类型指引示例、交接 PR 正文含 type；frontmatter description/argument-hint 更新四类口径；依赖：T3、T5；验收：命令先问 type、各类型字段与 install 指引正确、交接含 type（REQ-TAC-001/002/003）
- [x] T9: `.github/PULL_REQUEST_TEMPLATE/skill-entry.md` 加 `type` 字段选择 + 各类型形态判据 + 维护者审核清单按类型分支（含 commands 不收录提示）；依赖：T3；验收：模板含 type、判据分支、审核清单（REQ-TDC-003）
- [x] T10: `catalog/CONTRIBUTING.md` 收录范围改四类（commands 仍不收）+ 各类型形态判据 + `type`/`topics` 正交说明；依赖：T9；验收：指南含四类收录、commands 排除、type/topics 正交（REQ-TDC-001、MODIFIED REQ-CAT-004）
- [x] T11: `README.md` 与 `README-en.md` 贡献段「贡献什么 / 为什么 / 判据」改四类口径（中英镜像一致，品牌名保留）；依赖：T10；验收：两处均四类口径、无中英漂移（REQ-TDC-002）
- [x] T12: `cc-assistant/eval/cases.md` 新增四类贡献流程场景（type 询问、各类型字段与 install、校验闭环），无命令基线 vs 有命令；依赖：T8；验收：每条场景 WHEN/THEN + REQ ID（REQ-TDC-004）

### Batch 4 — 集成验证（GREEN + 回归）

- [x] T13: 生成产物 + 端到端验证——跑 `node catalog/validate.mjs` + `node catalog/sync-catalog.mjs` + `--check` 全退出码 0；子智能体模拟贡献者用 `/contribute` 贡献四类各一条；站点类型筛选 / 徽章验证；回归：既有 skill 条目（cc-assistant）向后兼容、superpowers 重标 plugin 后正常展示、课程快照/网页无回归；依赖：T5、T6、T7、T8、T12；验收：四类校验通过、命令端到端可用、站点类型展示正确、既有条目无回归（REQ-TYP/MTV/TAD/TAC/TDC 全满足）

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
