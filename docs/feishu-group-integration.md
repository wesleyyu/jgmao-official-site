# 飞书群连通方法

这份说明对应当前 `jgmao-official-site` 项目里，`/geo-score/` 页面提交后如何自动把线索推送到飞书群。

适用场景：

- 官网 `Geo Score` 评分线索
- H5 留资线索
- 其他通过 `/api/lead/submit` 进入的表单型线索

本文只讲**当前项目已经在用的接法**，不写死任何真实密钥。

---

## 一、整体链路

当前链路是：

1. 用户在前端页面填写表单
2. 前端调用后端接口 `POST /api/lead/submit`
3. 后端整理线索内容
4. 后端通过飞书应用 API 或 webhook 把消息发到飞书群

对应当前 `geo-score` 页的链路可以概括成：

`GeoScore.tsx -> /api/lead/submit -> public-chat-gateway.py -> 飞书群`

---

## 二、前端是怎么提交的

当前 `geo-score` 页的前端文件：

- `/Users/wesleyyu/Documents/New project/jgmao-official-site/src/pages/GeoScore.tsx`

关键入口在：

- `/Users/wesleyyu/Documents/New project/jgmao-official-site/src/pages/GeoScore.tsx:244`

提交时，前端会向：

- `POST /api/lead/submit`

发送 JSON：

```json
{
  "type": "geo-score",
  "websiteUrl": "https://example.com",
  "contact": "138xxxxxx",
  "company": "某某公司",
  "name": "张三",
  "source": "geo-score-h5",
  "page": "/geo-score/"
}
```

也就是说，前端本身**不直接连接飞书**，它只负责把数据交给后端。

---

## 三、后端入口在哪里

当前正式站后端文件：

- `/Users/wesleyyu/Documents/New project/jgmao-official-site/scripts/public-chat-gateway.py`

表单总入口在：

- `/Users/wesleyyu/Documents/New project/jgmao-official-site/scripts/public-chat-gateway.py:919`

其中 `geo-score` 的处理分支在：

- `/Users/wesleyyu/Documents/New project/jgmao-official-site/scripts/public-chat-gateway.py:944`

当前逻辑是：

1. 检查 `websiteUrl` 和 `contact`
2. 调 `score_website(website_url)` 生成评分
3. 调 `save_geo_report(entry)` 生成/更新详细报告
4. 调 `_append_lead_log(entry)` 记线索日志
5. 调 `_push_lead_to_feishu(...)` 推送飞书群

对应关键代码：

```py
result = score_website(website_url)
report = save_geo_report(entry)
self._append_lead_log(entry)
self._push_lead_to_feishu({...})
```

---

## 四、飞书群是怎么发出去的

飞书消息真正发送逻辑在：

- `/Users/wesleyyu/Documents/New project/jgmao-official-site/scripts/public-chat-gateway.py:1233`

核心函数：

- `_push_lead_to_feishu(...)`
- `_fetch_feishu_tenant_access_token()`
- `_send_feishu_app_message(...)`

### 1. 先判断走哪种发送方式

当前项目支持两种方式：

1. `FEISHU_WEBHOOK_URL`
2. `FEISHU_APP_ID + FEISHU_APP_SECRET`

优先级是：

- 如果配置了 `FEISHU_WEBHOOK_URL`，先走 webhook
- 否则如果配置了 `FEISHU_APP_ID + FEISHU_APP_SECRET`，走飞书应用 API

关键位置：

- `/Users/wesleyyu/Documents/New project/jgmao-official-site/scripts/public-chat-gateway.py:1180`

### 2. 当前项目实际更稳定的是飞书应用 API

飞书应用方式会先获取：

- `tenant_access_token`

接口地址：

- `https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal`

关键代码位置：

- `/Users/wesleyyu/Documents/New project/jgmao-official-site/scripts/public-chat-gateway.py:1200`

### 3. 再发送到飞书群

发送消息接口：

- `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id`

关键代码位置：

- `/Users/wesleyyu/Documents/New project/jgmao-official-site/scripts/public-chat-gateway.py:1233`

当配置了：

- `FEISHU_TARGET_CHAT_ID`

时，系统会把消息发到对应飞书群。

---

## 五、当前需要的关键环境变量

当前项目飞书群连通至少需要下面这些环境变量：

```bash
FEISHU_APP_ID=你的飞书应用 App ID
FEISHU_APP_SECRET=你的飞书应用 App Secret
FEISHU_TARGET_CHAT_ID=目标飞书群的 chat_id
PUBLIC_SITE_URL=https://www.jgmao.com
```

可选：

```bash
FEISHU_WEBHOOK_URL=如果你想走 webhook
FEISHU_TARGET_USER_OPEN_ID=如果你想发给个人而不是群
```

当前正式群发逻辑优先建议使用：

- `FEISHU_APP_ID`
- `FEISHU_APP_SECRET`
- `FEISHU_TARGET_CHAT_ID`

---

## 六、当前项目里飞书群消息包含什么

以 `geo-score` 为例，当前飞书群消息会带：

- 姓名 / 称呼
- 公司 / 品牌
- 官网网址
- 联系方式
- 需求简述
- 基础评分
- 报告链接
- 来源页面
- 提交时间

并且已经支持区分：

- 新官网首次评分
- 同一官网已更新报告
- 同一官网 24 小时内结果无变化

---

## 七、如何自己复查这条链路

### 1. 看前端有没有发请求

看文件：

- `/Users/wesleyyu/Documents/New project/jgmao-official-site/src/pages/GeoScore.tsx`

关注：

- `handleSubmit()`

### 2. 看后端有没有接到

看文件：

- `/Users/wesleyyu/Documents/New project/jgmao-official-site/scripts/public-chat-gateway.py`

关注：

- `_handle_lead_submit()`
- `lead_type == "geo-score"`

### 3. 看飞书有没有发出去

看文件：

- `/Users/wesleyyu/Documents/New project/jgmao-official-site/scripts/public-chat-gateway.py`

关注：

- `_push_lead_to_feishu(...)`
- `_send_feishu_app_message(...)`

### 4. 看接收目标是不是群

确认环境变量：

- `FEISHU_TARGET_CHAT_ID`

如果配置的是这个，项目就会按群发送，而不是发给个人。

---

## 八、当前项目推荐的连通方式

如果你要继续复用现在这套方案，推荐直接沿用：

1. 前端统一提交到 `/api/lead/submit`
2. 后端统一在 `public-chat-gateway.py` 里处理
3. 飞书统一通过：
   - `FEISHU_APP_ID`
   - `FEISHU_APP_SECRET`
   - `FEISHU_TARGET_CHAT_ID`
4. 所有官网表单线索统一进同一个飞书群

这样最稳，也最方便后续继续扩展：

- 新 H5 表单
- 评分器线索
- 官网咨询线索
- 后续会员线索

---

## 九、相关文件索引

前端：

- `/Users/wesleyyu/Documents/New project/jgmao-official-site/src/pages/GeoScore.tsx`

正式站后端：

- `/Users/wesleyyu/Documents/New project/jgmao-official-site/scripts/public-chat-gateway.py`

本地预览后端：

- `/Users/wesleyyu/Documents/New project/jgmao-official-site/scripts/local-preview-server.mjs`

如果只想快速看最关键的 3 段：

1. `GeoScore.tsx` 里的 `handleSubmit()`
2. `public-chat-gateway.py` 里的 `_handle_lead_submit()`
3. `public-chat-gateway.py` 里的 `_send_feishu_app_message()`
