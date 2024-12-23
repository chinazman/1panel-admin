# 1Panel Admin

1Panel Admin 是一个用于管理多个1Panel控制面板，并且支持多用户授权。
本项目基于 Next.js 15开发，使用 Tailwind CSS 进行样式设计, nodejs版本18。
全部代码都是有Cursor AI 生成的，可能存在一些问题，欢迎大家提交PR。

## 二次开发

```bash
# 初始化
npm run db:deploy
# 启动
npm run dev
# docker 打包
sh build.sh
```

## 安装前提条件

- 需要新增一个网站：`panel.yourdomain.com`，反向代理到1panel-admin服务;
- 需要新增一个网站`main.panel.yourdomain.com`,然后再加增泛域名`*.panel.yourdomain.com`；
- 在main.panel网站下新增两个反向代理
  - `/1panel-admin`指向1panel-admin服务
  - `/`指向`http://$backend_server`

## 安装

docker-compose.yml文件如下：

```yaml
version: '3'

services:
  1panel-admin:
    image: chinazman/1panel-admin:latest
    container_name: 1panel-admin
    ports:
      - "9230:3000"
    volumes:
      - ./db:/app/db
      - /etc/localtime:/etc/localtime:ro
      - /etc/timezone:/etc/timezone:ro
    environment:
      - TZ=Asia/Shanghai
    restart: unless-stopped 
```

```bash
# 安装
docker compose up -d
# 升级的话需要执行更新脚本
docker compose run --rm --entrypoint "" 1panel-admin sh -c "npm install prisma @prisma/client && npx prisma migrate deploy"
```
