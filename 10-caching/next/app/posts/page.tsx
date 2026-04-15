type Post = {
  id: number;
  title: string;
  body: string;
  author: string;
  updatedAt: string;
};

// Server Component: fetch 결과가 Data Cache 에 저장되고
// 'posts' 태그로 revalidateTag 시 선택적 무효화 가능.
export default async function PostsPage() {
  const res = await fetch(`${process.env.API_BASE}/api/posts`, {
    next: { tags: ['posts'] },
  });
  const posts: Post[] = await res.json();

  return (
    <div style={{ padding: 24 }}>
      <h1>Posts (Next Data Cache)</h1>
      <p style={{ color: '#888' }}>
        이 페이지는 Data Cache + Full Route Cache 덕분에 반복 진입 시 백엔드를 호출하지 않는다.
      </p>
      <p style={{ color: '#888' }}>rendered at: {new Date().toISOString()}</p>
      <ul>
        {posts.map((p) => (
          <li key={p.id}>
            <strong>{p.title}</strong> — {p.author}
          </li>
        ))}
      </ul>
    </div>
  );
}
