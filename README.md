# 2025 Blog Public Docker版本

　　原作者原项目开源地址为：https://github.com/YYsuni/2025-blog-public  
　　此项目是一个由AI辅助二改后的blog项目，不再使用github key改成自定义密码进行修改文章。

前言：  
　　二改缘由，逛b站看到作者的blog非常喜欢，刚好自己有个空闲服务器只部署了openclaw。然后看到项目才发现只能利用github key进行编辑文章和设置。找了很长时间也没发现有其他办法在自己的服务器部署。因为自己也是个小白，然后突发奇想利用“小龙虾”也就是openclaw进行辅助修改。用了一天时间不断的和它对战。消耗了大量token，最终得出了这个项目！（ AI好强！）

## 一、快速开始
　　（适合自己有服务器、能进入终端的用户。直接复制以下命令进入终端，直接回车执行）  
　　
注： Gitee仓库，国内服务器部署很快
 
```bash
git clone https://gitee.com/duanxiaosheng/2025-blog-local-docker.git
cd 2025-blog-local-docker
docker compose up -d --build
```
注：GitHub仓库，国外服务器
```bash
git clone https://github.com/duanxiaosheng/2025-blog-public-docker.git
cd 2025-blog-public-docker
docker compose up -d --build
```

## 二、如何访问？

```txt
http://服务器IP:3000
```

注：（默认端口号：300）无法打开请在服务器防火墙打开此端口号，如果安装有宝塔面板或者1panel面板，也需要在防火墙开启此端口


## 三、首次使用注意事项【必看】

1、第一次进入编辑或后台时，系统会提示你初始化管理员密码。（请牢记自己的密码，并且不要随意泄露）  

2、如果密码忘记？  
　　需要进入服务器文件夹（/root/2025-blog-local-docker/data/config目录）→ 删除admin-auth.json文件后 → 在宝塔面板或1panel面板，重启一下“项目docker” → 再次访问网站，即可重新设置密码。  

3、目录保存在哪个位置？  
　　如果是命令行root用户运行此项目应该是在（/root/2025-blog-local-docker/data/）里面包含：
- 文章
- 图片
- 首页配置
- 管理员初始化密码信息
- 点赞数据

4、如何备份/迁移项目？  
　　将/root/2025-blog-local-docker/data/目录打包后 → 在其他服务器部署好后（删除并替换同路径文件夹）  

5、如何彻底清理部署的文件？  
　　删除容器和docker → 删除2025-blog-local-docker目录即可  

6、其他问题暂时未遇到，如果有可以联系我QQ：3983430

---

## License

MIT