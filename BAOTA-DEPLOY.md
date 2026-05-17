# 宝塔 Docker 部署说明

这份文档分两种方式：

- **方式 A：直接拉 Docker Hub 镜像一键部署（推荐）**
- **方式 B：上传源码后用 compose 本地 build**

如果你只是想在宝塔里尽快跑起来，优先用方式 A，少折腾。

---

## 一、方式 A：Docker Hub 一键部署（推荐）

### 1. 先准备数据目录

```bash
mkdir -p /www/wwwroot/2025-blog-local-docker/data
```

### 2. 一条命令启动

```bash
docker run -d \
  --name 2025-blog-local-docker \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATA_DIR=/app/data \
  -v /www/wwwroot/2025-blog-local-docker/data:/app/data \
  --restart unless-stopped \
  duanxiaosheng/2025-blog-local-docker:latest
```

### 3. 访问地址

```txt
http://服务器IP:3000
```

### 4. 默认行为说明

默认情况下：

- **不设置 `ADMIN_PASSWORD`**，首次访问后台/编辑页时走初始化密码流程
- **不设置 `SESSION_SECRET`**，程序会自动生成一个随机值并保存到 `data/config/admin-auth.json`

如果你确实想预置固定密码/固定 session secret，也可以自己额外加：

```bash
-e ADMIN_PASSWORD='你自己的后台密码'
-e SESSION_SECRET='一串足够长的随机字符串'
```

---

## 二、方式 B：宝塔 Compose 拉镜像部署

仓库里新增了发布版编排文件：

```txt
docker-compose.release.yml
```

它不是本地 build，而是直接拉 Docker Hub 镜像。

### 用法

```bash
cd /www/wwwroot/2025-blog-local-docker
cp .env.example .env
mkdir -p data
docker compose -f docker-compose.release.yml up -d
```

### `.env` 里默认这样就够了

```env
PORT=3000
DATA_DIR=/app/data
IMAGE_NAME=duanxiaosheng/2025-blog-local-docker:latest
```

如果你想跳过初始化页面，才额外添加：

```env
ADMIN_PASSWORD=你自己的后台密码
SESSION_SECRET=你自己的随机字符串
```

### 宝塔面板里怎么用

1. 打开宝塔面板
2. 进入 **Docker**
3. 进入 **Compose**
4. 新建编排项目
5. 选择 `docker-compose.release.yml`
6. 配好 `.env` 后点击部署

---

## 三、方式 C：上传源码后本地 build

适合你自己要改代码。

项目目录建议：

```txt
/www/wwwroot/2025-blog-public-adapt
```

### 1. 上传项目

把整个项目上传到服务器。

确保目录内至少有这些文件：

- `Dockerfile`
- `docker-compose.yml`
- `.env.example`
- `data/`（首次可以没有，程序会自动初始化）

### 2. 修改环境变量

默认情况下你不需要设置 `ADMIN_PASSWORD` 和 `SESSION_SECRET`：

- `ADMIN_PASSWORD` 不设置：首次访问后台/编辑页时初始化密码
- `SESSION_SECRET` 不设置：程序首次启动自动生成并持久化到 `data/config/admin-auth.json`

如果你就是想固定它们，也可以自己在 compose 里加上。

### 3. 在宝塔 Docker / Compose 中创建项目

推荐直接使用 `docker-compose.yml` 部署。

#### 方式 1：宝塔 Docker-Compose

1. 打开宝塔面板
2. 进入 **Docker**
3. 进入 **Compose**
4. 新建编排项目
5. 选择这个项目目录里的 `docker-compose.yml`
6. 点击部署

#### 方式 2：宝塔终端执行

```bash
cd /www/wwwroot/2025-blog-public-adapt
docker compose up -d --build
```

---

## 四、端口访问

默认映射：

```yml
ports:
  - "3000:3000"
```

如果 3000 端口被占用，可以改成：

```yml
ports:
  - "8080:3000"
```

那么访问地址就是：

```txt
http://服务器IP:8080
```

---

## 五、反向代理（推荐）

如果你有域名，比如：

```txt
blog.example.com
```

可以在宝塔网站里做反向代理到：

```txt
http://127.0.0.1:3000
```

或者你自己改过端口后对应改成：

```txt
http://127.0.0.1:8080
```

---

## 六、数据备份

你真正要备份的是：

```txt
./data
```

里面包括：

- `data/public/blogs/`：博客正文、封面、资源文件
- `data/content/`：about、projects、share、snippets、bloggers、pictures
- `data/config/`：站点配置

备份命令示例：

```bash
cd /www/wwwroot/2025-blog-local-docker
tar -czf blog-data-backup.tar.gz data
```

---

## 七、迁移到新服务器

迁移时只要：

1. 新服务器部署同一份项目代码，或者直接拉同一个 Docker Hub 镜像
2. 把旧服务器 `data/` 目录复制过去
3. 启动容器

如果你是 Docker Hub 部署，迁移根本不需要重新 build。

---

## 八、后台使用说明

前台地址：

```txt
/
```

博客写作：

```txt
/write
```

博客管理：

```txt
/blog
```

其他可编辑内容页面：

- `/about`
- `/projects`
- `/share`
- `/snippets`
- `/bloggers`
- `/pictures`

登录方式：

- 点击页面中的管理员登录按钮
- 输入 `ADMIN_PASSWORD`

---

## 九、首次启动说明

程序首次启动时会自动把原项目内置内容初始化到：

```txt
data/
```

后续编辑都会保存到这个目录，不再依赖 GitHub。

---

## 十、常见问题

### 1）为什么我改完内容，重启后还在？

因为内容已经持久化到 `data/` 挂载目录，这正是预期行为。

### 2）为什么换服务器后内容还能跟着走？

因为你只需要迁移 `data/` 即可。

### 3）默认密码能不能改？

可以，直接改：

- `ADMIN_PASSWORD`
- 建议同时改 `SESSION_SECRET`

### 4）要不要再配置 GitHub 私钥？

不用。这个改造版已经不再依赖 GitHub App / `.pem` 私钥发布。
