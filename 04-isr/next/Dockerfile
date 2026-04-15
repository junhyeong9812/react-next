# 04-isr/next
#
# 빌드 시점 주의:
#   generateStaticParams() 가 ${API_BASE}/api/posts 를 fetch 하므로,
#   이미지를 빌드하는 동안 backend 가 같은 네트워크에 떠 있어야 한다.
#   docker compose up --build 로 기동하면 compose 가 backend 를 먼저 준비한 뒤
#   next 이미지를 빌드하므로 문제없다.
#   (반대로 단독 docker build 시에는 API_BASE 를 넘겨도 네트워크 접근이 안 된다.)
#
# 런타임:
#   revalidate: 10 으로 각 페이지가 주기적으로 재생성된다.
#   재생성 시 서버 fetch 는 컨테이너 네트워크의 backend:8080 을 호출한다.

ARG API_BASE="http://backend:8080"

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

FROM node:22-alpine AS builder
ARG API_BASE
ENV API_BASE=${API_BASE}
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
