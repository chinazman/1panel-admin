#!/bin/sh
if [ ! -f "/app/db/1panel.db" ]; then
  # 部署数据库
  npx prisma migrate deploy
  npx tsx prisma/init-db.ts
else
  npx prisma migrate deploy
fi
# 启动应用
exec node server.js 