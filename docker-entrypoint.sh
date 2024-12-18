#!/bin/sh
# 部署数据库
npm run db:deploy

# 启动应用
exec node server.js 