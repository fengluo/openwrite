# Claude Skills 参考

完整的 Claude Skills 使用指南。

## Skills 列表

- [/thinking-partner](#thinking-partner) - 思考伙伴模式
- [/quick-capture](#quick-capture) - 快速捕获
- [/inbox-processor](#inbox-processor) - 收件箱处理
- [/research-assistant](#research-assistant) - 研究助手
- [/daily-review](#daily-review) - 每日回顾
- [/weekly-synthesis](#weekly-synthesis) - 每周综合
- [/upgrade](#upgrade) - 系统升级
- [/create-skill](#create-skill) - 创建技能

---

## /thinking-partner

### 用途

思考伙伴模式 - 通过对话探索想法，建立知识连接。

### 何时使用

- 开始新项目前的头脑风暴
- 遇到困惑需要理清思路
- 探索复杂主题的多个角度
- 对某个观点感到不确定

### 工作流程

1. 告诉 AI 你想探索的主题
2. AI 搜索工作区中的相关内容
3. AI 提出引导性问题
4. 通过对话深化理解
5. AI 总结并保存洞察记录

### 示例对话

```
User: /thinking-partner
我想探索如何设计一个好的 API

AI: 让我先搜索你工作区中关于 API 的内容...

找到了：
- [[API-Design-Patterns]] - 你收集的设计模式
- [[RESTful-Best-Practices]] - REST 最佳实践

我想先了解几个问题：

1. 在你看来，"好的 API"最重要的特征是什么？
2. 你在实际项目中遇到过哪些"不好"的 API？
3. 这个探索是为了实际项目，还是理论研究？

[对话继续...]

我们的讨论浮现了以下洞察，是否保存？
- 一致性比灵活性更重要
- 好的错误信息能节省 90% 的调试时间
- 文档是 API 的一部分，不是附加品
```

### 输出

- 洞察写入相关的上下文笔记（项目/领域/资源/收件箱中与主题最相关的那条）
- 包含思考过程和关键发现

### 技巧

- 不要急于结束对话，给自己思考的空间
- 诚实回答 AI 的问题，包括"我不知道"
- 如果 AI 的方向不对，直接告诉它

---

## /quick-capture

### 用途

零摩擦捕获想法到收件箱。

### 何时使用

- 突然有灵感
- 阅读时遇到值得记录的内容
- 需要记录待办事项
- 有问题或困惑

### 工作流程

1. 运行 skill
2. 输入想法（可以是不完整的）
3. AI 自动分类并添加标签
4. 文件创建在 00_Inbox/
5. 选择是否立即展开

### 示例

```
User: /quick-capture
写一篇关于 TypeScript 泛型的教程，面向初学者

AI: ✓ 已保存到 00_Inbox/2024-01-15-typescript-generics-tutorial.md
    类型: idea
    标签: #tutorial #typescript #generics

是否现在就展开这个想法？
[Y] 使用 /thinking-partner 深入探索
[N] 稍后处理
[P] 直接移动到特定项目

> N

AI: ✓ 已保存！使用 /inbox-processor 可以稍后整理。
```

### 捕获类型

- **idea** - 创意、想法
- **todo** - 待办事项
- **note** - 一般笔记
- **question** - 问题
- **reference** - 参考资料链接

### 技巧

- 不要担心格式，先记录
- 可以只写关键词
- 可以包含链接和引用
- 一天捕获多次很正常

---

## /inbox-processor

### 用途

智能整理收件箱，将内容移动到合适位置。

### 何时使用

- 收件箱超过 5 个项目
- 每天/每周的固定整理时间
- 想要将想法转化为行动

### 工作流程

1. 扫描收件箱中所有未处理文件
2. 逐个分析内容和元数据
3. 提供分类建议和理由
4. 让用户选择处理方式
5. 执行移动或归档

### 示例

```
User: /inbox-processor

AI: 📥 收件箱包含 8 个未处理项目

[1] 2024-01-10-react-hooks-tutorial.md
    类型: idea
    标签: #tutorial #react

    内容预览:
    "写一篇关于 React Hooks 最佳实践的深度文章..."

    💡 建议: 移动到 01_Projects/React-Hooks-Tutorial/
    理由: 这是一个明确的写作项目

    [M] 移动到建议位置
    [E] 编辑后再决定
    [D] 删除/归档
    [S] 跳过
    [T] 使用 /thinking-partner

> M

AI: ✓ 已移动到 01_Projects/React-Hooks-Tutorial/

[2/8] ...
```

### 处理选项

- **M** - 移动到建议位置
- **E** - 编辑内容后再决定
- **D** - 删除或归档
- **S** - 跳过，保留在收件箱
- **T** - 使用思考伙伴深入探索
- **C** - 自定义目标位置

### 技巧

- 建议每周至少运行一次
- 可以选择批量应用建议
- 不确定的项目保留在收件箱没关系

---

## /research-assistant

### 用途

深入研究主题，整合内外部资料，生成结构化大纲。

### 何时使用

- 写作前的资料收集
- 学习新主题
- 准备演讲或教程
- 需要综合多个来源的信息

### 工作流程

1. 确定研究主题和目标
2. 搜索工作区中的相关内容
3. 建议外部资料搜索方向
4. 综合分析内外部信息
5. 生成结构化大纲
6. 保存研究成果

### 示例

```
User: /research-assistant
主题: 如何设计 RESTful API
目标: 写一篇教程文章

AI: 我将帮你深入研究这个主题。

[内部搜索]
找到相关内容:
- [[API-Design-Patterns]] - 设计模式总结
- [[Backend-Development]] - 后端开发领域笔记
- [[REST-vs-GraphQL]] - 技术对比

[外部建议]
建议搜索：
1. REST API 设计最佳实践（官方规范）
2. 常见的 API 设计错误（实战经验）
3. 大公司的 API 设计指南（Stripe, GitHub）

是否搜索外部资料？[Y/n]

> Y

[综合分析]
# RESTful API 设计 - 研究综合

## 核心概念
1. 资源导向设计 - 一切皆资源
2. HTTP 方法语义 - GET/POST/PUT/DELETE
3. 状态码的正确使用

## 建议大纲
# 如何设计 RESTful API

### 1. 引言 (300 字)
- 为什么 REST 仍然重要
- 常见误区

### 2. 核心原则 (800 字)
- 资源命名
- HTTP 方法
- 状态码
...

保存到哪里？
[1] 00_Inbox
[2] 01_Projects/REST-API-Tutorial
[3] 03_Resources
```

### 研究目标

- **写作** - 生成文章大纲
- **学习** - 生成学习路径
- **决策** - 综合对比分析
- **分析** - 深度主题研究

### 技巧

- 明确告诉 AI 你的目标读者
- 如果有具体问题，在开始时说明
- 可以多次运行深化研究

---

## /draft-content

### 用途

基于大纲或笔记快速生成文章初稿。

### 何时使用

- 已经有了大纲，需要扩充成文
- 面对空白文档感到卡顿时
- 需要快速产出草稿进行迭代

### 工作流程

1. 读取当前文件中的大纲
2. 保持原有结构和层级
3. 将要点扩充为完整段落
4. 标记需要补充的细节

### 示例

```
User: /draft-content

AI: 我将基于你的大纲生成初稿。

# 如何学习编程：从入门到精通

编程是一项极具价值的技能，但入门往往让人感到迷茫。本文将为你提供一条清晰的学习路径。

## 1. 选择第一门语言

对于初学者来说，选择正确的入门语言至关重要。

Python 是目前最推荐的选择。它的语法简洁清晰，接近自然语言...
```

### 技巧

- 大纲越详细，生成的初稿质量越高
- 可以在大纲中指定每个部分的字数要求
- 使用 `[语气: 幽默]` 等标记控制风格

---

## /de-ai-ify

### 用途

移除文本中的"AI 味"，使其更具个人风格、更自然、更真实。

### 何时使用

- 感觉文章读起来像机器生成的
- 需要增加个人观点和情感
- 想要调整文章的语气风格

### 工作流程

1. 分析文本中的 AI 特征（僵硬结构、滥用连接词等）
2. 提供更自然的重写建议
3. 根据用户偏好调整风格（专业、亲切、犀利等）

### 示例

```
User: /de-ai-ify
随着人工智能技术的不断进步...总而言之，我们应该拥抱这一变化。

AI: 这段文字 AI 味较重。

建议修改 (更自然):
AI 正在彻底改变我们的工作方式...与其担心被取代，不如现在就开始学着用它。
```

### 技巧

- 明确告诉 AI 你想要的具体风格（如"像乔布斯那样说话"）
- 提供一段你自己写的文字作为参考
- 专注于具体的段落而非整篇文章

---

## /daily-review

### 用途

每日回顾 - 自动统计当天活动，引导反思。

### 何时使用

- 每天工作结束时
- 固定的回顾时间（如晚上 9 点）
- 想要回顾今天的工作

### 工作流程

1. 自动扫描今天修改的文件
2. 生成活动统计和主题分析
3. 提出 5 个反思问题
4. 收集用户回答
5. 创建回顾记录

### 示例

```
User: /daily-review

AI: 📊 今日活动统计

## 文件变化
- 新增笔记: 2 篇
- 更新笔记: 4 篇
- 总字数变化: +950 字

## 活跃项目
- [[React-Tutorial]] - 新增 600 字
- [[API-Guide]] - 更新了大纲

## 今日核心主题
1. React 开发 (4 次提及)
2. API 设计 (2 次提及)

---

## 反思时刻

### 1. 今日亮点
今天最有价值的洞察或成果是什么？

> 理解了 React Hooks 的闭包陷阱

### 2. 完成任务
今天完成了哪些重要任务？

> 完成了 React 教程的第3节
> 整理了 API 设计的参考资料

### 3. 挑战与困惑
遇到了什么挑战？

> useEffect 的依赖数组还是有些混乱

### 4. 新知识
学到了什么？

> 学会了使用 useCallback 优化性能

### 5. 明天计划
明天需要做什么？

> 继续写 React 教程第4节
> 研究 useEffect 的最佳实践

✅ 回顾已保存到 06_Meta/Reviews/daily/2024-01-15.md
```

### 反思问题

1. 今日亮点
2. 完成任务
3. 挑战与困惑
4. 新知识
5. 明天计划

### 技巧

- 固定时间回顾，养成习惯
- 诚实记录，包括挑战和失败
- 保持简短，5-10 分钟完成
- 定期回顾每日记录，发现模式

---

## /weekly-synthesis

### 用途

每周综合 - 深度回顾，整合本周进展，提炼洞察，规划下周。

### 何时使用

- 每周结束时（周五下午或周日晚上）
- 需要规划下周重点时
- 感到工作方向不明确时

### 工作流程

1. 自动扫描过去 7 天的文件变化
2. 生成周度活动概览和重点项目进展
3. 引导深度反思（成就、瓶颈、洞察）
4. 协助制定下周战略计划
5. 创建周度回顾记录

### 示例

```
User: /weekly-synthesis

AI: 📅 本周活动统计 (2024-01-08 至 2024-01-14)

## 核心数据
- 新增笔记: 12 篇
- 更新笔记: 25 篇
- 活跃天数: 6/7 天

## 重点推进项目
1. [[React-Hooks-Tutorial]]
   - 完成了初稿撰写
   - 修改文件数: 8

2. [[API-Design-Guide]]
   - 收集了大量参考资料
   - 修改文件数: 5

---

## 深度反思时刻

### 1. 本周高光时刻 (Big Wins)
这一周最令你满意的成就是什么？

> 完成了 React 教程的核心章节，感觉写得很通顺

### 2. 阻碍与瓶颈
本周遇到了哪些反复出现的问题？

> 上午容易被邮件打断，难以进入深度工作状态

### 3. 关键洞察
本周学到了什么？

> "先写烂草稿，再修改"的策略大大提高了写作速度

### 4. 下周主要目标
下周必须要完成的 3 件事是什么？

> 1. 发布 React 教程
> 2. 开始 API 指南的大纲
> 3. 每天上午先工作 2 小时再看邮件

✅ 周度回顾已保存到 06_Meta/Reviews/weekly/2024-W02.md
```

### 技巧

- **结合每日回顾** - 在开始周回顾前，快速浏览本周的每日回顾
- **关注系统** - 不仅关注做了什么，更关注是如何做的（流程、习惯）
- **现实规划** - 下周目标不要定得太多，留出缓冲时间

---

## /weekly-synthesis

### 用途

每周综合 - 深度回顾，整合本周进展，提炼洞察，规划下周。

### 何时使用

- 每周结束时（周五下午或周日晚上）
- 需要规划下周重点时
- 感到工作方向不明确时

### 工作流程

1. 自动扫描过去 7 天的文件变化
2. 生成周度活动概览和重点项目进展
3. 引导深度反思（成就、瓶颈、洞察）
4. 协助制定下周战略计划
5. 创建周度回顾记录

### 示例

```
User: /weekly-synthesis

AI: 📅 本周活动统计 (2024-01-08 至 2024-01-14)

## 核心数据
- 新增笔记: 12 篇
- 更新笔记: 25 篇
- 活跃天数: 6/7 天

## 重点推进项目
1. [[React-Hooks-Tutorial]]
   - 完成了初稿撰写
   - 修改文件数: 8

2. [[API-Design-Guide]]
   - 收集了大量参考资料
   - 修改文件数: 5

---

## 深度反思时刻

### 1. 本周高光时刻 (Big Wins)
这一周最令你满意的成就是什么？

> 完成了 React 教程的核心章节，感觉写得很通顺

### 2. 阻碍与瓶颈
本周遇到了哪些反复出现的问题？

> 上午容易被邮件打断，难以进入深度工作状态

### 3. 关键洞察
本周学到了什么？

> "先写烂草稿，再修改"的策略大大提高了写作速度

### 4. 下周主要目标
下周必须要完成的 3 件事是什么？

> 1. 发布 React 教程
> 2. 开始 API 指南的大纲
> 3. 每天上午先工作 2 小时再看邮件

✅ 周度回顾已保存到 06_Meta/Reviews/weekly/2024-W02.md
```

### 技巧

- **结合每日回顾** - 在开始周回顾前，快速浏览本周的每日回顾
- **关注系统** - 不仅关注做了什么，更关注是如何做的（流程、习惯）
- **现实规划** - 下周目标不要定得太多，留出缓冲时间

---

## /upgrade

### 用途

智能检查并应用 Claude Write 的系统更新。

### 何时使用

- 想要获取最新功能和修复时
- 系统提示有新版本时

### 工作流程

1. 检查远程仓库的最新版本
2. 对比当前工作区的版本
3. 在 `.backup/` 目录创建备份
4. 安全应用更新（覆盖系统文件，保留用户数据）

### 示例

```bash
npm run upgrade
```

### 行为准则

- 永远先备份
- 绝不覆盖用户的文档和数据
- 提示用户确认关键更改

---

## /create-skill

### 用途

交互式向导，帮助用户创建符合规范的自定义 Claude Skills。

### 何时使用

- 想要固化常用的 Prompt 时
- 需要为特定任务创建专门的 Agent 时

### 工作流程

1. 收集 skill 元数据（名称、描述、用途）
2. 定义角色与目标
3. 构建工作流程步骤
4. 设置行为准则
5. 自动生成 skill 目录与 `SKILL.md`

### 示例

```bash
npm run create-skill
```

---

## 组合使用

### 完整工作流示例

```
1. 早上：回顾昨天的计划
   打开 06_Meta/Reviews/daily/昨天.md

2. 工作中：随时捕获
   /quick-capture (多次)

3. 深入思考：
   /thinking-partner

4. 研究主题：
   /research-assistant

5. 每周整理：
   /inbox-processor

6. 晚上回顾：
   /daily-review
```

### 项目周期

```
[启动]
/thinking-partner - 探索项目方向
/research-assistant - 研究和规划

[执行]
/quick-capture - 记录进展和问题
/daily-review - 每日推进

[完成]
整理笔记并归档
提取可复用知识到 Resources
```

## 自定义技能

你可以在 `.claude/skills/` 创建自己的 skills。

参考现有 skill 的格式，创建目录并添加 `SKILL.md` 即可。

---

## 自动化脚本 (npm scripts)

除了 Claude Skills，系统还提供了一系列自动化脚本，通过 `npm run` 执行。

### 查看帮助

```bash
npm run help
```

### 文件管理

#### `npm run file:organize` - 整理附件

自动将 05_Attachments/ 中的文件按类型分类到子目录。

```bash
npm run file:organize

# 输出示例:
# 📁 整理附件
# 移动 screenshot.png → images/screenshot.png
# 移动 document.pdf → documents/document.pdf
# ✓ 整理完成: 移动 12 个文件
```

#### `npm run file:orphans` - 查找孤儿附件

找出 05_Attachments/ 中未被任何 Markdown 文件引用的文件。

```bash
npm run file:orphans

# 输出示例:
# 🔍 查找孤儿附件
# 扫描附件目录: 50 个文件
# Markdown 文件: 30 个
# 引用的附件: 42 个
#
# ⚠ 发现 8 个孤儿附件 (2.5 MB):
#
# .png (5 个):
#   - 05_Attachments/images/old-screenshot.png (500 KB)
#   ...
```

**选项**:
- `--json` - 输出 JSON 格式，便于程序处理

#### `npm run file:compress` - 压缩图片

使用 sips (macOS) 或 ImageMagick 压缩大图片。

```bash
npm run file:compress

# 预览模式 (不实际修改)
npm run file:compress -- --dry-run

# 自定义压缩参数
npm run file:compress -- --quality=70 --max-width=1200
```

**选项**:
- `--dry-run` - 预览模式，不实际修改文件
- `--no-backup` - 不备份原始文件
- `--quality=N` - 压缩质量 (1-100，默认 85)
- `--max-width=N` - 最大宽度 (默认 1920)

### 统计分析

#### `npm run stats` - 工作区完整统计

生成详细的工作区统计报告，包括文件分布、标签、链接等。

```bash
npm run stats

# 输出包括:
# - 基础统计 (笔记数、字数、存储空间)
# - 文件夹分布
# - Top 10 标签
# - Top 5 最长笔记
# - 知识连接分析
# - 建议
```

#### `npm run stats:overview` - 快速概览

只显示基础统计，用于快速了解工作区状态。

#### `npm run stats:words` - 字数统计

按项目、标签、文件夹详细统计字数。

```bash
npm run stats:words

# 输出包括:
# - 总体统计
# - 按文件夹统计 (含进度条)
# - 按项目统计
# - Top 10 标签字数
# - Top 10 最长文章
# - 写作目标追踪 (500/1000/2000/5000 字)
```

**选项**:
- `--json` - 输出 JSON 格式

#### `npm run stats:activity` - 活跃度分析

分析最近 30 天的写作活跃度。

```bash
npm run stats:activity

# 输出包括:
# - 活跃度概览 (今日/本周/本月更新)
# - 30 天活跃度热力图
# - 星期分布 (哪天写得最多)
# - 时段分布 (什么时候写作)
# - 最近更新的文件
# - Git 提交统计 (如有)
```

### Git 自动化

#### `npm run git:smart-commit` - 智能提交

分析变更并自动生成合适的提交信息。

```bash
npm run git:smart-commit

# 交互模式 (默认)
# 显示变更摘要，建议提交信息，询问是否使用

# 自动模式
npm run git:smart-commit -- --auto
# 或
npm run git:smart-commit -- -y
```

**工作流**:
1. 显示新增、修改、删除的文件
2. 分析变更类型 (Markdown/配置/脚本等)
3. 生成提交信息建议
4. 询问确认或编辑
5. 执行提交
6. 询问是否推送

#### `npm run git:sync` - 自动同步

检测本地与远程的差异，自动拉取或推送。

```bash
npm run git:sync

# 使用 rebase 方式合并
npm run git:sync -- --rebase
```

**功能**:
- 检查当前仓库状态
- 获取远程更新 (fetch)
- 显示领先/落后提交数
- 自动拉取或推送
- 检测冲突并提供建议

### 网页保存

#### `npm run web:save` - 保存单个网页

将网页文章保存为 Markdown 格式。

```bash
# 保存到默认目录 (03_Resources/Articles)
npm run web:save -- "https://example.com/article"

# 保存到指定目录
npm run web:save -- "https://blog.example.com/post" "03_Resources/Tech"
```

**输出**:
- 自动提取标题
- 转换 HTML 为 Markdown
- 添加 YAML Front Matter (标题、来源、保存时间、标签)
- 保存为 `YYYY-MM-DD-title.md`

#### `npm run web:batch` - 批量保存网页

从文件读取 URL 列表，批量保存。

```bash
# 创建 URL 列表文件 (urls.txt)
# # 这是注释
# https://example.com/article1
# https://example.com/article2

# 执行批量保存
npm run web:batch -- urls.txt

# 保存到指定目录
npm run web:batch -- urls.txt "03_Resources/Reading-List"

# 自定义请求间隔
npm run web:batch -- urls.txt --delay=3000

# 生成 JSON 报告
npm run web:batch -- urls.txt --report
```

**选项**:
- `--delay=N` - 请求间隔毫秒数 (默认 2000)
- `--stop-on-error` - 遇到错误时停止
- `--report` - 生成 JSON 格式的处理报告

---

## 脚本速查表

| 脚本 | 用途 | 常用选项 |
|------|------|----------|
| `npm run help` | 显示帮助 | - |
| `npm run init` | 初始化工作区 | - |
| `npm run file:organize` | 整理附件 | - |
| `npm run file:orphans` | 查找孤儿附件 | `--json` |
| `npm run file:compress` | 压缩图片 | `--dry-run`, `--quality=N` |
| `npm run stats` | 完整统计 | - |
| `npm run stats:overview` | 快速概览 | - |
| `npm run stats:words` | 字数统计 | `--json` |
| `npm run stats:activity` | 活跃度分析 | - |
| `npm run git:smart-commit` | 智能提交 | `--auto` |
| `npm run git:sync` | 自动同步 | `--rebase` |
| `npm run web:save` | 保存网页 | - |
| `npm run web:batch` | 批量保存 | `--delay=N`, `--report` |

---

**记住**: 这些脚本是工具，不是规则。根据你的需求灵活使用！
