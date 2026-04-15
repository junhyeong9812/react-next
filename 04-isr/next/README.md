# 04-isr/next — revalidate

## 목적

한 줄 옵션으로 "10초마다 신선한 데이터"를 실현.

## 예제 코드 (`app/posts/[id]/page.tsx`)

```tsx
export const revalidate = 10;

export async function generateStaticParams() {
  const res = await fetch(`${process.env.API_BASE}/api/posts`);
  return (await res.json()).map((p: any) => ({ id: String(p.id) }));
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const res = await fetch(`${process.env.API_BASE}/api/posts/${params.id}`, {
    next: { revalidate: 10 },
  });
  const post = await res.json();
  return <article><h1>{post.title}</h1><p>{post.body}</p><small>{post.updatedAt}</small></article>;
}
```

## 예상 결과

```bash
# 초기 요청
curl -s http://localhost:3302/posts/1 | grep title  # "첫 글"

curl -X PATCH http://localhost:8080/api/posts/1 -H "Content-Type: application/json" -d '{"title":"수정됨"}'

# 10초 이내
curl -s http://localhost:3302/posts/1 | grep title  # 여전히 "첫 글" (stale serving)

# 10초 경과 + 첫 요청
curl -s http://localhost:3302/posts/1 | grep title  # "첫 글" (이 요청이 재생성 트리거)

# 그 다음 요청
curl -s http://localhost:3302/posts/1 | grep title  # "수정됨" ✅
```

## 학습 포인트

- stale-while-revalidate 전략
- 첫 "stale" 요청은 구 데이터를 받고, 백그라운드에서 재생성
- `revalidateTag`, `revalidatePath`로 수동 트리거도 가능 (10-caching에서 다룸)
