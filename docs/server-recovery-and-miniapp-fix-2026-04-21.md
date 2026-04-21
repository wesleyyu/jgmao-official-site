# 服务器恢复与小程序权限修复说明

## 概要

本次处理覆盖了两类工作：

- 恢复旧项目在 `8.130.11.205` 上的关键服务
- 将坚果猫官网独立部署到 `8080`
- 修复微信小程序打开应用时提示“没有权限查看此应用”的问题

本次修复遵循两个原则：

- 不影响旧项目原有域名和依赖服务
- 不影响新的坚果猫官网 `8080` 站点

---

## 服务器信息

- 服务器 IP：`8.130.11.205`
- 新官网端口：`8080`
- SSH 密钥：`/Users/wesleyyu/Downloads/Y-001.pem`

---

## 1. 新站点部署情况

坚果猫官网已独立部署到：

- `http://8.130.11.205:8080`

部署目录：

- `/opt/jgmao-official-site-8080/dist`

nginx 配置：

- `/etc/nginx/conf.d/jgmao-8080.conf`

说明：

- 此站点只监听 `8080`
- 与旧项目域名链路分离
- 不依赖旧项目运行时

---

## 2. 旧项目恢复情况

重启后，旧项目的主要问题是 Docker 依赖服务未恢复，导致：

- `www.jgmao.com`
- `open.jgmao.com`
- `api.jgmao.com`

对应链路不可用。

已恢复的关键服务：

- `one-api` on `4000`
- `bitgene-fastgpt` on `4001`
- `mongo` on `27017`
- `pg` on `5432`
- `kibana` on `5601`

当前 Docker 状态已正常，且 `docker.service` 已启用开机自启。

旧项目 Docker compose 文件：

- `/var/www/gpt/fastgpt/docker-compose.yml`

---

## 3. 小程序权限问题的根因

### 现象

微信小程序打开后提示：

- “没有权限查看此应用”

### 排查结果

小程序实际访问链路为：

- `open.jgmao.com/api/core/app/list`
- `open.jgmao.com/api/core/app/shareDetail?appId=65fa3eb56121b516aad12539`

其中目标应用为：

- 应用名：`坚果猫AI`
- App ID：`65fa3eb56121b516aad12539`

数据库确认结果：

- 该应用权限不是 `public`
- 而是 `share`

也就是说：

- 普通未授权请求访问 `app/list` 时，FastGPT 默认会返回未授权
- 小程序重启后没有恢复原有兼容逻辑
- 因此列表接口拿不到该分享应用，最终前端显示“没有权限查看此应用”

### 额外确认

这次问题不是由 `wework-jgmao` 引起的。

`wework-jgmao` 仍是旧企业微信回调链路遗留问题，但不影响本次小程序应用打开。

---

## 4. 本次采用的修复方式

为了避免修改 `bitgene-fastgpt` 容器内部构建产物，本次采用了 **nginx 精确兼容补丁**。

修复位置：

- `/etc/nginx/conf.d/open.jgmao.com.conf`

修复逻辑：

- 只拦截 `GET /api/core/app/list`
- 只在请求来源为微信客户端 UA `MicroMessenger` 时生效
- 直接返回 `坚果猫AI` 这一个 `share` 应用的列表数据
- 其它浏览器/普通请求仍然走原有 `4001` 鉴权逻辑

这样做的好处：

- 不改 FastGPT 容器镜像
- 不影响管理后台和浏览器正常鉴权
- 兼容逻辑集中在 nginx，后续更容易追踪和回滚

---

## 5. 当前生效的关键配置

### 新官网 `8080`

- `/etc/nginx/conf.d/jgmao-8080.conf`

### 小程序兼容补丁

- `/etc/nginx/conf.d/open.jgmao.com.conf`

### 旧项目 Docker 编排

- `/var/www/gpt/fastgpt/docker-compose.yml`

---

## 6. 已做的配置备份

### 服务器本机备份

目录：

- `/root/ops-backups/2026-04-21-jgmao`

内容：

- `open.jgmao.com.conf`
- `jgmao-8080.conf`
- `fastgpt-docker-compose.yml`

### 仓库内备份

目录：

- `/Users/wesleyyu/Documents/New project/jgmao-official-site/deploy/server-backups`

内容：

- [open.jgmao.com.conf](/Users/wesleyyu/Documents/New%20project/jgmao-official-site/deploy/server-backups/open.jgmao.com.conf)
- [jgmao-8080.conf](/Users/wesleyyu/Documents/New%20project/jgmao-official-site/deploy/server-backups/jgmao-8080.conf)
- [fastgpt-docker-compose.yml](/Users/wesleyyu/Documents/New%20project/jgmao-official-site/deploy/server-backups/fastgpt-docker-compose.yml)

---

## 7. 当前服务状态

当前确认正常：

- `http://8.130.11.205:8080`
- `https://www.jgmao.com`
- `https://open.jgmao.com`
- `https://api.jgmao.com`
- 微信小程序打开 `坚果猫AI` 正常

仍存在的旧遗留问题：

- `supervisor` 中 `wework-jgmao` 为 `FATAL`
- 原因是启动文件 `/var/www/wework/wework-jgmao` 缺失
- 当前不影响主站、小程序和新官网 `8080`

---

## 8. 后续重启后的检查建议

服务器如果再次重启，优先检查这几项：

1. Docker 是否正常启动
   - `systemctl status docker`
   - `docker ps`

2. 旧项目核心容器是否起来
   - `one-api`
   - `bitgene-fastgpt`
   - `mongo`
   - `pg`

3. nginx 配置是否仍在
   - `/etc/nginx/conf.d/open.jgmao.com.conf`
   - `/etc/nginx/conf.d/jgmao-8080.conf`

4. 小程序兼容规则是否仍保留
   - 查看 `open.jgmao.com.conf` 中是否仍存在：
     - `location = /api/core/app/list`
     - `MicroMessenger`

5. 快速验证接口
   - 旧项目：
     - `curl -I https://open.jgmao.com`
   - 新官网：
     - `curl -I http://127.0.0.1:8080`

---

## 9. 结论

本次已经完成：

- 旧项目主服务恢复
- 坚果猫官网独立部署到 `8080`
- 微信小程序“没有权限查看此应用”问题修复
- 关键配置完成双份备份

当前服务器已处于可持续维护状态，后续如果再次重启，优先按本文第 8 节检查即可。
