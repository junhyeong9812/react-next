# 03-ssg/react
#
# 빌드 타임 데이터 소스에 대한 주의:
#   - 기본: backend 의존성을 끊기 위해 ../backend 의 posts.json 을 COPY 해서 로컬 파일로 읽는다.
#     (build args 의 API_BASE 가 비어있거나 fetch 가 실패하면 data/posts.json 으로 fallback)
#   - 옵션: compose 가 backend 를 먼저 기동하고 docker compose build 시 같은 네트워크가 연결된
#     환경이라면 build arg API_BASE=http://backend:8080 으로 전달하여 실제 HTTP fetch 를 태울 수 있다.
#     (일반적인 docker build 로는 compose 네트워크에 접근 불가하므로 로컬 파일 방식이 더 견고.)

ARG API_BASE=""

FROM node:22-alpine AS builder
ARG API_BASE
ENV API_BASE=${API_BASE}
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
# backend 의 posts.json 을 빌드 컨텍스트로 주입받지 못하므로, 컨텍스트 내 data/ 로 미리 복사되어 있어야 한다.
# compose 는 context: ./react 로 빌드하므로 react/data/posts.json 에 존재해야 함.
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g serve@14
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
