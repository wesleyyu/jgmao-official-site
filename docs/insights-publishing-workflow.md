# 新闻 / 洞察栏目内容机制

## 当前阶段

当前 `新闻 / 洞察` 使用**飞书协同写作 + 结构化草稿导入 + 官网静态发布**作为内容流程，不依赖数据库。

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

## 飞书文档 -> 官网文章

当前数据结构已经预留：

- `publishing.openclawAgent`
- `publishing.distributionTargets`
- `publishing.feishuReady`

推荐流程：

1. 在飞书文档里完成文章正文、标题、摘要、段落和图片说明。
2. 人工确认文章是否适合公开发布，以及是否涉及客户隐私、夸大承诺或未确认数据。
3. 使用脚本读取飞书文档纯文本，生成官网文章草稿 JSON。
4. 运行导入脚本，把草稿写入 `src/content/insights.ts`。
5. 本地构建检查 `/insights/` 和 `/insights/:slug/`。
6. 同步官网后，文章会进入独立 URL，并被 prerender 成适合抓取的静态页面。

### 飞书应用权限

飞书应用需要至少具备新版文档读取能力，并且应用需要被授权访问对应文档。

建议环境变量：

```bash
FEISHU_APP_ID=cli_xxx
FEISHU_APP_SECRET=xxx
```

飞书文档建议使用新版文档链接：

```text
https://xxx.feishu.cn/docx/xxxx
```

### 飞书文档格式

建议在飞书文档顶部保留这些字段，正文用 `##` 分段：

```text
slug: ai-search-visible-growth-assets
status: draft
category: GEO 洞察
title: 文章标题
summary: 文章摘要
description: 文章描述
seoTitle: SEO 标题
seoDescription: SEO 描述
readingTime: 5 min
metric: GEO
metricLabel: 可信内容资产
relatedFaqIds: what-is-jgmao-growth-engine, geo-vs-seo
---
## 第一节标题
第一节正文
- 要点一
- 要点二

## 第二节标题
第二节正文
```

### 从飞书文档生成草稿

```bash
FEISHU_APP_ID=cli_xxx FEISHU_APP_SECRET=xxx npm run insight:feishu -- "https://xxx.feishu.cn/docx/xxxx"
```

脚本会生成：

```text
tmp/insight-drafts/{slug}.json
```

### 校验并导入官网文章库

```bash
npm run insight:import -- tmp/insight-drafts/{slug}.json --check
npm run insight:import -- tmp/insight-drafts/{slug}.json
```

默认导入为 `draft` 状态，确认无误后再把 `status` 改成 `published`。

## 图文文章处理方式

第一版先读取飞书文档的纯文本内容，图片仍建议作为官网静态资源管理：

- 公开封面图、配图：放到 `public/insights/`。
- 文件命名：使用文章 slug 前缀，例如 `ai-search-visible-growth-assets-cover.jpg`。
- 正文图片：先在飞书文档里保留“图片说明 / 建议位置”，后续再扩展文章数据结构支持正文图片块和飞书图片下载。

这样做的好处是：

- 图片地址稳定，适合微信、搜索引擎和 AI 抓取。
- 不依赖飞书图片临时链接。
- 后续迁移到 CMS 时也能保持 URL 稳定。

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
