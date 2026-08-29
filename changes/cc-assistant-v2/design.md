# Design: CC Assistant v2（上手引导）

## Context

- **现状**：v1（效率教练）已完成并关闭，但方向错误。已有 `claude-code-guide`（社区参考型 skill，已安装）、`docs/skill-development-spec.md`（本项目 skill 开发规范）。目标用户 = 有开发经验但不会用 Claude Code 的开发者。
- **平台约束**：Claude Code 无定时器、无首次自动触发；写文件/跑命令每次触发权限确认；斜杠命令能跑 git/读文件，但看不到浏览器/编辑器。
- **交付约束**：Skill + 薄斜杠命令（非插件）；遵守 `docs/skill-development-spec.md`。
- **隐私约束**：本地只读，永不回传。
- **利益相关者**：学习者（有开发经验的 Claude Code 新手）+ 开发者（用户本人）。
- **开发自测**：按 skill-development-spec 的 TDD，用子代理模拟「学习者」跑引导场景。

## Goals

- 让有开发经验的 Claude Code 新手，通过一次交互式会话（用真实任务边做边教）掌握核心 + 进阶能力。
- 参考内容交叉引用 `claude-code-guide`，SKILL.md 精简不重复。
- 结束前学习者能独立完成一个小任务（成功标准）。
- 全程本地、零上传；教学尊重学习者对项目的决定权。

## Decisions

### D1: 引擎 = 自然语言编排指令，非代码
- **Choice**：会话编排逻辑写在 `SKILL.md` 的自然语言指令里，Claude 运行时执行，不写编译代码。
- **Rationale**：CC Assistant 是 Skill 不是程序；编排是给 Claude 读的行为指令。写代码增加复杂度、偏离 Skill 形态。
- **Alternatives**：用代码实现会话状态机。缺点：需维护运行环境、与 Skill 形态割裂；且教学判断（何时讲什么）天然依赖语言模型。

### D2: 内容分层 = 编排层 + 参考层交叉引用
- **Choice**：`SKILL.md` 只写「如何引导」的编排（流程/时机/安全/验证），参考类内容（CLAUDE.md 模板、最佳实践等）用 `**REQUIRED SUB-SKILL:** claude-code-guide` 交叉引用，不重复写。
- **Rationale**：skill-development-spec §6/§9 要求 token 精简与交叉引用而非重复；上游 claude-code-guide 更新自动受益。
- **Alternatives**：把 claude-code-guide 内容 fork 进本 skill。缺点：重复、偏离上游、有社区来源归属问题。

### D3: 会话形态 = 任务驱动·边做边教
- **Choice**：固定流程「定场 → 选真实任务 → 教学闭环（下指令→审阅→迭代）→ 独立复现 → 收尾」，一次会话走完。
- **Rationale**：用学习者自己项目里的真实任务，学到即用到，记忆最扎实（对应成功标准「独立复现」）。
- **Alternatives**：分模块课程（沙箱练习）。缺点：非真实代码、脱离上下文、学习者获得感弱。

### D4: 教学时机 = just-in-time
- **Choice**：概念在相关「教学时刻」讲（如第一次看到 diff 才讲审阅），不预先灌输整篇教材。
- **Rationale**：避免信息过载（非目标：非穷尽手册）；真实任务自然引出概念，理解更深。
- **Alternatives**：先讲完理论再做任务。缺点：抽象、易忘、拖长会话。

### D5: 独立复现验证
- **Choice**：教学闭环完成后交还控制权，让学习者不靠引导独立完成一个小任务；引导只观察/核对，失败时回到相关教学点或给最小提示。
- **Rationale**：这是成功标准的落地方式——可验证「学会了」而非「看懂了」。
- **Alternatives**：只做自评/满意度。缺点：无法验证真实能力。

### D6: 安全边界
- **Choice**：任务选小而可逆的；危险/不可逆操作前先说明风险并征得同意；必要时建议沙箱/临时项目；有未提交改动先建议 commit/备份。
- **Rationale**：学习者在真实项目上操作，需保护其代码与数据（学习者决定权）。
- **Alternatives**：只在沙箱教学。缺点：脱离真实项目，丧失「学到即用到」。

### D7: 进阶覆盖与内容来源
- **Choice**：Skill/Rule/Hook、MCP、Plan Mode、Agent/子代理 按需讲解；claude-code-guide 未覆盖的引用官方 Claude Code 文档（docs.anthropic.com）。
- **Rationale**：claude-code-guide 覆盖 CLAUDE.md/最佳实践/调试，但无 MCP/Plan Mode/Agent；进阶内容来源明确、避免编造。
- **Alternatives**：不覆盖进阶。缺点：与「核心+进阶」范围不符。

### D8: 交付形态 = Skill + 薄斜杠命令
- **Choice**：`SKILL.md` + `/assist` 命令（引导会话入口）；废弃 v1 的 `/assist health`、`/assist apply`、`/feedback`。
- **Rationale**：一个入口即可启动完整引导；v1 命令语义已不适用（无推荐/健康度/反馈）。
- **Alternatives**：多命令（/guide 分模块）。缺点：过度设计，引导应是一体化会话。

### D9: 首次拉起
- **Choice**：学习者运行 `claude` 后输入 `/assist` 启动；skill 的 description 用触发词使其可被发现。
- **Rationale**：目标用户不会 Claude Code，入口必须简单；`/assist` 沿用 v1 命令名减少迁移困惑。
- **Alternatives**：仅靠 skill 自动触发。缺点：不可靠；新手可能不知道该触发什么。

### D10: 描述规范
- **Choice**：遵守 skill-development-spec——frontmatter 含 name+description（≤1024 字符），description 以 "Use when..." 开头、第三人称、只写触发条件不写工作流、<500 字符。
- **Rationale**：保证 skill 可被发现且不被误当捷径执行。
- **Alternatives**：按直觉写 description。缺点：可能被跳过正文（SDO 反例）。

### D11: 文件组织
- **Choice**：`SKILL.md` 精简（编排核心，目标 <500 词）+ 支撑文件（如详细会话脚本/提示词，若超长则拆分）。
- **Rationale**：token 效率（skill-development-spec §6）；编排指令可能超长，拆到支撑文件保持 SKILL.md 精简。
- **Alternatives**：全部内联 SKILL.md。缺点：超长、高频开销大。

### D12: 测试方法
- **Choice**：按 skill-development-spec TDD——用子代理模拟「学习者」跑引导场景：无 skill 基线 vs 有 skill 行为对比；措辞微测 5+ 重复；压力场景测安全边界与独立复现。测试用例（项目状态→期望引导行为）记录在 `cc-assistant/eval/cases.md`（延续 v1 的 eval 目录，内容重写）。
- **Rationale**：技能型 skill 用「能正确应用到新场景」作成功标准；基线对比证明 skill 真正改变行为；用例落文件便于 GREEN 复测。
- **Alternatives**：不测。缺点：无法验证引导是否真的教会。

## Risks And Trade-Offs

- **引导依赖语言模型判断**：教学时机/理解确认靠 Claude 判断，不如代码确定。靠清晰指令 + 少量场景校验缓解。
- **claude-code-guide 可用性**：交叉引用依赖它已安装/可用；缺失时降级为引用官方文档。设计上提供降级路径。
- **真实任务的风险**：学习者项目可能有未提交改动/危险操作。靠安全边界（D6）缓解。
- **会话时长**：核心+进阶+独立复现一次走完可能偏长。靠「按需/just-in-time」控制，进阶可提示课后自行探索。
- **「独立复现」的验证主观性**：结果是否符合预期由引导判断。靠「选任务时先由学习者定义验收标准」+ 失败回退（INDEP-001）缓解。
- **新手初次交互摩擦**：目标用户不会 Claude Code，首次拉起依赖 `/assist` 入口的简单性。
