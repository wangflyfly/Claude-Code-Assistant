# Skill 条目 PR

> 感谢贡献！请按本模板填写。字段与流程说明见 `catalog/CONTRIBUTING.md`；本地自检命令见文末。
> ⚠️ 仅收录 **Claude Code skills**（SKILL.md 形态）——plugins / MCP servers / commands / agents 不收录。

## 新增/修改 skill

### 条目字段（逐项填写）

- **id**：`<小写字母/数字/连字符，全目录唯一>`，例如 `my-format-skill`
- **name**：`<skill 名称>`
- **description**：`<一句话说明「何时用」（触发条件）>`
- **author**：`<作者/组织>`
- **install**：`<可执行的安装指引>`，例如 `npx skills add owner/repo --skill my-format-skill`
- **repo**：`<来源仓库 URL，http/https>`，例如 `https://github.com/owner/repo`
- **license**：`<许可证>`，例如 `MIT`
- **topics**：`<来自 catalog/topics.json 的标签，至少 1 个>`，例如 `["hooks"]`

### 示例条目

```json
{
  "id": "my-format-skill",
  "name": "My Format Skill",
  "description": "何时用：想对提交信息强制统一格式时",
  "author": "Jane Doe",
  "install": "npx skills add owner/repo --skill my-format-skill",
  "repo": "https://github.com/owner/repo",
  "license": "MIT",
  "topics": ["engineering"]
}
```

## 自检清单（提交前，勾选确认）

- [ ] 在 `catalog/catalog.json` 的 `skills` 数组末尾新增了条目
- [ ] 本地运行 `node catalog/validate.mjs` 通过（退出码 0）
- [ ] 本地运行 `node catalog/sync-catalog.mjs` 重新生成三产物，并把改动一起提交
- [ ] `id` 小写连字符、与已有条目不重复；`topics` 均来自 `catalog/topics.json`
- [ ] 条目是独立 Claude Code skill（SKILL.md 形态），非 plugin / MCP server / command / agent

## 维护者审核清单（合入前逐项核对）

- [ ] 形态：SKILL.md 形态（REQ-CAT-004）
- [ ] `repo` 可访问且指向真实来源
- [ ] `license` 明确
- [ ] `description` 说明「何时用」且与 skill 实际一致
- [ ] `topics` 与 skill 实际能力匹配
- [ ] CI `validate` job 通过

> 合入权始终在维护者；CI 通过不等于已收录（REQ-CON-004）。
