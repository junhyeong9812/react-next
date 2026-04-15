# 07-seo-metadata/next — metadata export

## 구현

```tsx
// app/posts/[id]/page.tsx
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const res = await fetch(`${process.env.API_BASE}/api/posts/${params.id}`);
  const post = await res.json();
  return {
    title: `${post.title} — 블로그`,
    openGraph: {
      title: post.title,
      description: post.body.slice(0, 100),
    },
  };
}

export default async function PostPage({ params }) {
  const res = await fetch(`${process.env.API_BASE}/api/posts/${params.id}`);
  const post = await res.json();
  return <article>...</article>;
}
```

## 예상 결과

```bash
curl -s http://localhost:3702/posts/1 | grep -E "og:title|<title>"
# <title>첫 글 — 블로그</title>
# <meta property="og:title" content="첫 글"/>
```

## 학습 포인트

- `generateMetadata`는 Server Component 렌더 전에 실행되어 `<head>` 완성
- 같은 fetch가 페이지와 메타데이터에서 공유되면 Next가 dedup 해줌
