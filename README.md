# Claude-Code-Assistant

CC Assistant（Claude Code 上手引导）：给有开发经验但不会用 Claude Code 的开发者，以模块化上手引导课程（每模块真实小练习、多会话渐进续接）边做边教。课程 + 社区 Skill 目录。

## 社区 Skill 目录

浏览社区推荐的好 skill：

- **网页目录（GitHub Pages）**：`site/` 为发布源，按主题 / 课程模块筛选浏览，数据来自 `catalog/catalog.json`（机器生成副本 `site/data/`）。
- **课程内推荐**：cc-assistant 各课程模块的「社区好 skill」小节引用本地快照 `_community-skills.md`，运行时不联网。

## 贡献一条 skill

想往目录里加一个好 skill：见 `catalog/CONTRIBUTING.md`。流程：按 `.github/PULL_REQUEST_TEMPLATE/skill-entry.md` 模板提交 PR → CI `validate` 校验 → 维护者审核合入 → CI 自动重新生成产物。

## 本地命令

```bash
node catalog/validate.mjs          # 结构校验（JSON / schema / id 唯一 / topics ⊆ 词表 / 映射键一致）
node catalog/sync-catalog.mjs      # 重新生成 site/data/ 与课程快照
node catalog/sync-catalog.mjs --check  # 产物防漂移检查（退出码 0=一致 / 1=漂移）
```
