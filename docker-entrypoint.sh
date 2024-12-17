#!/bin/sh

# 如果数据库文件不存在，执行初始化
if [ ! -f "/app/db/1panel.db" ]; then
    echo "初始化数据库..."
    npx prisma migrate deploy
    node -r tsx/cjs src/scripts/init-db.ts
fi

# 启动应用
exec node server.js 