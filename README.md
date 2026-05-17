# 2025 Blog Public Docker版本

　　原作者原项目开源地址为：https://github.com/YYsuni/2025-blog-public  
　　此项目是一个由AI辅助二改后的blog项目，不再使用github key改成自定义密码进行修改文章。

前言：  
　　二改缘由，逛b站看到作者的blog非常喜欢，刚好自己有个空闲服务器只部署了openclaw。然后看到项目才发现只能利用github key进行编辑文章和设置。找了很长时间也没发现有其他办法在自己的服务器部署。因为自己也是个小白，然后突发奇想利用“小龙虾”也就是openclaw进行辅助修改。用了一天时间不断的和它对战。消耗了大量token，最终得出了这个项目！（ AI好强！）

## 一、最快部署方式（推荐）

如果你只是想在宝塔 / 1Panel / 服务器上一条命令直接跑起来，别 clone 源码，直接拉 Docker Hub 镜像：

```bash
mkdir -p /www/wwwroot/2025-blog-local-docker/data && docker run -d \
  --name 2025-blog-local-docker \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e ADMIN_PASSWORD='Sheng123..' \
  -e SESSION_SECRET='change-this-session-secret-after-deploy' \
  -e DATA_DIR=/app/data \
  -v /www/wwwroot/2025-blog-local-docker/data:/app/data \
  --restart unless-stopped \
  duanxiaosheng/2025-blog-local-docker:latest
```

部署后访问：

```txt
http://服务器IP:3000
```

**强烈建议你把上面两项改掉：**

- `ADMIN_PASSWORD`
- `SESSION_SECRET`

---

## 二、Docker Hub 镜像地址

当前发布镜像：

```txt
duanxiaosheng/2025-blog-local-docker:latest
```

如果你后续要固定版本，也可以用：

```txt
duanxiaosheng/2025-blog-local-docker:<tag>
```

---

## 三、源码部署方式

（适合想自己改代码、自己 build 的用户）

注：Gitee 仓库，国内服务器拉取更快

```bash
git clone https://gitee.com/duanxiaosheng/2025-blog-local-docker.git
cd 2025-blog-local-docker
docker compose up -d --build
```

注：GitHub 仓库，国外服务器

```bash
git clone https://github.com/duanxiaosheng/2025-blog-public-docker.git
cd 2025-blog-public-docker
docker compose up -d --build
```

---

## 四、如何访问？

```txt
http://服务器IP:3000
```

注：默认端口号是 `3000`。打不开就去服务器防火墙、宝塔安全组或 1Panel 防火墙里放行这个端口。

---

## 五、首次使用注意事项【必看】

1、第一次进入编辑或后台时，系统会提示你初始化管理员密码。  
如果你在启动容器时传了 `ADMIN_PASSWORD`，那后台密码就由这个环境变量控制。

2、如果密码忘记？  
- **环境变量模式**：直接改容器里的 `ADMIN_PASSWORD` 后重启容器
- **本地初始化模式**：删除 `data/config/admin-auth.json` 后重启容器，再重新初始化

3、目录保存在哪个位置？  
如果按上面的 Docker Hub 一键命令部署，默认数据目录是：

```txt
/www/wwwroot/2025-blog-local-docker/data
```

里面包含：
- 文章
- 图片
- 首页配置
- 管理员密码初始化信息
- 点赞数据

4、如何备份/迁移项目？  
直接备份整个 `data/` 目录即可。迁移到新服务器时，把这个目录复制过去再启动容器。

5、如何彻底清理部署的文件？  
删除容器，再删除宿主机挂载目录即可。

6、其他问题暂时未遇到，如果有可以联系我QQ：3983430，你也可以将此仓库链接发给你的AI助手，让他帮你继续完善！（项目中有一个专门写给下一个ai的md文档，可以告诉它先读取这个文档再进行完善项目）

---

## 六、如何更新到最新版本？

如果你是 Docker Hub 部署，更新命令可以直接这样跑：

```bash
docker pull duanxiaosheng/2025-blog-local-docker:latest && docker rm -f 2025-blog-local-docker && docker run -d \
  --name 2025-blog-local-docker \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e ADMIN_PASSWORD='你的后台密码' \
  -e SESSION_SECRET='你自己的随机字符串' \
  -e DATA_DIR=/app/data \
  -v /www/wwwroot/2025-blog-local-docker/data:/app/data \
  --restart unless-stopped \
  duanxiaosheng/2025-blog-local-docker:latest
```

---

## 七、如何自己推送到 Docker Hub？

项目已经带了 GitHub Actions 工作流：

```txt
.github/workflows/docker-image.yml
```

你只需要在 GitHub 仓库 Secrets 里配置：

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

之后每次推送到 `main`，都会自动构建并推送镜像到 Docker Hub。

如果你想手工推，也可以：

```bash
docker login
docker build -t duanxiaosheng/2025-blog-local-docker:latest .
docker push duanxiaosheng/2025-blog-local-docker:latest
```

---

## License

MIT
