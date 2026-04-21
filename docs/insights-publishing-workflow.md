# 新闻 / 洞察栏目内容机制

## 当前阶段

当前 `新闻 / 洞察` 使用**本地内容文件**作为发布源，不依赖数据库。

内容文件位置：

- `src/content/insights.ts`

每篇内容至少包含：

- `slug`
- `title`
- `summary`
- `description`
- `seoTitle`
- `seoDescription`
- `publishedAt`
- `readingTime`
- `category`
- `metric / metricLabel`
- `sections`

## 当前页面结构

- 首页入口：`/` 中的 `新闻 / 洞察` 区块
- 列表页：`/insights`
- 详情页：`/insights/:slug`

## 为什么先不用数据库

现阶段更重要的是：

- 快速搭建可持续更新的语义内容栏目
- 让内容进入稳定 URL 和独立页面
- 让首页只做轻入口，不不断堆内容

文件化内容更适合：

- Git/GitHub 管理
- 快速审核
- 明确版本历史
- 后续迁移到 CMS / 数据库

## 后续支持 OpenClaw + 飞书发布

当前数据结构已经预留：

- `publishing.openclawAgent`
- `publishing.distributionTargets`
- `publishing.feishuReady`

建议后续流程：

1. 飞书里提交选题或文章草稿
2. `jgmao-support-agent` 生成文章结构和初稿
3. 人工审核标题、摘要、SEO 文案和正文
4. 通过脚本把文章写入 `src/content/insights.ts` 或后续独立内容文件
5. 自动触发网站构建与发布

## 推荐的下一阶段

如果后续更新频率变高，建议做成：

- 飞书作为编辑入口
- `jgmao-support-agent` 作为草稿生成和润色入口
- 网站仍以受控内容文件或内容 API 为最终发布源

这样可以兼顾：

- 内容效率
- GEO 持续更新
- 发布稳定性
- 审核可控性
