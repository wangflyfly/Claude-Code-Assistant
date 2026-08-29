---
description: 引导贡献者向社区 Skill 目录（catalog/catalog.json）贡献一条 Claude Code skill——用自然语言描述即可得到合法条目 + 三产物就绪，无需手工编辑 JSON / 跑脚本。用于贡献者想新增一条 skill 时。
argument-hint: [可选] skill 的一句话描述，如「一个格式化 git commit 的 skill」
---

# /contribute — 贡献一条社区 skill

你是社区 Skill 目录的贡献引导。按下列步骤执行；全程只引导、不越界——不自动 commit / push / 开 PR，提交与安装由贡献者自己决定。

## 0. 前提校验

1. 确认当前工作目录是仓库根（存在 `catalog/catalog.json`）。若不在，提示贡献者先克隆 / 进入本仓库。
2. 检查未提交工作区改动：`git status --short`。若有与本次贡献无关的改动，提示贡献者先 commit 或 stash，避免新条目与本地改动混淆。

## 1. 收集字段

初始输入 = `$ARGUMENTS`（若有）；其余字段逐一交互收集（缺哪个问哪个），每字段非空，缺失 / 非法时提示补齐后再继续：

- `name`：skill 名称
- `description`：一句话说明「何时用」（触发条件）
- `author`：作者 / 组织
- `install`：可执行的安装指引。给示例（如 `npx skills add owner/repo --skill <name>` 或复制 SKILL.md 到 `~/.claude/skills/`）；命令不代编，请贡献者提供真实可执行的安装方式
- `repo`：来源仓库 URL。**命令侧校验必须 http/https**（`new URL(repo).protocol` 检查），不是则提示重输
- `license`：许可证（如 MIT）

## 2. 生成 id

从 `name` slug 化：转小写 → 非字母数字转连字符 → 去首尾连字符。候选 id 必须匹配 `^[a-z0-9-]+$` 且全目录唯一（读 `catalog/catalog.json` 检查）。

slug 化为空串、含非法字符、或与既有条目冲突时：请贡献者手动输入合法 id（匹配 `^[a-z0-9-]+$`），合法后才继续。

## 3. 主题映射

读 `catalog/topics.json`（词表，每主题 `id` + `description`）。从 `description` 推断候选主题，展示给贡献者确认 / 调整：

- 最终 `topics` 必须非空、项不重复、全部 ⊆ 词表
- 附词表 description 帮助贡献者选择

若贡献者表示词表内无合适主题：引导其在候选主题中选定语义最接近的一个（就近映射，禁止写词表外主题或留空），并记住「发生就近映射」标志（用于交接 PR 备注）。

## 4. 写入条目

向 `catalog/catalog.json` 的 `skills` 数组**末尾**追加新条目（8 字段：id / name / description / author / install / repo / license / topics）。用编辑工具写 JSON，**不修改、不删除、不重排既有条目**。

## 5. 校验闭环

1. 跑 `node catalog/validate.mjs`——退出码 0 才继续；失败则按报错修复（字段 / 词表 / 格式）重试。
2. 跑 `node catalog/sync-catalog.mjs`——再生成三产物（`site/data/catalog.json`、`site/data/course-mapping.json`、`cc-assistant/modules/_community-skills.md`）。
3. 跑 `node catalog/sync-catalog.mjs --check`——复核退出码 0；若失败（极少）重新 sync 再复核，仍失败则停止并报告漂移。

以退出码判定成功（读取 `$?`），不依赖输出文案。

**不改数据层**：`catalog/topics.json`、`catalog/course-mapping.json`、`catalog/catalog.schema.json`、`catalog/validate.mjs`、`catalog/sync-catalog.mjs`、`.github/workflows/catalog-ci.yml` 一律不动。

## 6. 交接输出

输出交接步骤，**不自动执行任何 git 写操作**：

- **commit 示例**：`git add catalog/catalog.json site/data/catalog.json site/data/course-mapping.json cc-assistant/modules/_community-skills.md && git commit -m "feat(catalog): 收录 <name>"`
- **PR 正文**：按 `.github/PULL_REQUEST_TEMPLATE/skill-entry.md` 模板固定字段填写条目字段 + 自检清单；**仅当本流程发生就近映射时**，在模板固定字段之外附加一行「建议新增主题：<贡献者想要的词表外主题>」。

最后告知贡献者：提交与提 PR 由贡献者自己执行；合入后 CI 会自动再生成并上线网页。
