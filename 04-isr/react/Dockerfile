# 04-isr/react
#
# 03-ssg/react 와 동일한 SSG 파이프라인. 다만 이 phase 의 포인트는
# "빌드 후 데이터가 바뀌어도 HTML 은 박제되어 갱신되지 않는다" 는 것.
# 즉 ISR 은 불가능하고, 유일한 해법은 scripts/rebuild.sh 로 이 이미지를 다시 빌드하는 것이다.
#
# 빌드 타임 데이터 소스:
#   - 기본: 컨텍스트 내 data/posts.json 으로 빌드. (docker build 가 compose 네트워크에
#     접근하지 못해도 성공하므로 가장 견고.)
#   - 옵션: build arg API_BASE=http://backend:8080 을 주면 prerender 가 fetch 시도 후
#     실패 시 data/posts.json 으로 폴백.

ARG API_BASE=""

FROM node:22-alpine AS builder
ARG API_BASE
ENV API_BASE=${API_BASE}
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g serve@14
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
