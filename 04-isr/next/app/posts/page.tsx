import Link from 'next/link';

type Post = {
  id: number;
  title: string;
  body: string;
  author: string;
  updatedAt: string;
};

// ISR: 이 페이지 HTML 은 빌드 타임에 한 번 만들어지고,
// 이후 10초가 지나 첫 요청이 들어오면 Next 가 백그라운드에서 재생성한다.
// 그 동안 들어온 요청은 stale HTML 을 그대로 받는다 (stale-while-revalidate).
export const revalidate = 10;

async function loadPosts(): Promise<Post[]> {
  const apiBase = process.env.API_BASE ?? 'http://backend:8080';
  const res = await fetch(`${apiBase}/api/posts`, {
    next: { revalidate: 10 },
  });
  if (!res.ok) throw new Error(`failed to fetch posts: ${res.status}`);
  return (await res.json()) as Post[];
}

export default async function PostsPage() {
  const posts = await loadPosts();
  return (
    <>
      <h1>Posts</h1>
      <ul>
        {posts.map((p) => (
          <li key={p.id}>
            <Link href={`/posts/${p.id}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
