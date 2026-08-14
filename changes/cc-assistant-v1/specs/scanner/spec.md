# Spec: Scanner（环境扫描）

## ADDED Requirements

### Requirement: REQ-SCAN-001 技术栈识别
系统 SHALL 通过根目录特征文件识别项目技术栈，输出 react / vue / node / python / go / rust / unknown 之一。

#### Scenario: 识别 React 项目
- **WHEN** 项目根目录存在 `package.json` 且依赖包含 `react`
- **THEN** 系统输出技术栈 = `react`

#### Scenario: 无特征文件但可分析扩展名
- **WHEN** 根目录无特征文件，但存在 `*.py` 源文件
- **THEN** 系统输出技术栈 = `python`

#### Scenario: 完全无法识别
- **WHEN** 根目录无任何特征文件、也无可识别扩展名
- **THEN** 系统输出技术栈 = `unknown`

#### Scenario: 混合技术栈取主栈
- **WHEN** 根目录同时存在 `package.json` 和 `requirements.txt`
- **THEN** 系统按优先级 `package.json` > `requirements.txt` > `go.mod` > `Cargo.toml` 取主栈，输出 package.json 对应的栈

### Requirement: REQ-SCAN-002 已有配置扫描
系统 SHALL 扫描并列出已启用的配置，覆盖 `~/.claude/skills/`、`.claude/skills/`、`CLAUDE.md`、`.claude/rules/`、`~/.claude/rules/`、settings.json 的 `hooks` 字段。

#### Scenario: 已有 Skill 去重
- **WHEN** `test-generator` 已存在于 `~/.claude/skills/`
- **THEN** 系统在"已启用列表"中包含 `test-generator`，后续推荐不再重复推荐它

### Requirement: REQ-SCAN-003 场景信号采集
系统 SHALL 采集可检测信号：git status（untracked/modified）、最近 commit message、分支名、文件扩展名、`.claude/` 配置有无。

#### Scenario: 采集 git 信号
- **WHEN** 项目是 git 仓库且有 untracked 的 `src/*.tsx` 文件
- **THEN** 系统采集到 `git_status` 信号含 `untracked src/*.tsx`

#### Scenario: 非 git 仓库降级
- **WHEN** 项目不是 git 仓库（`git status` 失败）
- **THEN** 系统跳过所有 git 信号，仅用文件扩展名 + 已有配置信号，不报错

### Requirement: REQ-SCAN-004 项目意图识别
系统 SHALL 将项目意图判定为 `learning` / `personal` / `engineering` 之一。工程化信号 = CI 配置 / Dockerfile / 测试目录 / lint 配置 / LICENSE / CHANGELOG / monorepo / 部署配置。判定规则：命中 ≥2 个工程化信号 = `engineering`；命中 0 个且（项目小 或 README 含"学习/demo/练习"）= `learning`；其余 = `personal`。

#### Scenario: 识别工程化项目
- **WHEN** 项目含 `.github/workflows/` 且含测试目录（≥2 个工程化信号）
- **THEN** 系统输出项目意图 = `engineering`

#### Scenario: 识别学习项目
- **WHEN** 项目无 CI、无测试、无 LICENSE（0 个工程化信号），且 README 含"学习/demo/练习"
- **THEN** 系统输出项目意图 = `learning`

#### Scenario: 识别个人项目
- **WHEN** 项目仅含 LICENSE（1 个工程化信号）
- **THEN** 系统输出项目意图 = `personal`

### Requirement: REQ-SCAN-005 首运行 bootstrap
系统 MUST 在 `~/.claude/cc-assistant/profile.json` 或 `.claude/cc-assistant/project.json` 不存在时，创建带默认字段的文件后再继续。

#### Scenario: 首次运行
- **WHEN** 首次运行 `/assist` 且 `.claude/cc-assistant/project.json` 不存在
- **THEN** 系统先创建默认 project.json，再继续扫描
