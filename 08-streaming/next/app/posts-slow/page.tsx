type Post = {
  id: number;
  title: string;
  body: string;
  author: string;
  updatedAt: string;
};

export default async function PostsSlowPage() {
  const base = process.env.API_BASE ?? 'http://backend:8080';
  const res = await fetch(`${base}/api/posts/slow`, { cache: 'no-store' });
  const posts: Post[] = await res.json();

  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>
          <strong>{p.title}</strong> — {p.author}
        </li>
      ))}
    </ul>
  );
}
