---
name: create-skill
description: 交互式创建新的Claude Skill模板
---

# Create Skill - 自定义技能创建器

交互式向导，帮助用户创建符合规范的自定义 Claude Skill。

## 功能
- 收集 skill 元数据（名称、描述、用途）
- 定义 skill 的工作流程
- 设置行为准则（Do's and Don'ts）
- 自动生成 Markdown 技能文件
- 注册技能别名

## 工作流程

1. **输入基本信息**
   - 技能名称 (例如: `/summarize-meeting`)
   - 简短描述

2. **定义角色与目标**
   - Claude 扮演的角色
   - 用户的目标场景

3. **构建流程**
   - 步骤 1: ...
   - 步骤 2: ...

4. **生成文件**
   - 在 `.claude/skills/` 下创建 skill 目录与 `SKILL.md`
   - 填充标准模板

## 行为准则

- ✓ 确保技能名称以 `/` 开头
- ✓ 验证 skill 目录是否冲突
- ✓ 保持模板结构的一致性

## 执行脚本

```bash
npm run create-skill
```
