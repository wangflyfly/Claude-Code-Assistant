# Spec: Independent Reproduction（独立复现验证）

## ADDED Requirements

### Requirement: REQ-INDEP-001 独立复现
系统 MUST 在教学闭环完成后，让学习者不靠引导、独立完成一个小任务，作为成功标准。

#### Scenario: 进入独立复现
- **WHEN** 教学闭环（下指令→审阅→迭代）完成
- **THEN** 系统提出一个小任务（如修一个 bug / 加一个小功能）让学习者独立完成，不再给出引导式指导

#### Scenario: 独立复现未通过
- **WHEN** 学习者独立完成任务失败或结果不符合预期
- **THEN** 系统回到相关教学点重新讲解，或给最小提示后让学习者再试一次；仍失败则告知学习者可用 /help、claude-code-guide、官方文档继续学习，不强行判定为失败

### Requirement: REQ-INDEP-002 验证方式
系统 SHALL 在独立复现阶段只观察与核对结果，不代做；学习者卡住时先让其尝试，必要时才给提示。

#### Scenario: 学习者卡住
- **WHEN** 学习者在独立复现任务中卡住
- **THEN** 系统不直接代做，先引导学习者自己尝试，必要时才给最小提示

### Requirement: REQ-INDEP-003 收尾总结
系统 MUST 在收尾时总结学习者学会的能力，并指向后续资源（/help、claude-code-guide、官方文档）。

#### Scenario: 独立复现通过
- **WHEN** 学习者独立完成任务且结果符合预期
- **THEN** 系统总结本次学会的能力，并提示 /help、claude-code-guide、官方文档作为后续资源
