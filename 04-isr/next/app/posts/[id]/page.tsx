type Post = {
  id: number;
  title: string;
  body: string;
  author: string;
  updatedAt: string;
};

// ISR 핵심 한 줄. 10초가 지난 뒤 첫 요청이 들어오면 Next 가 이 페이지를
// 백그라운드에서 다시 렌더링한다. 이 요청 자체는 stale HTML 을 받고,
// 그 다음 요청부터 새 HTML 이 서빙된다.
export const revalidate = 10;

// 빌드 타임에 알려진 id 들을 프리렌더. 04-isr/react 와 동일하게 1~5번을 박제한다.
// 단 revalidate 때문에 런타임에 백그라운드 재생성이 더해진다는 차이.
export const dynamicParams = true;

export async function generateStaticParams() {
  const apiBase = process.env.API_BASE ?? 'http://backend:8080';
  try {
    const res = await fetch(`${apiBase}/api/posts`);
    if (!res.ok) return [];
    const posts = (await res.json()) as Post[];
    return posts.map((p) => ({ id: String(p.id) }));
  } catch {
    return [];
  }
}

async function loadPost(id: string): Promise<Post | null> {
  const apiBase = process.env.API_BASE ?? 'http://backend:8080';
  const res = await fetch(`${apiBase}/api/posts/${id}`, {
    next: { revalidate: 10 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`failed to fetch post ${id}: ${res.status}`);
  return (await res.json()) as Post;
}

export default async function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await loadPost(params.id);
  if (!post) return <p>Not found</p>;
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
      <footer>
        <span>author: {post.author}</span> ·{' '}
        <span>updatedAt: {post.updatedAt}</span>
      </footer>
    </article>
  );
}
