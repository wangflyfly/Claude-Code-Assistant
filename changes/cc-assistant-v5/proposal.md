# Proposal: CC Assistant v5（/contribute 斜杠命令：贡献者一句话入库）

## Why

v4 交付了社区 Skill 目录：`catalog/catalog.json` 唯一事实源 + CI 校验 + GitHub Pages + 课程快照。但贡献一条 skill 的手动流程仍偏重——贡献者要记得 8 个字段的规范（`id` 小写连字符唯一 / `topics` ⊆ 词表 / `license` 明确 / `description` 说明「何时用」）、先跑 `validate.mjs` 再跑 `sync-catalog.mjs`、三产物一起提交、按模板提 PR。这些是「目录系统」该替贡献者扛的复杂度，不该让贡献者背。需要一个 `/contribute` 斜杠命令：贡献者用自然语言描述 skill（名字 / 何时用 / 仓库 / 作者 / install / license），命令负责生成合法条目、映射主题、跑校验与再生成，把贡献者从流程细节中解放出来。

## What Changes

新增一个**项目级斜杠命令**（纯 markdown 编排，零新增安装——复用仓库既有 node 脚本，前置与 v4 手动流程相同）：

- `.claude/commands/contribute.md`（新建）：贡献者在仓库克隆里输入 `/contribute`（输入形态：`$ARGUMENTS` 可选描述或交互式收集，见待定项），命令收集字段（`name` / `description`「何时用」 / `author` / `install` / `repo` / `license`）→ 生成 `id`（从名字 slug 化 + 唯一性检查，非 ASCII 回退见待定项）→ 推断 topics（候选来自 `catalog/topics.json`，展示给贡献者确认 / 调整）→ 词表外强制就近映射（条目仍合法）→ 向 `catalog/catalog.json` 的 `skills` 数组**末尾追加新条目** → 跑 `node catalog/validate.mjs` + `node catalog/sync-catalog.mjs` 再生成三产物 → 再跑 `sync-catalog.mjs --check` 复核直到退出码 0 → 输出 commit/PR 交接步骤（PR 正文在模板固定字段之外附加「建议新增主题」备注行）。
- 命令**不产生任何新脚本、不改动 v4 数据层的结构与格式**：`catalog/catalog.json`（仅向 `skills` 数组末尾追加新条目，schema 与 8 字段结构不变）、`topics.json`、`course-mapping.json`、`catalog.schema.json`、`validate.mjs`、`sync-catalog.mjs`、`.github/workflows/catalog-ci.yml` 全部保持原样——只复用现有脚本，把「怎么做」固化成编排指令。

## Scope

### In

- `.claude/commands/contribute.md`（Create：命令编排，项目级零新增安装，克隆仓库即用）
- `catalog/CONTRIBUTING.md`（Modify：把 `/contribute` 标注为推荐贡献路径；手动流程降级为「原理说明 / 备选」）
- `README.md` 贡献段（Modify：提及 `/contribute` 入口）
- `README-en.md` 贡献段（Modify：与 README.md 中英镜像同步提及 `/contribute` 入口）
- 根 `CLAUDE.md`（Modify：当前 change 指针 v4→v5 + 目录子系统段提及 `/contribute`）
- `cc-assistant/eval/cases.md`（Modify：新增 `/contribute` 贡献者场景用例——无命令基线 vs 有命令行为对比）
- 命令的编排细节：字段收集顺序、`id` 生成规则、topics 推断 + 确认交互、词表外就近映射判定、校验/再生成循环、交接输出文案

### Out

- 不自动 commit / push / 开 PR（边界 = 条目就绪；commit / PR 由贡献者自己执行）
- 不引入 gh 依赖、不加任何新 node/JS 脚本（纯 markdown 命令编排，复用现有 validate/sync）
- 不自动新增主题（词表外 = 就近映射 + PR 备注；词表变更权始终在维护者）
- 不改 v4 目录数据结构的 schema / 字段格式 / 校验与同步脚本：topics.json、course-mapping.json、catalog.schema.json、validate.mjs、sync-catalog.mjs、.github/workflows/catalog-ci.yml 全部不动；catalog.json 仅允许命令向 `skills` 数组末尾追加条目，不涉及任何结构改动
- 不做贡献者身份 / 认证 / 评分体系

## Success Criteria

- 零知识贡献者按 `/contribute` 引导，仅凭自然描述（名字 / 何时用 / 仓库 / 作者 / install / license）跑通：得到合法条目 + 三产物就绪，`validate.mjs` 通过、`sync-catalog.mjs` 再生成后 `--check` 复核退出码 0。
- 词表外场景：贡献者描述的 skill 无合适主题时，命令不报错、就近映射现有主题，并在 PR 交接文案中提示「建议新增主题」。
- eval case 通过：模拟贡献者场景，无命令基线（手动流程）vs 有 `/contribute` 的行为对比符合预期。
- 已有功能无回归：catalog 校验 / 同步 / 网页 / 课程快照不受影响（v4 产物原样）。

## Impact

- **新增**：`.claude/commands/contribute.md`
- **修改**：`catalog/CONTRIBUTING.md`、`README.md`、`README-en.md`、`cc-assistant/eval/cases.md`、根 `CLAUDE.md`（当前 change 指针 v4→v5 + 目录子系统段提及 `/contribute`）
- **不改结构/格式（数据层）**：`catalog.json`（仅命令向 `skills` 数组末尾追加条目，schema 与 8 字段结构不变）、`topics.json`、`course-mapping.json`、`catalog.schema.json`、`validate.mjs`、`sync-catalog.mjs`；`site/data/` 两文件与 `_community-skills.md` 不手工编辑、不改结构，仅由 `sync-catalog.mjs` 重新生成；`.github/workflows/catalog-ci.yml`、课程模块文件（`cc-assistant/modules/*.md`）不改
- **引用「手动贡献流程」的既有文件（影响面扫描）**：
  - `README-en.md` — **Modify**（README.md「贡献」段的英文镜像，须同步提及 `/contribute`，避免中英漂移）
  - `docs/cc-assistant-使用说明书.md`、`docs/github-pages-部署.md`、`site/index.html` — **Out（显式不改）**：仍描述手动提 PR 流程；`/contribute` 是新增命令路径，二者不冲突，本 change 不更新这些文件（显式接受其保持手动流程表述）
- **开发自测**：按 skill-development-spec 的 TDD——`cc-assistant/eval/cases.md` 加贡献者用例；用子智能体模拟贡献者跑 `/contribute` 验证行为（无命令基线 vs 有命令）
- **安装**：命令随仓库分发，克隆即用（项目级 `.claude/commands/`，已验证未被 gitignore），无需用户级安装

## Capabilities

- 一键贡献（Command-Driven Contribution）
- 自然语言描述 → 结构化条目（NL-to-Record）
- 就近主题映射（Nearest-Topic Mapping）
- 本地校验闭环（Validate-Sync Loop）

## 待定项（design/tasks 阶段明确，不阻塞本 proposal）

- 命令的具体编排步骤与提示词（字段收集顺序、topics 确认交互形态）——design 明确
- `id` 生成规则：从名字 slug 化；非 ASCII / 空 / 冲突时的回退（如要求贡献者手输 `id`）——design 明确
- 词表外「就近映射」的判定规则（"就近"怎么定义、如何与贡献者沟通）——design 明确
- `/contribute` 输入形态：`$ARGUMENTS` 直接传描述、还是纯交互式收集——design 明确
- 命令 frontmatter（`description`，可含 `argument-hint`；命令名由文件名决定）——design 明确
- eval 用例的精确断言形态——tasks 阶段定

---

自检：3/3 轮完成，外部一致性+影响面扫描已核对，遗留 0 项
