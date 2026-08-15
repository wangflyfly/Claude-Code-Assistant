# CONTEXT

CC Assistant（Claude Code 上手引导）的领域词汇表。只收录已敲定的规范术语，不含实现细节。

## 核心概念

- **CC Assistant**：一个 Claude Code 上手引导 skill，给有开发经验但不会用 Claude Code 的开发者，用真实任务边做边教，完成从零基础到能独立干活。

- **引导会话（session orchestration）**：一次交互式引导会话的编排，按「定场说明 → 选择真实任务 → 教学闭环（下指令 → 审阅/接受/拒绝 → 迭代）→ 独立复现验证 → 收尾」顺序走完。编排逻辑写在 `SKILL.md` 的自然语言指令里，由 Claude 运行时执行；引导阶段主导节奏，独立复现/收尾阶段交还控制权。

- **教学时机（just-in-time）**：概念只在相关「教学时刻」讲解（如第一次看到 AI 的 diff 才讲如何审阅、接受、拒绝），不预先灌输整篇教材。

- **交叉引用（claude-code-guide）**：参考类内容用 `**REQUIRED SUB-SKILL:** claude-code-guide` 交叉引用，`SKILL.md` 不重复写参考材料；claude-code-guide 未覆盖的进阶内容（MCP / Plan Mode / Agent 等）引用官方 Claude Code 文档（docs.anthropic.com）。

- **独立复现（independent reproduction）**：教学闭环完成后交还控制权，让学习者不靠引导、独立完成一个小任务，作为成功标准；引导只观察与核对，失败时回到相关教学点或给最小提示。

- **安全边界**：任务选小而可逆的；危险/不可逆操作前先说明风险并征得学习者明确同意，必要时建议沙箱或临时项目；有未提交改动先建议 commit 或备份。

- **学习者决定权**：学习者对自己的项目做决定；演示/讲解可以（如展示如何创建 CLAUDE.md），实际落地（创建文件/安装）由学习者自行决定。

- **进阶能力（advanced capabilities）**：Skill / Rule / Hook、MCP、Plan Mode、Agent/子代理，按需讲解、不预先灌输。

- **MCP**：进阶能力教学主题之一——讲解 MCP 是什么、如何添加 server、适用场景（进阶、非必需）；不再是 v1 的「安装类推荐项」。
