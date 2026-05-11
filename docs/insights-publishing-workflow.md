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

## 飞书群内审核确认发布

飞书群可以作为轻量文章发布后台。当前推荐采用两步确认，避免未审核内容直接上线。

如果飞书应用使用 HTTP 回调模式，事件回调地址为：

```text
https://www.jgmao.com/api/feishu/insight/events
```

如果飞书应用使用长连接模式，不需要填写公网回调地址，启动长连接监听进程即可：

```bash
FEISHU_APP_ID=cli_xxx \
FEISHU_APP_SECRET=xxx \
FEISHU_TARGET_CHAT_ID=oc_xxx \
npm run insight:feishu-ws
```

长连接进程会接收 `im.message.receive_v1` 群消息事件，并把发布指令转交给本地网关：

```text
http://127.0.0.1:18788/feishu/insight/events
```

### 1. 群里生成草稿

在飞书群发送：

```text
发布官网文章 https://xxx.feishu.cn/docx/xxxx
```

服务器会读取飞书文档，生成待确认任务，并回到飞书群：

```text
已生成官网文章草稿，等待群内确认发布
标题：xxx
摘要：xxx
Slug：xxx
章节：4
状态：待确认

确认发布：确认发布 xxx
取消发布：取消发布 xxx
```

### 2. 群里确认

在飞书群发送：

```text
确认发布 xxx
```

服务器会把任务状态改为 `approved`。随后在本地执行：

```bash
npm run insight:publish-approved -- xxx
```

这个命令会：

1. 从服务器读取已确认任务。
2. 把文章状态改为 `published`。
3. 导入 `src/content/insights.ts`。
4. 构建并同步官网。
5. 发布成功后回发飞书群文章链接。

取消发布：

```text
取消发布 xxx
```

查看队列：

```text
查看待发布文章
```

当前这样设计的原因是：公网飞书回调服务只负责接收指令和生成任务，不直接修改源码和构建官网，发布动作仍由本地受控脚本完成，更安全、更容易回滚。

## 图文文章处理方式

第一版先读取飞书文档的纯文本内容，图片/视频建议上传到阿里云 OSS，官网文章里使用稳定 HTTPS 地址：

- OSS 路径：`insights/{slug}/cover.jpg`、`insights/{slug}/image-01.jpg`、`insights/{slug}/video-01.mp4`。
- 线上地址：`https://aiops001.oss-cn-beijing.aliyuncs.com/insights/{slug}/cover.jpg`。
- 正文图片：先在飞书文档里保留“图片说明 / 建议位置”，后续扩展文章数据结构支持正文图片块和飞书图片下载。

这样做的好处是：

- 图片和视频不会撑大项目包。
- OSS 地址稳定，适合微信、搜索引擎和 AI 抓取；访问量起来后可再切换为 CDN 域名。
- 不依赖飞书图片临时链接。
- 后续迁移到 CMS 时也能保持 URL 稳定。

### 上传图片/视频到 OSS

建议环境变量：

```bash
ALIYUN_OSS_BUCKET=aiops001
ALIYUN_OSS_REGION=oss-cn-beijing
ALIYUN_OSS_ACCESS_KEY_ID=xxx
ALIYUN_OSS_ACCESS_KEY_SECRET=xxx
ALIYUN_OSS_PUBLIC_BASE_URL=https://aiops001.oss-cn-beijing.aliyuncs.com
```

可选：

```bash
ALIYUN_OSS_ENDPOINT=https://aiops001.oss-cn-beijing.aliyuncs.com
ALIYUN_OSS_ACL=public-read
```

上传命令：

```bash
npm run media:oss -- ./tmp/insight-media --prefix insights/{slug} --manifest tmp/insight-drafts/{slug}-media.json
```

测试上传计划，不实际发送文件：

```bash
npm run media:oss -- ./tmp/insight-media --prefix insights/{slug} --dry-run
```

支持的媒体格式：

- 图片：`jpg`、`jpeg`、`png`、`webp`、`gif`、`svg`、`avif`
- 视频：`mp4`、`webm`、`mov`、`m4v`

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
