# 2025-blog-public-adapt

这是把原版 `2025-blog-public` 改造成 **本地密码管理 + 本地文件存储 + Docker 部署** 的版本。

## 主要改动

- 去掉 GitHub App / `.pem` 私钥上传编辑流程
- 改为管理员密码登录
- 内容保存到本地 `data/` 目录
- 适合 Docker / 宝塔 Docker 部署
- 通过挂载 `data/` 实现备份和迁移

## 默认管理员密码

默认密码：

```txt
Sheng123..
```

强烈建议部署后立刻改成你自己的：

```bash
ADMIN_PASSWORD=你的新密码
SESSION_SECRET=一长串随机字符
```

## 本地运行

```bash
npm install --legacy-peer-deps
npm run build
npm run start
```

访问：

- 前台：`http://服务器IP:3000`
- 写作页：`http://服务器IP:3000/write`
- 博客管理：`http://服务器IP:3000/blog`

## Docker 运行

### 方式一：docker compose

```bash
docker compose up -d --build
```

默认端口：`3000`

### 方式二：纯 docker

```bash
docker build -t 2025-blog-local .
docker run -d \
  --name 2025-blog-local \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e ADMIN_PASSWORD='Sheng123..' \
  -e SESSION_SECRET='change-this-to-a-long-random-string' \
  -e DATA_DIR=/app/data \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  2025-blog-local
```

## 宝塔 Docker 部署

### 1. 上传项目

把整个项目上传到服务器，比如：

```txt
/www/wwwroot/2025-blog-public-adapt
```

### 2. 进入项目目录

```bash
cd /www/wwwroot/2025-blog-public-adapt
```

### 3. 在宝塔 Docker / Compose 里部署

直接使用项目内的 `docker-compose.yml`。

建议修改环境变量：

- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- 如需换端口，修改 `ports`

例如：

```yml
ports:
  - "8080:3000"
```

部署后访问：

```txt
http://你的服务器IP:8080
```

如果用了域名反代，把域名指向这个容器端口即可。

## 数据目录说明

所有可编辑内容保存在：

```txt
./data
```

主要包括：

- `data/public/blogs/`：博客内容、封面、文章资源
- `data/content/*.json`：about / projects / share / snippets / bloggers / pictures
- `data/config/*.json`：站点配置

首次启动时，会自动从原始项目内容种子初始化到 `data/`。

## 备份

最简单的备份方式就是备份整个 `data/` 目录：

```bash
tar -czf blog-data-backup.tar.gz data
```

## 迁移

迁移到另一台服务器时，只需要：

1. 部署同一份项目代码
2. 把旧服务器的 `data/` 目录拷过去
3. 用相同或新的 `ADMIN_PASSWORD` / `SESSION_SECRET` 启动

## 已验证

- 项目 `npm run build` 通过
- 本地文件读写 API 已接管博客与主要内容编辑
- 支持管理员密码登录

## 当前说明

这个版本优先保证：

- 保留原项目 UI / 交互结构
- 去掉 GitHub 私钥编辑依赖
- 改成本地可部署、可备份、可迁移

## 交付文件

项目里已经补好了：

- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `.env.example`
- `README.local.md`
- `BAOTA-DEPLOY.md`

## 宝塔部署

详细步骤见：

```txt
BAOTA-DEPLOY.md
```

## 注意

当前本地部署链路已经移除原项目的 GitHub App / `.pem` 前端编辑实现。内容写入只走服务端管理接口和本地 `data/` 目录。

如果你后面还想继续，我还可以再帮你补：

- 一键备份脚本
- 宝塔反向代理配置示例
- HTTPS / 域名部署说明
- 管理后台入口优化
