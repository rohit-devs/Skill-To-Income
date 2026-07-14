FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/

RUN apk add --no-cache python3 g++ make

FROM base AS build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --production

COPY server/. ./

EXPOSE 5000
CMD ["node", "server.js"]
