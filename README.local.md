# 2025 Blog Local Docker - 本地开发与部署说明

这份文档偏向“开发者/维护者”。如果你只是想部署使用，优先看 `README.md`。

---

## 项目当前定位

这是 `2025-blog-public` 的本地化 Docker 改造版本：

- 前端仍然是 Next.js 博客站
- 后台改成管理员密码登录
- 内容和图片写入本地 `data/` 目录
- Docker 部署时通过 volume 持久化数据
- 不再使用 GitHub App private key / `.pem` 前端编辑流程

---

## 本地开发

项目声明的包管理器：

```txt
pnpm@10.15.0
```

推荐使用 pnpm：

```bash
pnpm install
pnpm dev
```

开发服务默认端口：

```txt
http://localhost:2025
```

---

## 常用命令

```bash
# 开发
pnpm dev

# 生产构建
pnpm build

# 生产启动
pnpm start

# 生成 SVG 索引
pnpm svg

# 数据健康检查
pnpm check:data
```

如果本机没有安装 pnpm，可以使用 corepack：

```bash
corepack enable
corepack prepare pnpm@10.15.0 --activate
pnpm install
```

---

## Docker 本地构建

```bash
docker compose up -d --build
```

默认容器名：

```txt
2025-blog-local-docker
```

默认端口：

```txt
3000
```

访问：

```txt
http://localhost:3000
```

---

## 目录结构速览

```txt
src/app/(home)/               首页和首页配置
src/app/blog/                 文章列表、文章详情、文章批量管理
src/app/write/                写文章、编辑文章
src/app/apps/                 应用导航
src/app/projects/             我的项目
src/app/share/                推荐分享
src/app/bloggers/             优秀博客
src/app/pictures/             图片页
src/app/snippets/             代码片段页
src/app/about/                关于页面
src/app/api/admin/            后台管理 API
src/app/api/content/          前台内容读取 API
src/app/api/blogs/            文章资源读取 API
src/app/api/images/           公共图片读取 API
src/app/api/site-assets/      favicon/avatar 动态资源
src/components/               公共组件
src/lib/local-admin/          本地管理、存储、鉴权、路径转换核心逻辑
data/                         运行时数据目录
```

---

## 运行时数据目录

所有后台编辑产生的数据都应该保存到 `data/`，不要写回源码目录。

常见结构：

```txt
data/config/                 管理员登录、站点配置、卡片布局配置
data/content/                apps/projects/share/bloggers/pictures/snippets/about 等内容
data/public/blogs/           文章正文、封面、文章内图片
data/public/images/          公共上传图片
data/likes/                  点赞数据
```

Docker 中默认：

```txt
容器内：/app/data
宿主机：./data
```

由 `DATA_DIR` 控制。

---

## 管理员登录逻辑

相关文件：

```txt
src/lib/local-admin/auth.ts
src/lib/local-admin/http.ts
src/app/api/admin/init/route.ts
src/app/api/admin/login/route.ts
src/app/api/admin/logout/route.ts
src/app/api/admin/session/route.ts
src/components/admin-password-dialog.tsx
```

规则：

1. 如果设置了 `ADMIN_PASSWORD` 环境变量，使用环境变量密码。
2. 如果没有设置 `ADMIN_PASSWORD`，首次进入后台时初始化密码。
3. 初始化信息和自动生成的 `SESSION_SECRET` 保存在：

```txt
data/config/admin-auth.json
```

4. 管理接口必须通过 `requireAdmin()` 校验。

---

## 图片路径规则

这是本项目最容易出问题的地方。

### 公共图片

- 存储值：`/images/...`
- 前台展示：`/api/images/...`

### 文章图片

- 存储值：`/blogs/...`
- 前台展示：`/api/blogs/...`

### 禁止保存

不要把这些写入 JSON / markdown / 配置：

```txt
blob:...
data:image/...
/api/api/...
```

如果图片显示异常，先跑：

```bash
pnpm check:data
```

---

## 最近这一版的重点能力

这一版主要完善了以下体验：

- 导航图标整体替换并统一风格
- 首页 `/` 不默认显示白色 active 滑块，hover 仍显示
- 顶部 icons 导航间距更紧凑
- 内容页避免先显示旧 `list.json` 再闪到新数据
- 写文章/编辑文章时，图片支持点击“填 入”插入正文，移动端更好用
- 图片卡片里的“封面”和“填 入”样式做了多轮微调
- 单篇文章编辑页右上角删除/取消按钮改成稳定可点击的原生按钮
- 删除确认提示改成浮在删除按钮正下方，不挤压功能栏布局
- Docker 构建依赖安装改为 pnpm，匹配 `packageManager`

---

## 改完代码后的验证建议

最低要求：

```bash
pnpm build
```

如果涉及数据、图片、文章、配置读写，再跑：

```bash
pnpm check:data
```

如果是在 Docker 环境里改 UI，需要重新构建并启动：

```bash
docker compose up -d --build
```

只推代码不重建容器，本地页面通常看不到变化。

---

## 推送远程仓库

当前常用远程：

```txt
GitHub: git@github.com:duanxiaosheng/2025-blog-public-docker.git
Gitee : git@gitee.com:duanxiaosheng/2025-blog-local-docker.git
```

常用提交流程：

```bash
git status
git add <files>
git commit -m "说明这次改了什么"
git push github main
git push origin main
```

---

## 注意事项

- 不要恢复 GitHub App / `.pem` 前端编辑模式。
- 不要把运行时数据写到 `src/` 或 `public/`。
- 不要保存 `blob:` 或 base64 图片到数据文件。
- 不要把 `/api/images/...`、`/api/blogs/...` 当作存储值保存。
- Docker 构建优先用 pnpm，不要随意改回 npm。
- 对外发送、删除远程数据、清空数据目录前必须确认。

---

## 更多维护说明

请阅读：

```txt
给下一个智能体也可以编辑此仓库.md
```
