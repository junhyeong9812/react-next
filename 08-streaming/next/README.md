# 08-streaming/next — loading.tsx

## 구현

```
app/posts-slow/
├── layout.tsx       # 레이아웃(헤더/사이드바) - 즉시 렌더
├── loading.tsx      # Suspense fallback - 자동
└── page.tsx         # 2초 걸리는 async page
```

```tsx
// app/posts-slow/loading.tsx
export default function Loading() {
  return <SkeletonList />;
}
```

```tsx
// app/posts-slow/page.tsx
export default async function Page() {
  const res = await fetch(`${process.env.API_BASE}/api/slow-posts`);
  const posts = await res.json();
  return <PostsList posts={posts} />;
}
```

## 자동 동작

- Next가 page 바깥에 자동 `<Suspense fallback={<Loading/>}>` 주입
- 레이아웃은 이미 스트리밍 시작됨

## 예상 결과

`curl --no-buffer` 응답 타임라인:
- 0ms: `<html>... <header>... <ul class="skeleton">...</ul>`
- 2000ms: 실제 posts 본문 주입
