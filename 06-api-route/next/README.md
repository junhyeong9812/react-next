# 06-api-route/next — Route Handler (BFF)

## 구현

```ts
// app/api/posts/route.ts
export async function GET() {
  const res = await fetch(`${process.env.API_BASE}/api/posts`);
  const data = await res.json();
  return Response.json(data);
}
```

```tsx
// app/posts/page.tsx (Client Component 또는 Server Component)
'use client';
useEffect(() => {
  fetch('/api/posts')
    .then(r => r.json())
    .then(setPosts);
}, []);
```

## 예상 결과

```bash
docker exec next grep -r "backend:8080" .next/static
# 매치 없음

docker exec next grep -r "backend:8080" .next/server
# 매치됨 (서버 번들)
```

- DevTools 네트워크: `fetch('/api/posts')` → `localhost:3602/api/posts`
- 내부 backend 주소는 브라우저가 전혀 모름

## 학습 포인트

- 클라-서버 분리 깔끔
- 서버 환경변수(`API_BASE`, `API_KEY`)만으로 백엔드 교체 가능
- BFF에서 응답 가공/다중 API 조합 용이
