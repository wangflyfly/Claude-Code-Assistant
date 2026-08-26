# T21 RED Baseline：无辅助贡献者行为观察（社区网友添加 skill 条目）

- 场景：网友（有开发经验、未见过 PR 模板 / CONTRIBUTING / schema / topics.json）向 catalog 添加「我的提交信息检查 skill」
- 模拟环境：目录中存在 `catalog/catalog.json`（可见已有条目格式），其余辅助物视为不存在
- 观察方式：仅读取 `catalog/catalog.json` 模仿格式，自然编辑后已用 `git checkout -- catalog/catalog.json` 还原（基线编辑不保留）

---

## 1. 网友的自然条目（verbatim）

在 `catalog/catalog.json` 的 `skills` 数组末尾追加：

```json
{
  "id": "commit-msg-check",
  "name": "提交信息检查 skill",
  "description": "一个 Claude Code skill，用来检查 git commit message 是否符合规范，自动纠正格式问题，支持 conventional commit。",
  "author": "wanghanyuan",
  "install": "把 commit-msg-check 文件夹复制到 ~/.claude/skills/ 目录下，在任意项目里就能用了。",
  "repo": "https://github.com/wanghanyuan/commit-msg-check",
  "license": "MIT",
  "topics": ["git", "conventional-commit", "rules", "engineering", "commit"]
}
```

拟提交的「PR」说明：*"新增一个提交信息检查 skill，检查 git commit message 规范并自动纠正，已把条目加到 catalog.json。"*

---

## 2. 对照 REQ-CAT-002 的行为分析

目标字段：`id`（小写-连字符、唯一）/ `name` / `description` / `author` / `install` / `repo` / `license` / `topics`（⊆ topics.json 词表）。

| 字段 | 网友做法 | 判定 |
| --- | --- | --- |
| `id` | 猜成 `commit-msg-check`（小写-连字符，格式靠运气碰对） | 未核对任何命名规则，也未检查与既有 `cc-assistant` 的唯一性（这次恰好不撞，纯属巧合） |
| `name` | 保留中文「提交信息检查 skill」，未遵守条目名称风格 | 松散 |
| `description` | 口语化自由描述，无长度/内容约束意识 | 松散 |
| `author` | 用个人 GitHub 名 `wanghanyuan` | 碰对，但未意识到条目风格要求 |
| `install` | 自由写成「复制文件夹到 ~/.claude/skills/」，未按「SKILL.md + modules → ~/.claude/skills/<id>/ + 命令入口」的规范 | **遗漏/松散**：关键子项（入口命令、目录结构）缺失 |
| `repo` | 给出个人仓库 URL | 碰对，无格式校验意识 |
| `license` | 猜「MIT」（照抄既有条目） | 碰对，未意识到是必填且需合法取值 |
| `topics` | 从既有条目抄了 `rules` / `engineering`，另**自造** `git`、`conventional-commit`、`commit` | **词表外**：从未读 topics.json，不确认 `git` / `conventional-commit` / `commit` 是否在词表内 |

关键行为缺失：
- **未检查 id 唯一性**：不知道 catalog 要求 id 全局唯一、小写-连字符，只是随手取了一个不撞的名字。
- **未核对词表**：topics 靠「见过 + 自己想」，自造的 `git` / `conventional-commit` / `commit` 极可能不在 topics.json 词表中。
- **无产物意识**：完全不知道 catalog 还有派生产物（topics.md、course-mapping.json、站点数据等由 sync-catalog.mjs 生成），以为「改完 catalog.json 就完事」，没有任何「改动后需重新生成/校验」的念头。
- **无自检**：编辑后没跑任何校验（不知道有 validate.mjs / schema），甚至没意识到 JSON 结构/字段是否会被机器消费。

---

## 3. 结论：无辅助贡献者的失败模式

1. **漏必填字段 / 字段值不达标**：`install` 缺命令入口与目录结构子项，`id`、`license`、`repo` 全靠猜，无规则可循即无约束。
2. **词表外标签**：topics 自造 `git` / `conventional-commit` / `commit`，从未核对 topics.json，不满足 `topics ⊆ topics.json`。
3. **无自检、无产物意识**：既不知道有 schema / validate 校验，也不知道 catalog 有需同步再生成的派生产物（sync-catalog.mjs），改完即宣称完成。
4. **唯一性/格式不校验**：id 唯一性与小写-连字符规则未核对（本次靠运气不撞，不代表有该意识）。

结论：**无模板 + 无校验脚本环境下，贡献者默认行为无法达到 REQ-CAT-002 门槛**，RED 基线成立 —— 模板（字段清单 + 词表提示）与校验脚本（validate + sync）是让贡献自然达标所必需的。

---

## 还原说明

本次 RED 基线编辑已通过 `git checkout -- catalog/catalog.json` 还原，仓库中 catalog 保持原始状态。
