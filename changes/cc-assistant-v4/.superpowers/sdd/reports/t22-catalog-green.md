# T22 GREEN：有辅助贡献者行为观察（模板 + 校验脚本引导下，网友添加 skill 条目）

- 场景：网友（有开发经验，按 PR 模板 `skill-entry.md` + `catalog/CONTRIBUTING.md` 指引）向 catalog 添加「提交信息检查 skill」
- 模拟环境：存在全部辅助物（PR 模板 / CONTRIBUTING / schema / topics.json / validate.mjs / sync-catalog.mjs），网友严格按模板逐项填写
- 对比基线：`t21-catalog-red.md`（无辅助环境下的失败模式）
- 数据与产物在模拟后已还原，仓库 catalog 保持原始状态

---

## 1. 网友的条目（verbatim，按模板提交）

在 `catalog/catalog.json` 的 `skills` 数组末尾追加：

```json
{
  "id": "commit-msg-check",
  "name": "Commit Message Checker",
  "description": "何时用：想对 git 提交信息强制统一 conventional commit 格式时",
  "author": "Wang Hanyuan",
  "install": "npx skills add wanghanyuan/commit-msg-check --skill commit-msg-check",
  "repo": "https://github.com/wanghanyuan/commit-msg-check",
  "license": "MIT",
  "topics": ["rules", "engineering"]
}
```

拟提交的「PR」说明：*"新增一个提交信息检查 skill，按 PR 模板逐项填写，已跑 validate + sync 并提交重新生成的三产物。"*

---

## 2. 模板是否完整引导 8 字段？无遗漏 / 空字段？

PR 模板 `skill-entry.md` 逐项列出 8 个字段，每项带格式约束 + 示例；自检清单再逐条勾选复核。网友逐项照模板填写：

| 字段 | 模板指引 → 网友填写 | 判定 |
| --- | --- | --- |
| `id` | `小写字母/数字/连字符，全目录唯一` + 示例 `my-format-skill` → `commit-msg-check` | ✓ 唯一且格式合法 |
| `name` | 示例风格 `My Format Skill` → `Commit Message Checker` | ✓ 有风格约束，不再中文口语化 |
| `description` | `一句话说明「何时用」（触发条件）` + 示例前缀 `何时用：` → `何时用：想对…时` | ✓ 说明触发条件 |
| `author` | `<作者/组织>` → `Wang Hanyuan` | ✓ 非空 |
| `install` | `可执行的安装指引` + 示例 `npx skills add owner/repo --skill …` → `npx skills add wanghanyuan/commit-msg-check --skill commit-msg-check` | ✓ 可执行命令，不再「复制文件夹」口语化 |
| `repo` | `来源仓库 URL，http/https` → `https://github.com/wanghanyuan/commit-msg-check` | ✓ http/https URL |
| `license` | `<许可证>` + 示例 `MIT` → `MIT` | ✓ 非空 |
| `topics` | `来自 catalog/topics.json 的标签，至少 1 个` → `["rules","engineering"]` | ✓ 全在词表内 |

结论：**8 字段全部填写，无跳过、无空字段、无多余字段**。模板的「字段逐项 + 示例 + 自检清单」将字段格式 / 必填 / 词表约束全部显式化。

---

## 3. 证据（实际输出）

### validate.mjs（结构校验，步骤 4）
```
$ node catalog/validate.mjs
catalog 校验通过 ✓
VALIDATE_EXIT=0
```

### sync-catalog.mjs（重新生成三产物，步骤 5a）
```
$ node catalog/sync-catalog.mjs
三产物已生成 ✓
SYNC_EXIT=0
```
三产物均含新条目：
- `site/data/catalog.json`：`skills` 数组含 `commit-msg-check`，8 字段完整（见上文 verbatim）
- `site/data/course-mapping.json`：与 `catalog/course-mapping.json` 输入一致（未新增主题，无需改动）
- `cc-assistant/modules/_community-skills.md`：`## rules` 与 `## engineering` 两个主题分组下均列出 `Commit Message Checker`（name + 描述 + install + repo）

### sync-catalog.mjs --check（防漂移，步骤 5b）
```
$ node catalog/sync-catalog.mjs --check
产物与 catalog 一致 ✓
CHECK_EXIT=0
```

---

## 4. 收敛分析 vs RED 失败模式（t21）

| RED 失败模式（t21） | 有辅助环境（GREEN）行为 | 收敛判定 |
| --- | --- | --- |
| **漏字段 / 字段值不达标**（install 缺命令入口与目录结构、id/license/repo 全靠猜） | 模板逐项列出 8 字段 + 示例；`install` 照模板写成 `npx skills add owner/repo --skill …` 可执行命令；schema 的 `required` + `additionalProperties:false` + `minLength` 使缺字段 / 空值 / 多余字段都会被 validate 拦截 | ✅ 关闭 |
| **词表外标签**（自造 `git` / `conventional-commit` / `commit`） | 模板明示「来自 catalog/topics.json 的标签」；validate.mjs 用 `topicIds.has(t)` 逐项核对，词表外主题报 `词表外主题: xxx`（exit 1） | ✅ 关闭（本例只选词表内 `rules` / `engineering`） |
| **无自检、无产物意识**（改完 catalog.json 即宣称完成） | CONTRIBUTING 明示两命令须退出码 0 + 重生成三产物 + 一并提交；模板自检清单逐条勾选（validate 通过 / sync 重生成并提交）；`--check` 防漂移兜底，漏生成产物即 exit 1 | ✅ 关闭 |
| **id 不校验**（唯一性 / 小写连字符不核对，靠运气） | 模板给出「小写字母/数字/连字符，全目录唯一」规则；schema `pattern: ^[a-z0-9-]+$` 强校验格式；validate 对重复 id 报 `id 重复: xxx`（exit 1） | ✅ 关闭 |

结论：**在模板 + 校验脚本辅助下，贡献者行为收敛到 REQ-CAT-002 门槛** —— 8 字段齐全、topics ⊆ 词表、id 合法唯一、自检两命令 + 产物再生成全部执行且退出码 0。

---

## 5. ⚠️ 关键发现：validate.mjs 前置缺陷（与贡献者条目无关）

- **现象**：在仓库**原始未改动**状态下，`node catalog/validate.mjs` 即 exit 1，报 `course-mapping.json: _community-skills: 缺少模块键`；`node catalog/validate.test.mjs` 的「合法 → 通过」用例 FAIL（TEST_EXIT=1）。
- **根因**：`catalog/validate.mjs` L59 扫描模块目录时只排除 `m0-onboarding.md`，未排除由 `sync-catalog.mjs` 生成且**必须入库**的 `cc-assistant/modules/_community-skills.md`，导致该生成产物被误判为课程模块，进而要求 `course-mapping.json` 存在 `_community-skills` 键（设计意图 REQ-CIV-002 只核对真实课程模块）。
- **影响**：任何 catalog PR 的 CI `validate` job 都会必挂；GREEN 场景步骤 4「validate 必须 exit 0」在未修复前无法达成。
- **修复**：在 `validate.mjs` L59 过滤条件追加 `&& f !== '_community-skills.md'`（与既有 `m0-onboarding.md` 精确排除风格一致）。修复后 `validate.test.mjs` 全部用例 PASS（TEST_EXIT=0），`validate.mjs` exit 0。
- **处置建议**：本修复有意保留在 `catalog/validate.mjs`（未随还原撤销）；是否合入由维护者决定，建议并入 change 并补一条回归用例。

---

## 6. 还原确认

已执行 GREEN 场景步骤 6 的还原命令：

```
git checkout -- catalog/catalog.json catalog/topics.json catalog/course-mapping.json \
  site/data/catalog.json site/data/course-mapping.json cc-assistant/modules/_community-skills.md
```

还原后 `git status`：catalog 数据与三产物全部干净；唯一剩余改动为 `catalog/validate.mjs`（上文缺陷修复，有意保留）。还原后复验：

```
$ node catalog/validate.mjs
catalog 校验通过 ✓
VALIDATE_EXIT=0
```

还原完成，validate 在还原文件上仍 exit 0。

---

自检：3/3 轮完成，外部一致性已核对（t21 基线、CONTRIBUTING/CI/spec 意图、产物实际输出），遗留 0 项（validate.mjs 缺陷修复为有意保留的变更，已在第 5 节显式标注）。
