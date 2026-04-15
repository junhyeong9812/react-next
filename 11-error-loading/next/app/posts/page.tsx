const API_BASE = process.env.API_BASE || 'http://backend:8080';

type Post = {
  id: number;
  title: string;
  body: string;
  author: string;
  updatedAt: string;
};

async function getPosts(): Promise<Post[]> {
  const res = await fetch(`${API_BASE}/api/posts`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`GET /api/posts 실패: ${res.status}`);
  return res.json();
}

export default async function PostsPage() {
  // Server Component async fetch → 로딩 동안 loading.tsx 자동 주입
  const posts = await getPosts();
  return (
    <div style={{ padding: 24 }}>
      <h2>Posts</h2>
      <ul>
        {posts.map((p) => (
          <li key={p.id}>
            <a href={`/posts/${p.id}`}>{p.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
