# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 更新包索引并安装 OpenSSL
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
    apk add --no-cache openssl

# 设置淘宝镜像
RUN npm config set registry https://registry.npmmirror.com



# 复制 package.json 和 package-lock.json
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm install

# 生成 Prisma 客户端
RUN npm install prisma && \
    npm install @prisma/client && \
    mkdir db && \
    npx prisma migrate deploy && \
    npx tsx prisma/init-db.ts && \
    mv ./db/*.db ./prisma/

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM node:18-alpine AS runner

WORKDIR /app

# 更新包索引并安装 OpenSSL
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
    apk add --no-cache openssl

# 设置淘宝镜像
RUN npm config set registry https://registry.npmmirror.com


ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建数据库目录
RUN mkdir -p /app/db

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# 初始化数据库的启动脚本
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

VOLUME ["/app/db"]
# 暴露端口
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 使用启动脚本
ENTRYPOINT ["/docker-entrypoint.sh"]