# next-app — Next.js 기본 배포

## 목적

Next.js는 자체 Node 서버가 `/about`을 렌더링하므로 직접 접속/새로고침이 그냥 된다. API Key도 서버에만 존재.

## 스택

- Next.js 14+ (App Router)
- `next start` (production)

## 페이지 구성

- `app/page.tsx` — Home
- `app/about/page.tsx` — About
- `app/posts/page.tsx` — Server Component, 서버에서 `fetch('http://backend:8080/api/posts')`
- `app/weather/page.tsx` — Server Component, Route Handler 또는 직접 서버 fetch

## 환경변수 (서버 전용)

- `API_BASE=http://backend:8080`
- `API_KEY=demo-secret-key` (클라 번들에 나오면 안 됨)

## 예상 결과

| 행위 | 결과 |
|---|---|
| `/about` 직접 접속 | ✅ 즉시 렌더 |
| `/posts` 직접 접속 | ✅ 서버에서 HTML 완성 (글 제목이 초기 HTML에 포함) |
| `curl http://localhost:3004/posts` | HTML 본문에 글 제목 실재 |
| `grep -r demo-secret-key .next/static` | **매치 없음** (클라 번들에 안 들어감) |
| `grep -r demo-secret-key .next/server` | 매치됨 (서버 번들에만 존재) |
| DevTools 네트워크에서 `/weather` | `localhost:3004/api/weather?city=seoul` (자기 서버), 요청 헤더에 API Key 없음 |

## 구현 주의

- `/posts`, `/weather`는 **Server Component**로 구현 (async 함수)
- `/weather`는 API Key가 필요 → 서버에서 `process.env.API_KEY`로 추가 후 백엔드 호출
- Route Handler(`app/api/weather/route.ts`) 경유 방식도 OK. 이 경우 클라 컴포넌트에서 `/api/weather` 호출

## Dockerfile 요구사항

- 멀티스테이지: `node:22-alpine`에서 `npm ci && npm run build`
- 런타임: `next start -p 3000`
- EXPOSE 3000
