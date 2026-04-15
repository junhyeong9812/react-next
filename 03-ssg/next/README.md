# 03-ssg/next — generateStaticParams

## 목적

Next의 기본 동작. 동적 라우트에서 `generateStaticParams`를 정의하면 빌드 타임에 HTML 생성.

## 예제 코드 (`app/posts/[id]/page.tsx`)

```tsx
export async function generateStaticParams() {
  const res = await fetch(`${process.env.API_BASE}/api/posts`);
  const posts = await res.json();
  return posts.map((p: any) => ({ id: String(p.id) }));
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const res = await fetch(`${process.env.API_BASE}/api/posts/${params.id}`);
  const post = await res.json();
  return <article><h1>{post.title}</h1><p>{post.body}</p></article>;
}
```

## 예상 결과

```bash
# 빌드 후 생성물에 HTML 존재
docker exec next ls .next/server/app/posts
# 1.html   2.html   3.html   4.html   5.html   (혹은 prerender-manifest.json에 기록)
```

## 학습 포인트

- `generateStaticParams` 반환값만큼 HTML 생성
- 함수 하나 정의로 03-ssg 리액트의 `prerender.mjs` 전체가 대체됨
