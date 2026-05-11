# 2025 Blog Public Docker

一个 Docker 自托管博客项目，支持本地文件存储、文章编辑、图片上传、首页配置和首次初始化管理员密码。

---

## 一键 Docker 部署

### 1. 克隆项目

```bash
git clone https://gitee.com/duanxiaosheng/2025-blog-public-docker.git
cd 2025-blog-public-docker
```

### 2. 启动

```bash
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

运行数据保存在项目目录下：

```txt
./data
```

里面包含：

- 文章
- 图片
- 首页配置
- 管理员初始化密码信息
- 点赞数据

Docker 映射：

```yaml
./data:/app/data
```

只要 `data` 目录还在，重建容器不会丢数据。

---

## 常见问题

### 1. 启动后打不开怎么办？

先看容器状态：

```bash
docker compose ps
```

再看日志：

```bash
docker compose logs --tail=200
```

常见原因：

- 端口被占用
- Docker 没启动
- build 失败
- 服务器安全组 / 防火墙没放行端口

---

### 2. 怎么修改访问端口？

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

访问：

```txt
http://服务器IP:3001
```

---

### 3. 容器重建后文章会丢吗？

不会。

文章、图片和配置都保存在：

```txt
./data
```

只要不删除 `data` 目录，数据就还在。

---

### 4. 忘记管理员密码怎么办？

如果你是首次打开网站时自己设置的管理员密码，请按下面步骤处理：

必须：

1. 登录服务器，删掉此项目目录下的：

```txt
data/config/admin-auth.json
```

2. 重启 Docker：

```bash
docker compose down
docker compose up -d
```

3. 重新打开网站，即可再次进入“初始化管理员密码”流程。

---

### 5. 图片上传后不显示怎么办？

先检查：

1. 是否已经重新 build
2. 浏览器 Network 里图片是否 404
3. 图片文件是否存在于：

```txt
data/public/blogs/<slug>/
```

如果刚更新过代码，先执行：

```bash
docker compose down
docker compose up -d --build
```

---

### 6. 如何迁移到新服务器？

需要带走：

- 项目代码
- `.env`（如果你创建过）
- `data/`

在新服务器执行：

```bash
docker compose up -d --build
```

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

```bash
git pull
docker compose down
docker compose up -d --build
```

---

## License

MIT
