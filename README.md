# 2025 Blog Public Docker

一个 Docker 自托管博客项目，支持本地文件存储、文章编辑、图片上传、首页配置和首次初始化管理员密码。

---

## 部署方式一：Docker Compose 部署

适合自己有服务器、能进入终端的用户。

### 国内推荐使用 Gitee

```bash
git clone https://gitee.com/duanxiaosheng/2025-blog-local-docker.git
cd 2025-blog-local-docker
docker compose up -d --build
```

### GitHub 地址

```bash
git clone https://github.com/duanxiaosheng/2025-blog-public-docker.git
cd 2025-blog-public-docker
docker compose up -d --build
```

默认访问：

```txt
http://服务器IP:3000
```

本地访问：

```txt
http://localhost:3000
```

---

## 部署方式二：宝塔「命令创建」部署

适合宝塔面板用户：

```txt
宝塔面板 → Docker → 容器 → 创建容器 → 命令创建
```

> 注意：这种方式需要一个已经构建好的 Docker 镜像。
> 当前如果还没有发布 Docker Hub / 阿里云 ACR 镜像，请优先使用上面的 Gitee + Docker Compose 部署方式。

有可用镜像后，可以粘贴类似下面的命令：

```bash
docker run -d \
  --name 2025-blog-public-docker \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e DATA_DIR=/app/data \
  -e SESSION_SECRET=change-this-session-secret \
  -v /www/wwwroot/2025-blog-public-docker-data:/app/data \
  你的镜像地址:latest
```

---

## 首次使用

第一次进入后台时，系统会提示你初始化管理员密码。

常用入口：

```txt
/write
```

初始化完成后即可：

- 写文章
- 上传封面
- 上传正文图片
- 修改首页配置

---

## 可选环境变量

项目可以不配置 `.env` 直接启动。

如果你想自定义端口或 Session 密钥，可以复制示例文件：

```bash
cp .env.example .env
```

常用配置：

```env
NODE_ENV=production
PORT=3000
SESSION_SECRET=change-this-session-secret-to-a-long-random-string
DATA_DIR=/app/data
```

> 正式长期使用时，建议修改 `SESSION_SECRET`。

---

## 数据保存在哪里

### Docker Compose 部署

运行数据默认保存在项目目录下：

```txt
./data
```

### 宝塔命令创建部署

如果使用上面的 `docker run` 命令，数据保存在：

```txt
/www/wwwroot/2025-blog-public-docker-data
```

里面包含：

- 文章
- 图片
- 首页配置
- 管理员初始化密码信息
- 点赞数据

只要数据目录还在，重建容器不会丢数据。

---

## 常见问题

### 1. 启动后打不开怎么办？

先看容器状态：

```bash
docker compose ps
```

或查看 Docker 容器日志。

常见原因：

- 端口被占用
- Docker 没启动
- build 失败
- 服务器安全组 / 防火墙没放行端口

---

### 2. 怎么修改访问端口？

### Docker Compose

创建 `.env`：

```bash
cp .env.example .env
```

修改：

```env
PORT=3001
```

然后重启：

```bash
docker compose down
docker compose up -d --build
```

### docker run

把：

```bash
-p 3000:3000
```

改成：

```bash
-p 3001:3000
```

---

### 3. 容器重建后文章会丢吗？

不会。

只要不删除数据目录，文章、图片和配置就还在。

---

### 4. 忘记管理员密码怎么办？

如果你是首次打开网站时自己设置的管理员密码，请按下面步骤处理：

必须：

1. 登录服务器，删掉此项目数据目录下的：

```txt
config/admin-auth.json
```

Docker Compose 默认位置通常是：

```txt
项目目录/data/config/admin-auth.json
```

宝塔命令创建默认位置通常是：

```txt
/www/wwwroot/2025-blog-public-docker-data/config/admin-auth.json
```

2. 重启 Docker。

3. 重新打开网站，即可再次进入“初始化管理员密码”流程。

---

### 5. 图片上传后不显示怎么办？

先检查：

1. 是否已经重新 build / 重启容器
2. 浏览器 Network 里图片是否 404
3. 图片文件是否存在于数据目录的：

```txt
public/blogs/<slug>/
```

---

### 6. 如何迁移到新服务器？

需要带走：

- 项目代码（如果使用 Compose）
- `.env`（如果你创建过）
- 数据目录

在新服务器重新启动容器即可。

---

### 7. 能多人一起用吗？

可以多人共用一个管理员密码。

当前版本不是完整多用户系统，没有：

- 多账号
- 角色权限
- 操作日志

更适合个人或少量可信成员使用。

---

## 更新项目

### Docker Compose

```bash
git pull
docker compose down
docker compose up -d --build
```

### 镜像部署

重新拉取最新镜像并重建容器即可。

---

## License

MIT
