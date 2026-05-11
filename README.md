# 2025 Blog Public Adapt

一个适合自托管的博客项目：

- Docker 部署
- 本地文件存储
- 管理员密码登录
- 文章、封面、正文图片都落盘到本地数据目录
- 不依赖 GitHub App / Private Key / 仓库写入

> 当前定位：**个人 / 小团队自托管博客后台**

---

## 特性

- 首页可视化配置
- 博客文章写作、预览、发布
- 封面图、正文图片本地上传
- 点赞本地持久化
- Docker volume 持久化数据
- 管理员密码登录（HttpOnly session）

---

## 适合谁

适合这些场景：

- 想要一个**自己服务器上可控**的博客
- 不想折腾 GitHub App / PEM / Private Key
- 希望文章和图片直接存在本地目录
- 想用 Docker 一把跑起来

不太适合这些场景：

- 多账号、多角色、复杂协作后台
- 企业级 CMS / 审核流 / 权限系统

当前版本更适合：**个人使用 / 少量可信成员共用**。

---

## 技术路线

和原始的 GitHub 仓库驱动版不同，这个版本已经改成：

- **服务端密码校验**
- **HttpOnly Session Cookie**
- **本地文件系统存储**
- **Docker volume 持久化**

也就是说：

- 文章正文不再写 GitHub 仓库
- 图片不再依赖 GitHub 提交
- 不需要前端暴露 GitHub 凭据

---

## 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd 2025-blog-public-adapt
```

### 2. 准备环境变量

复制示例文件：

```bash
cp .env.example .env
```

然后修改 `.env`，至少改这两个：

```env
ADMIN_PASSWORD=请改成你自己的强密码
SESSION_SECRET=请改成一段足够长的随机字符串
```

---

## Docker 部署

直接启动：

```bash
docker compose up -d --build
```

默认访问地址：

```txt
http://localhost:3000
```

如果是服务器部署，把 `localhost` 换成你的服务器 IP 或域名。

---

## 环境变量说明

见 `.env.example`。

常用项：

| 变量名 | 说明 |
|---|---|
| `NODE_ENV` | 运行环境，生产环境建议 `production` |
| `PORT` | 服务端口，默认 `3000` |
| `ADMIN_PASSWORD` | 管理后台密码 |
| `SESSION_SECRET` | Session 签名密钥，必须改成你自己的随机串 |
| `DATA_DIR` | 数据目录，Docker 中默认 `/app/data` |

---

## 数据目录说明

项目运行后的数据默认保存在：

```txt
./data
```

Docker 映射关系：

```txt
宿主机 ./data  ->  容器内 /app/data
```

主要内容包括：

```txt
data/
  config/
    site-content.json
    card-styles.json
  content/
    likes.json
  public/
    blogs/
      <slug>/
        index.md
        config.json
        cover / 正文图片...
    images/
      avatar.png
      art/
      background/
      social-buttons/
```

### 重要提醒

- **删容器不会丢数据**，只要 `./data` 还在
- **删掉 `./data` 会丢文章和图片**
- 迁移服务器时，记得一起迁移 `data` 目录

---

## 管理后台怎么进

### 写文章

进入：

```txt
/write
```

### 编辑已有文章

文章页右上角有编辑入口，或者直接访问：

```txt
/write/<slug>
```

### 首页配置

首页有配置入口，可修改：

- 背景图
- 首页卡片内容
- 社交按钮
- 头像 / 装饰图
- 备案信息
- 文章相关展示

---

## 使用建议

### 上传正文图片

推荐流程：

1. 在写作页右侧图片管理里上传图片
2. 拖拽到正文编辑区
3. 预览确认
4. 再发布

### 上传封面

直接在封面区域上传或拖入。

---

## 反向代理与 HTTPS

正式给别人访问时，建议套一层反向代理：

- Nginx
- Caddy
- 宝塔反代
- 其他支持 HTTPS 的代理

建议最终提供：

```txt
https://your-domain.com
```

而不是直接裸露 `:3000` 端口给公网长期使用。

---

## 升级方式

拉取新代码后执行：

```bash
git pull
docker compose down
docker compose up -d --build
```

数据仍然会保留在 `./data` 目录。

---

## 已知限制

当前版本是：

- **单管理员密码模式**
- 不是多用户后台
- 没有角色权限系统
- 没有操作审计日志

所以更适合：

- 个人博客
- 小范围可信成员共用

如果你需要多人后台，后续应该再补：

- 用户系统
- 角色权限
- 操作记录
- 更细粒度登录管理

---

## 常见问题

### 1. 容器重建后数据会丢吗？

不会，只要 `./data` 目录还在。

### 2. 图片存在哪里？

本地 `data/public/blogs/<slug>/` 和 `data/public/images/`。

### 3. 为什么不再用 GitHub App？

因为这个版本已经改成**本地文件存储 + 服务端密码登录**，目标是长期可维护的自托管后台，不再依赖前端持有 GitHub 凭据。

---

## 推荐发布方式

如果你想让别人直接用，建议按下面方式提供：

1. Git 仓库
2. `.env.example`
3. `docker-compose.yml`
4. 这份 README
5. 一个可访问演示站（可选）

这样别人通常只要：

```bash
git clone <repo>
cd 2025-blog-public-adapt
cp .env.example .env
docker compose up -d --build
```

就能跑起来。

---

## 常见问题

### 1. 启动后打不开网站怎么办？

先检查容器状态：

```bash
docker compose ps
```

再看日志：

```bash
docker compose logs --tail=200
```

常见原因：

- `PORT` 被占用
- `.env` 没配好
- 镜像没成功 build
- 容器启动后立即退出

### 2. 修改了 `.env` 为什么没生效？

环境变量改完后需要重建：

```bash
docker compose down
docker compose up -d --build
```

只 `restart` 往往不够。

### 3. 容器重建后文章会丢吗？

不会，只要 `./data` 目录还在。

这个项目用的是：

```yaml
./data:/app/data
```

所以文章、图片、配置都保存在宿主机 `data` 目录。

### 4. 图片上传后不显示怎么办？

先优先检查这几件事：

1. 图片文件是否真的落在：

```txt
data/public/blogs/<slug>/
```

2. 文章正文 `index.md` 里图片路径是否正确

3. 浏览器 Network 里图片请求是不是 404

4. 当前版本是否已经重新 build

如果刚改过代码，先执行：

```bash
docker compose down
docker compose up -d --build
```

### 5. 首页图片 / 封面 / 背景图不显示怎么办？

先看是不是路径问题。

本项目现在区分两类路径：

#### 存储路径

```txt
/blogs/<slug>/<file>
/images/...
```

#### 运行时访问路径

```txt
/api/blogs/<slug>/<file>
/api/images/...
```

如果页面里出现了这种异常路径：

```txt
/api/api/...
```

通常说明路径被重复转换了，需要重新 build 并检查最新代码。

### 6. 管理员密码忘了怎么办？

直接改 `.env`：

```env
ADMIN_PASSWORD=your-new-password
```

然后重建容器：

```bash
docker compose down
docker compose up -d --build
```

### 7. Session / 登录总失效怎么办？

先确认：

- `SESSION_SECRET` 已设置
- 不是默认占位值
- 改过后已经重建容器

建议 `SESSION_SECRET` 使用足够长的随机字符串。

### 8. 手机访问背景一直闪怎么办？

移动端通常是背景动画层重绘导致的。当前建议方案是：

- 手机端关闭模糊气泡背景
- 只保留静态背景图

如果你改过背景相关代码但没生效，记得重新 build。

### 9. 端口冲突怎么办？

如果 `3000` 被占用，可以改 `.env`：

```env
PORT=3001
```

然后重新启动：

```bash
docker compose down
docker compose up -d --build
```

之后访问：

```txt
http://服务器IP:3001
```

### 10. 如何迁移到新服务器？

至少带走这些东西：

- 项目代码
- `.env`
- `data/`

到新服务器后执行：

```bash
docker compose up -d --build
```

只迁代码、不迁 `data`，文章和图片会丢。

### 11. 为什么这版不再使用 GitHub App？

因为这个改造版已经改成：

- 本地文件存储
- 服务端管理员密码登录
- Docker 自托管

目标是更适合长期稳定自托管，而不是继续依赖 GitHub 私钥写仓库。

### 12. 多人能一起用吗？

可以“共用一个管理员密码”，但这不是完整多用户系统。

当前没有：

- 多账号
- 角色权限
- 审计日志

所以更适合：

- 个人使用
- 少量可信成员共用

---

## License

如果你准备公开发布，建议补一个明确的许可证文件（如 MIT / Apache-2.0 / GPL）。
目前若未提供 LICENSE，请默认按你的仓库说明为准。
