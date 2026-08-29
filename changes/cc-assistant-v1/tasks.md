# Tasks: CC Assistant v1

## File Structure

| 文件 | 职责 |
|---|---|
| `cc-assistant/SKILL.md`（Create） | 核心指令：Scanner/Matcher/Recommender/Health/Feedback/Apply 的完整行为规范 |
| `cc-assistant/commands/assist.md`（Create） | `/assist` 主入口，触发 skill 完整推荐流程 |
| `cc-assistant/commands/assist-health.md`（Create） | `/assist health` 独立健康报告 |
| `cc-assistant/commands/assist-apply.md`（Create） | `/assist apply` 代劳启用 |
| `cc-assistant/commands/feedback.md`（Create） | `/feedback` 提交反馈 |
| `cc-assistant/scripts/catalog.py`（Create） | 确定性计算：`merge_catalogs()`、`score_health()` |
| `cc-assistant/scripts/test_catalog.py`（Create） | catalog.py 的单元测试 |
| `cc-assistant/data/scenarios.json`（Create） | 场景信号定义（权重/阈值/优先级/置信度） |
| `cc-assistant/data/recommendations.json`（已有） | 内置目录（含 scenarios 映射），本会话已写 |
| `cc-assistant/data/custom-recommendations.json`（已有） | 自定义目录（空模板），本会话已写 |
| `cc-assistant/eval/cases.md`（Create） | 端到端测试用例（test prompt + 期望输出） |

## Interfaces

- **Batch 1 → Batch 2**：`scripts/catalog.py` 导出
  - `merge_catalogs(builtin: dict, custom: dict) -> dict`（同 schema，按 id 合并、custom 覆盖）
  - `score_health(enabled: {"skills": [str], "rules": [str], "hooks": [str]}) -> {"score": int, "level": str}`
  - `data/scenarios.json` schema：`{"version": str, "scenarioSignals": {scenario: {"signals": [{type: str, pattern?: str, weight: int}], "threshold": int}}, "priority": [str], "confidence": {high: int, medium: int}}`
- **Batch 2 → Batch 3**：`SKILL.md` 定义技能名与触发方式，命令文件内容引用该技能名。
- **Batch 3 → Batch 4**：命令文件 + SKILL.md 就位后可安装并端到端测试。
- **运行时数据**（由 SKILL.md 逻辑读写，非本批产物）：`~/.claude/cc-assistant/profile.json`（含 `visitHistory`、`lastEnabledItems`）、`.claude/cc-assistant/project.json`。

## Batch 1: 确定性核心

- [x] **Task 1.1 — 目录合并 + 健康度评分脚本**
  - 文件：`cc-assistant/scripts/catalog.py`、`cc-assistant/scripts/test_catalog.py`
  - TDD：
    1. **RED**：先写 `test_catalog.py`，用例覆盖：`merge_catalogs`（自定义覆盖内置同 id、内置独有保留、custom 为空 dict / None）；`score_health`（空项目=20/需关注、1 skill=25/待改进、6 skill+5 rule=65/优秀、封顶 100）。运行 `python scripts/test_catalog.py` → 失败（catalog.py 不存在）。
    2. **实现**：写 `catalog.py`，实现 `merge_catalogs` 与 `score_health`（权重见 HEALTH-001）。
    3. **GREEN**：运行测试 → 全部通过。
    4. **重构**：处理 custom 为 None / 缺 key 的边界，去重复代码。
    5. **验证**：`python scripts/test_catalog.py` 全绿，无 TODO。
  - Depends on: 无

- [x] **Task 1.2 — 场景信号配置**
  - 文件：`cc-assistant/data/scenarios.json`
  - TDD：
    1. **RED**：对照 spec REQ-MATCH-001 列出 6 场景信号表（new-feature/bug-fix/testing/docs/refactor/init 的信号与权重）与 priority、confidence，作为期望。
    2. **实现**：写 `scenarios.json`（信号、threshold、priority、confidence，字段见 Interfaces）。
    3. **GREEN**：`python -c "import json; json.load(open('data/scenarios.json'))"` 通过；逐条核对信号表与 spec 一致。
    4. **重构**：无（纯数据）。
    5. **验证**：JSON 合法，6 场景 + priority + confidence 齐全。
  - Depends on: 无

## Batch 2: SKILL.md 主指令

> 每个 Task 的 TDD 用 eval 用例：先在 `eval/cases.md` 写入"项目状态 → 期望输出"，跑一遍确认当前无实现不满足，再写对应 SKILL.md 段，重跑验证。

- [x] **Task 2.1 — Scanner + Matcher 指令**
  - 文件：`cc-assistant/SKILL.md`（frontmatter + Scanner/Matcher 段）、`cc-assistant/eval/cases.md`
  - TDD：
    1. **RED**：在 `eval/cases.md` 加用例：① React 项目 + untracked `src/*.tsx` → 识别 react + new-feature（高置信）；② 非 git 仓库 → 跳过 git 信号不报错；③ 成熟项目无 `.claude/` → 不判 init。
    2. **实现**：写 SKILL.md frontmatter（`name: cc-assistant`、description）+ Scanner 指令（技术栈/已有配置扫描/信号采集/项目意图/bootstrap）+ Matcher 指令（加权得分→阈值→优先级决胜→置信度→回退）。
    3. **GREEN**：跑用例 → 输出符合期望。
    4. **重构**：精简指令、去掉歧义表述。
    5. **验证**：对应 spec SCAN-001~005、MATCH-001~004 逐条覆盖。
  - Depends on: Task 1.2（读 scenarios.json）

- [x] **Task 2.2 — Recommender + Health Check 指令**
  - 文件：`cc-assistant/SKILL.md`（Recommender/Health 段）、`cc-assistant/eval/cases.md`
  - TDD：
    1. **RED**：加用例：① python 项目 → 不推荐 react-best-practices；② 已启用 test-generator → 不再推荐；③ 学习项目+新手 → 只出 1-2 条；④ 空项目 `/assist health` → 20 分"需关注"。
    2. **实现**：写 Recommender 指令（两层合并→简单规则→双维度→新手过滤→诚实输出→场景映射→空回退→进阶）+ Health 指令（评分/诊断/标注/独立调用），评分与合并调用 `catalog.py`。
    3. **GREEN**：跑用例 → 符合。
    4. **重构**：精简。
    5. **验证**：对应 REC-001~008、HEALTH-001~004。
  - Depends on: Task 1.1（catalog.py）、Task 2.1

- [x] **Task 2.3 — Feedback + Apply 指令**
  - 文件：`cc-assistant/SKILL.md`（Feedback/Apply 段）、`cc-assistant/eval/cases.md`
  - TDD：
    1. **RED**：加用例：① 推荐后用户输入 👍 → 关联到最近一条并记录；② 用户拒绝确认 → 不执行安装；③ 确认启用 conventional-commit → 写入 `.claude/rules/conventional-commit.md`。
    2. **实现**：写 Feedback 指令（记录/关联/降权/下次顺带问，明确"裸 👍/👎 紧跟推荐输出 = 对最近一条"约定）+ Apply 指令（显式确认→Bash 跑 installCmd / Write 写规则→best-effort→更新 enabledItems）。
    3. **GREEN**：跑用例 → 符合。
    4. **重构**：精简。
    5. **验证**：对应 FB-001~004、APPLY-001~003。
  - Depends on: Task 2.2

## Batch 3: 命令文件

- [x] **Task 3.1 — 4 个薄斜杠命令**
  - 文件：`cc-assistant/commands/assist.md`、`assist-health.md`、`assist-apply.md`、`feedback.md`
  - TDD：
    1. **RED**：明确每个命令的触发行为（如 `/assist` → 触发 skill 完整流程；`/assist health` → 只出健康报告）。
    2. **实现**：写 4 个命令文件，内容均为"使用 cc-assistant skill 执行对应流程"的简短指令。
    3. **GREEN**：逐条核对命令与预期行为对应。
    4. **重构**：统一措辞。
    5. **验证**：4 命令齐全，无占位。
  - Depends on: Task 2.3

## Batch 4: 安装 + 端到端验证

- [x] **Task 4.1 — 安装（项目级 `.claude/`，用户要求覆盖契约默认的用户级）**
  - 文件：复制 `cc-assistant/SKILL.md`、`data/`、`scripts/` → `~/.claude/skills/cc-assistant/`；复制 `commands/*.md` → `~/.claude/commands/`
  - TDD：
    1. **RED**：确认 `~/.claude/skills/cc-assistant/` 与 `~/.claude/commands/assist.md` 当前不存在或为旧版。
    2. **实现**：复制文件到目标路径。
    3. **GREEN**：`ls ~/.claude/skills/cc-assistant/` 与 `ls ~/.claude/commands/` 列出预期文件。
    4. **重构**：无。
    5. **验证**：文件就位，路径与 design D5 一致。
  - Depends on: Task 3.1

- [x] **Task 4.2 — 端到端验证**
  - 文件：`cc-assistant/eval/cases.md`（完善全部用例）
  - TDD：
    1. **RED**：在临时 React 项目跑 `/assist`，记录期望（识别 react + 场景 + 真实目录推荐 + 健康度 + 无虚构数字）。
    2. **实现**：无新代码，仅运行验证；发现偏差回改对应 SKILL.md 段。
    3. **GREEN**：全流程输出符合期望：识别正确、推荐来自真实目录、代劳启用经确认成功（用 dummy installCmd 验证确认流程，不真实安装）、反馈被记录、全程无上传。
    4. **重构**：根据实际偏差精简指令。
    5. **验证**：`eval/cases.md` 全部用例通过；对应全部 28 条 spec 需求。
  - Depends on: Task 4.1
