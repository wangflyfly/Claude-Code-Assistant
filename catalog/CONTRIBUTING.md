# 社区 Skill 目录贡献指南

> 收录范围：仅 **Claude Code skills**（SKILL.md 形态）。plugins / MCP servers / commands / agents **不收录**（REQ-CAT-004）。
> 免责声明：收录仅表示通过结构校验与维护者审核，**不构成对 skill 质量 / 安全性的背书**；安装前请自行核对（REQ-CON-005）。

## 如何新增一条 skill

1. 在 `catalog/catalog.json` 的 `skills` 数组**末尾**追加一条记录，字段按 REQ-CAT-002：
   - `id`：小写字母/数字/连字符，全目录唯一
   - `name` / `author` / `install` / `repo`（http/https URL）/ `license`：非空
   - `description`：一句话说明「何时用」（触发条件）
   - `topics`：≥ 1 个，全部来自 `catalog/topics.json`
2. 本地预校验（两个命令都须退出码 0）：

   ```bash
   node catalog/validate.mjs          # 结构校验：JSON / schema / id 唯一 / topics ⊆ 词表 / 必填 / 映射键一致
   node catalog/sync-catalog.mjs      # 重新生成三产物：site/data/catalog.json、site/data/course-mapping.json、cc-assistant/modules/_community-skills.md
   ```

3. 把 `catalog.json`、`topics.json`（如新增主题）、`course-mapping.json`（如改映射）以及重新生成的三产物一起提交。
4. 提 PR（使用 `.github/PULL_REQUEST_TEMPLATE/skill-entry.md`），等待 CI `validate` job 通过 + 维护者审核合入。

## CI 会查什么

- **validate job（PR）**：
  - `node catalog/validate.mjs` —— JSON 合法、`catalog.schema.json` 结构、`id` 唯一、`topics` ⊆ `topics.json`、必填字段齐全、`course-mapping.json` 键与 `cc-assistant/modules/*.md`（剔除 `m0-onboarding`）一致且引用的主题存在（REQ-CIV-001/002）。
  - `node catalog/sync-catalog.mjs --check` —— 已提交的 `site/data/` 与快照须与 catalog 一致（防漂移，REQ-CIV-004）。
- **sync job（合入 main 后）**：重新生成三产物并提交，使网页无需人工改动即自动展示新 skill（REQ-CIV-003）。

## 收录判据与审核流程

1. **形态**：必须是独立 Claude Code skill（SKILL.md），非 plugin / MCP server / command / agent。
2. **可访问性**：`repo` 指向真实可访问的来源仓库。
3. **字段**：`license` 明确；`description` 说明「何时用」且与 skill 实际一致；`topics` 与 skill 实际能力匹配。
4. **审核**：维护者按上述清单逐项核对，不满足任一项则要求修改或拒绝；CI 通过后仍须维护者显式批准合入（REQ-CON-004，无自动合入）。

## 被拒的常见原因

- 非 SKILL.md 形态（是 MCP server / command / plugin / agent）。
- `id` 重复或含大写 / 非连字符字符。
- `topics` 含 `topics.json` 词表外的标签。
- `repo` 不是 http/https URL 或不可访问。
- `description` 未说明「何时用」，或与 skill 实际不符。
- 未重新生成三产物，导致 `--check` 报漂移。
- 需要新主题标签但未同时修改 `topics.json` + `topics.md`。

## 新增主题标签

另见 `catalog/topics.md`：提 PR 同时改 `catalog/topics.json`（新增 `{id, description}`）与 `catalog/topics.md`（表格加行），走同一 CI 校验 + 维护者审核。
