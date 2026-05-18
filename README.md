# 2025 Blog Local Docker

这是一个适合个人自托管的博客项目。

它基于原项目 [`YYsuni/2025-blog-public`](https://github.com/YYsuni/2025-blog-public) 二次改造，保留了漂亮的卡片式首页、文章阅读页、写作页和可视化配置能力，同时把原来依赖 GitHub App / `.pem` 私钥的编辑方式，改成了更适合普通服务器部署的：

> **Docker 部署 + 本地文件保存 + 管理员密码登录。**

简单说：你不需要懂 GitHub App，不需要上传私钥，也不需要把文章交给第三方服务。把容器跑起来，第一次进入后台设置管理员密码，就可以在网页里写文章、传图片、改首页内容。

---

## 这个项目能做什么？

- 写博客、编辑博客、删除博客
- 上传封面图和文章图片
- 在写作页一键把图片“填入”文章正文
- 编辑首页内容、头像、背景、导航、社交链接等站点信息
- 管理项目、应用导航、推荐分享、优秀博客、图片、代码片段等内容页
- 本地保存所有运行数据，方便备份和迁移
- 用 Docker 一键部署到服务器、宝塔、1Panel 等环境

---

## 项目特点

### 1. 不再依赖 GitHub 私钥

原项目的编辑方式需要 GitHub App private key / `.pem`。这个版本已经改为服务端管理员密码登录。

首次使用时，在页面里初始化管理员密码即可。

### 2. 数据都在 `data/` 目录

博客文章、图片、首页配置、点赞数据、管理员初始化信息等运行数据都保存在 `data/`。

所以备份和迁移很简单：

> **备份整个 `data/` 目录即可。**

### 3. Docker 友好

项目内置：

- `Dockerfile`
- `docker-compose.yml`
- `docker-compose.release.yml`
- `.env.example`

可以直接本地 build，也可以拉 Docker Hub 镜像运行。

### 4. 适合小白和 AI 继续维护

项目里有一份给后续 AI / 智能体看的维护文档：

```txt
给下一个智能体也可以编辑此仓库.md
```

如果你以后想继续改功能，可以把仓库和这份文档一起发给 AI，让它先读文档再动手。

---

## 最快部署方式：Docker Hub 一键运行

适合宝塔、1Panel、普通 Linux 服务器。

```bash
mkdir -p /www/wwwroot/2025-blog-local-docker/data && docker run -d \
  --name 2025-blog-local-docker \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATA_DIR=/app/data \
  -v /www/wwwroot/2025-blog-local-docker/data:/app/data \
  --restart unless-stopped \
  duanxiaosheng/2025-blog-local-docker:latest
```

启动后访问：

```txt
http://服务器IP:3000
```

第一次进入后台、写作页或需要管理权限的地方时，会提示你初始化管理员密码。

---

## Docker Compose 部署

### 方式一：源码 build

适合你要自己改代码。

```bash
git clone https://gitee.com/duanxiaosheng/2025-blog-local-docker.git
cd 2025-blog-local-docker
docker compose up -d --build
```

GitHub 仓库：

```bash
git clone https://github.com/duanxiaosheng/2025-blog-public-docker.git
cd 2025-blog-public-docker
docker compose up -d --build
```

### 方式二：Compose 拉取发布镜像

```bash
cp .env.example .env
mkdir -p data
docker compose -f docker-compose.release.yml up -d
```

---

## 常用访问入口

| 页面 | 地址 |
| --- | --- |
| 首页 | `http://服务器IP:3000/` |
| 文章列表 | `http://服务器IP:3000/blog` |
| 写文章 | `http://服务器IP:3000/write` |
| 应用导航 | `http://服务器IP:3000/apps` |
| 我的项目 | `http://服务器IP:3000/projects` |
| 推荐分享 | `http://服务器IP:3000/share` |
| 优秀博客 | `http://服务器IP:3000/bloggers` |
| 关于网站 | `http://服务器IP:3000/about` |

如果用了域名反代，把 `服务器IP:3000` 换成你的域名即可。

---

## 首次使用说明

### 1. 初始化管理员密码

默认不需要提前配置密码。

第一次访问需要管理权限的页面时，系统会提示你设置管理员密码。设置完成后，就可以登录后台进行修改。

### 2. 如果想用环境变量固定密码

可以在运行容器时传：

```bash
-e ADMIN_PASSWORD='你的管理员密码'
-e SESSION_SECRET='一串足够长的随机字符串'
```

说明：

- 设置 `ADMIN_PASSWORD` 后，会跳过页面初始化流程
- `SESSION_SECRET` 用于签名登录会话
- 如果不设置 `SESSION_SECRET`，程序会自动生成并保存到 `data/config/admin-auth.json`

### 3. 忘记密码怎么办？

分两种情况：

- 如果你用的是 `ADMIN_PASSWORD` 环境变量：改环境变量后重启容器
- 如果你用的是页面初始化密码：删除 `data/config/admin-auth.json` 后重启容器，再重新初始化

---

## 数据目录说明

默认数据目录：

```txt
data/
```

常见内容：

```txt
data/config/          站点配置、管理员登录配置
data/content/         首页与各内容页数据
data/public/blogs/    博客文章、封面、文章图片
data/public/images/   公共上传图片
data/likes/           点赞数据
```

如果你用上面的一键 Docker 命令部署，宿主机数据目录是：

```txt
/www/wwwroot/2025-blog-local-docker/data
```

---

## 备份与迁移

### 备份

```bash
cd /www/wwwroot/2025-blog-local-docker
tar -czf blog-data-backup.tar.gz data
```

### 迁移

1. 在新服务器部署同一个镜像或同一份源码
2. 把旧服务器的 `data/` 目录复制过去
3. 启动容器
4. 访问网站确认内容正常

一句话：

> **代码可以重新拉，镜像可以重新构建，但 `data/` 一定要保管好。**

---

## 更新到最新版本

如果你是 Docker Hub 镜像部署：

```bash
docker pull duanxiaosheng/2025-blog-local-docker:latest && docker rm -f 2025-blog-local-docker && docker run -d \
  --name 2025-blog-local-docker \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATA_DIR=/app/data \
  -v /www/wwwroot/2025-blog-local-docker/data:/app/data \
  --restart unless-stopped \
  duanxiaosheng/2025-blog-local-docker:latest
```

只要继续挂载同一个 `data/` 目录，文章、图片、配置和登录信息都会保留。

---

## 开发者运行方式

本项目使用 pnpm：

```bash
pnpm install
pnpm dev
```

开发地址：

```txt
http://localhost:2025
```

构建：

```bash
pnpm build
```

生产启动：

```bash
pnpm start
```

数据健康检查：

```bash
pnpm check:data
```

> 注意：项目声明的包管理器是 `pnpm@10.15.0`。Dockerfile 也已经使用 pnpm 安装依赖。

---

## 重要文件说明

| 文件/目录 | 作用 |
| --- | --- |
| `src/app/write/` | 写文章、编辑文章页面 |
| `src/app/blog/` | 文章列表和文章详情页 |
| `src/components/nav-card.tsx` | 首页/全站导航卡片 |
| `src/app/(home)/config-dialog/` | 首页和站点配置弹窗 |
| `src/lib/local-admin/` | 本地管理员、文件存储、图片路径等核心逻辑 |
| `src/app/api/admin/` | 后台管理接口 |
| `data/` | 运行时数据，部署后最重要的目录 |
| `给下一个智能体也可以编辑此仓库.md` | 给后续 AI/维护者的详细接手说明 |

---

## 常见问题

### 1. 页面打不开？

先检查：

- Docker 容器是否正在运行
- 服务器安全组/防火墙是否放行 3000 端口
- 宝塔/1Panel 是否也放行了端口
- 是否使用了正确 IP 或域名

### 2. 修改代码后没变化？

如果你是 Docker 部署，改完代码后需要重新构建并重启：

```bash
docker compose up -d --build
```

### 3. 图片换浏览器看不到？

大概率是图片路径保存错了，或者临时 `blob:` 地址被保存进数据。可以运行：

```bash
pnpm check:data
```

### 4. 管理员登录异常？

检查：

```txt
data/config/admin-auth.json
```

如果忘记初始化密码，可以删除这个文件后重启容器再重新初始化。

---

## 给想继续二改的人

这个项目已经经过较多 AI 辅助改造。继续修改前，建议先读：

```txt
给下一个智能体也可以编辑此仓库.md
```

里面记录了项目方向、数据路径、图片路径规则、管理员登录逻辑、容易踩的坑、近期改动和推荐修改流程。

如果你用 AI 继续维护，可以直接告诉它：

> 先阅读 README.md 和《给下一个智能体也可以编辑此仓库.md》，再修改项目。

---

## Docker Hub 镜像

```txt
duanxiaosheng/2025-blog-local-docker:latest
```

---

## 原项目致谢

原项目：

```txt
https://github.com/YYsuni/2025-blog-public
```

感谢原作者提供漂亮的博客设计和基础代码。本仓库是在此基础上的自托管、本地化、Docker 化改造版本。

---

## License

MIT
