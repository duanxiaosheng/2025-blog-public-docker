# 宝塔 Docker 部署说明

项目目录建议：

```txt
/www/wwwroot/2025-blog-public-adapt
```

## 一、上传项目

把整个项目上传到服务器。

确保目录内至少有这些文件：

- `Dockerfile`
- `docker-compose.yml`
- `.env.example`
- `data/`（首次可以没有，程序会自动初始化）

## 二、修改环境变量

你可以直接修改 `docker-compose.yml`，或者自己复制一份 `.env.example` 做记录。

至少建议修改：

- `ADMIN_PASSWORD`
- `SESSION_SECRET`

例如：

```yml
environment:
  NODE_ENV: production
  PORT: 3000
  ADMIN_PASSWORD: 你自己的后台密码
  SESSION_SECRET: 一串足够长的随机字符串
  DATA_DIR: /app/data
```

## 三、在宝塔 Docker / Compose 中创建项目

推荐直接使用 `docker-compose.yml` 部署。

### 方式 1：宝塔 Docker-Compose

1. 打开宝塔面板
2. 进入 **Docker**
3. 进入 **Compose**
4. 新建编排项目
5. 选择这个项目目录里的 `docker-compose.yml`
6. 点击部署

### 方式 2：宝塔终端执行

```bash
cd /www/wwwroot/2025-blog-public-adapt
docker compose up -d --build
```

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
cd /www/wwwroot/2025-blog-public-adapt
tar -czf blog-data-backup.tar.gz data
```

## 七、迁移到新服务器

迁移时只要：

1. 新服务器部署同一份项目代码
2. 把旧服务器 `data/` 目录复制过去
3. 重新 `docker compose up -d --build`

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

## 九、首次启动说明

程序首次启动时会自动把原项目内置内容初始化到：

```txt
data/
```

后续编辑都会保存到这个目录，不再依赖 GitHub。

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
