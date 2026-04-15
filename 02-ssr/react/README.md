# 02-ssr/react — Express + renderToPipeableStream

## 목적

React에서 SSR을 **수동으로** 구현한다. 이 코드량이 곧 Next가 프레임워크 레벨로 흡수해준 비용.

## 구조

```
react/
├── server/index.ts        # Express 엔트리
├── src/
│   ├── App.tsx
│   ├── entry-client.tsx   # hydrateRoot
│   ├── entry-server.tsx   # renderToPipeableStream
│   └── pages/
│       ├── Posts.tsx
│       └── PostDetail.tsx
├── vite.config.ts         # SSR 모드
└── Dockerfile
```

## 핵심 흐름

1. Express가 요청 수신
2. 서버에서 `/api/posts` fetch (300ms 지연)
3. `renderToPipeableStream(<App url={req.url} initialData={data} />)` 실행
4. HTML shell(`<!doctype html>...<div id="root">`) 안에 렌더 결과를 파이프
5. 브라우저에서 `entry-client.tsx`가 `hydrateRoot`

## 환경변수

- `API_BASE=http://backend:8080`

## 예상 결과

```bash
curl -s http://localhost:3101/posts | head -c 2000
# <!doctype html>... <div id="root"><ul><li>첫 글</li><li>두번째 글</li>...
```

## 주의

- SSR/CSR 양쪽에서 같은 `App` 컴포넌트가 돌아야 함
- `window`, `document` 참조가 서버에서 터지지 않게 주의
- 데이터 인젝션(`window.__INITIAL_DATA__`)으로 hydration mismatch 방지
