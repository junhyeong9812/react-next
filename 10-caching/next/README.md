# 10-caching/next — Data Cache + revalidateTag

## 구현

```tsx
// app/posts/page.tsx
export default async function PostsPage() {
  const res = await fetch(`${process.env.API_BASE}/api/posts`, {
    next: { tags: ['posts'] },
  });
  const posts = await res.json();
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

```tsx
// app/admin/revalidate/page.tsx
'use client';
export default function AdminPage() {
  return <button onClick={() => fetch('/api/revalidate')}>Revalidate Posts</button>;
}
```

```ts
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
export async function GET() {
  revalidateTag('posts');
  return Response.json({ ok: true });
}
```

## 자동 캐시

- `tags: ['posts']` 붙인 fetch 결과가 Data Cache에 저장
- 첫 요청 후 반복 방문은 캐시 히트 → 백엔드 호출 없음

## 예상 결과

```bash
# 백엔드 로그 카운트
docker compose logs backend | grep "/api/posts" | wc -l
# 1

# 10번 새로고침
for i in {1..10}; do curl -s http://localhost:3012/posts > /dev/null; done
docker compose logs backend | grep "/api/posts" | wc -l
# 여전히 1 (캐시 히트)

# 무효화
curl http://localhost:3012/api/revalidate
for i in {1..10}; do curl -s http://localhost:3012/posts > /dev/null; done
docker compose logs backend | grep "/api/posts" | wc -l
# 2 (무효화 후 한 번 재생성)
```
