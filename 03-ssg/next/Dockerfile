# 03-ssg/next
#
# 빌드 타임 데이터 소스:
#   - 기본: data/posts.json 을 COPY 해서 generateStaticParams 에서 로컬 파일로 읽는다.
#     compose 네트워크에 의존하지 않으므로 일반 docker build 로도 성공한다.
#   - 옵션: build arg API_BASE=http://backend:8080 을 넘기면 fetch 시도 후 실패 시 파일로 폴백.
#     (compose build 시 backend 를 먼저 up 해둬야 네트워크 접근이 가능하다.)

ARG API_BASE=""

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
