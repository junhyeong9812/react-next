# react-bare — Nginx 없이 맨몸 배포

## 목적

React SPA를 **Nginx 없이** `serve` 같은 단순 정적 서버로 띄우면 `/about` 새로고침 시 어떻게 되는지 보여준다.

## 스택

- Vite + React 18 + React Router v6
- 빌드 후 `serve -s dist` (SPA 모드 아님에 주의 — 단순 `serve dist`로 할 것)

## 페이지 4종

- `/` Home — 다른 페이지로 Link
- `/about` About — 정적 텍스트
- `/posts` 글 목록 — `fetch(VITE_API_BASE + '/api/posts')`
- `/weather` 날씨 — `fetch` + `X-API-Key: VITE_API_KEY` 헤더

## 환경변수 (빌드 타임)

- `VITE_API_BASE` — 기본 `http://localhost:8080`
- `VITE_API_KEY` — 기본 `demo-secret-key` (⚠️ **번들에 박힘**)

## Dockerfile 요구사항

```
1. node:22-alpine에서 npm ci && npm run build
2. serve 설치
3. EXPOSE 3000 / CMD ["serve", "dist", "-l", "3000"]
   (SPA fallback 옵션 -s 없이!)
```

## 예상 결과

| 행위 | 결과 |
|---|---|
| `http://localhost:3001/` 접속 | Home 렌더 |
| Home에서 `/about` Link 클릭 | About 렌더 (URL만 변경) |
| `http://localhost:3001/about` 직접 | **404 Not Found** |
| `http://localhost:3001/about` F5 | **404 Not Found** |
| `curl http://localhost:3001/` | `<div id="root"></div>` 만 있는 HTML |
| `grep -r demo-secret-key dist/` | 매치됨 (번들 박제) |
