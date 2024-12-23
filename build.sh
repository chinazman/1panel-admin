#!/bin/bash
git pull
docker stop 1panel-admin
docker rm 1panel-admin
docker rmi chinazman/1panel-admin:latest
docker build -t chinazman/1panel-admin:latest .
docker image prune -f
#update db use this
#docker compose run --rm --entrypoint "" 1panel-admin sh -c "npm install prisma @prisma/client && npx prisma migrate deploy"
docker compose up -d
docker logs -f 1panel-admin