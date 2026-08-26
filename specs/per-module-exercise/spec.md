# Spec: Per-module Real Exercise（每模块真实小练习）

## ADDED Requirements

### Requirement: REQ-PME-001 每模块真实小练习
系统 MUST 在每个模块带一个该模块场景的真实小练习（如 Hooks 模块配置一个拦截 Hook、记忆系统模块写一份 CLAUDE.md），练习在学习者自己的项目里进行。

#### Scenario: 模块练习与该机制相关
- **WHEN** 学习者在某模块完成概念与场景讲解
- **THEN** 系统引导其在本人项目里完成一个贴合该模块机制的真实小练习，而非抽象模拟题

#### Scenario: 练习在学习者项目内进行
- **WHEN** 学习者开始某模块的练习
- **THEN** 练习作用于学习者选定的真实项目，不在空壳/样例仓库里做

### Requirement: REQ-PME-002 模块间同一项目串联
系统 MUST 让各模块的小练习在学习者的同一项目上串联进行，形成渐进积累。

#### Scenario: 后续模块沿用前项目
- **WHEN** 学习者进入新模块
- **THEN** 系统沿用之前模块选定的项目（除非学习者主动更换），练习在该项目上继续叠加

### Requirement: REQ-PME-003 引导与独立完成的交互模型
系统 MUST 区分「引导演示」与「学习者独立完成」：skill 演示/讲解该机制，但练习由学习者自己动手，skill 不替学习者完成练习。

#### Scenario: 学习者卡在练习
- **WHEN** 学习者在独立完成练习时卡住
- **THEN** 系统先引导其自己尝试（给提示方向），必要时才给最小提示，不代做练习

#### Scenario: skill 不代做
- **WHEN** 学习者请求 skill 直接替他完成练习
- **THEN** 系统拒绝代做，改为讲解思路并鼓励其自行完成（尊重学习目标）

### Requirement: REQ-PME-004 练习小而可逆
系统 MUST 保证每个模块练习为小而可逆的操作，避免不可逆副作用。

#### Scenario: 练习操作可逆
- **WHEN** 设计/引导某模块练习
- **THEN** 练习涉及的改动小而可逆（可撤销/可回退），不会造成不可恢复的副作用

### Requirement: REQ-PME-005 外部依赖缺失降级
系统 MUST 在模块练习依赖外部条件（如 MCP server、API key、Headless/Agent SDK 可执行环境）缺失或不可用时，降级为讲解/演示/模拟，不阻塞课程进度。

#### Scenario: 练习依赖不可用
- **WHEN** 某模块练习所需外部条件缺失或不可用（如无法连接 MCP server、无 API key）
- **THEN** 系统说明降级原因，改为讲解/演示/模拟该练习；该模块仍按 REQ-SCN-003 计入 `completedModules[]`（记录为「概念与场景完成、真实练习降级」），不阻塞课程进度（模块内 checkpoint 粒度留 design 明确）
