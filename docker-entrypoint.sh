#!/bin/sh
if [ ! -f "/app/db/1panel.db" ]; then
  # 部署数据库
  cp /app/prisma/1panel.db /app/db/1panel.db
fi
# 启动应用
exec node server.js 