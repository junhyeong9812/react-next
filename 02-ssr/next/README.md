# 02-ssr/next — Server Component

## 목적

Next가 SSR을 프레임워크 레벨로 감춘 모습. 함수 하나가 곧 SSR 페이지.

## 구조

```
next/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── posts/
│       ├── page.tsx           # Server Component
│       └── [id]/page.tsx
├── next.config.js
└── Dockerfile
```

## 예제 코드 (`app/posts/page.tsx`)

```tsx
export default async function PostsPage() {
  const res = await fetch(`${process.env.API_BASE}/api/posts`, { cache: 'no-store' });
  const posts = await res.json();
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

이게 전부. Express, hydrateRoot, 데이터 인젝션이 전부 프레임워크 내부.

## 예상 결과

```bash
curl -s http://localhost:3102/posts | grep "첫 글"  # ✅
```

## 학습 포인트

- `async` page 하나로 SSR 끝
- `cache: 'no-store'`는 10-caching에서 다시 다룸
