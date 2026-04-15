FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

ARG VITE_API_BASE=http://localhost:8080
ARG VITE_API_KEY=demo-secret-key
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_API_KEY=$VITE_API_KEY

RUN npm run build
RUN npm install -g serve

EXPOSE 3000
# SPA fallback 옵션 -s 의도적 생략 → /about 직접 접속 시 404 재현
CMD ["serve", "dist", "-l", "3000"]
