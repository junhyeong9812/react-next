import Link from 'next/link';

type Post = {
  id: number;
  title: string;
  body: string;
  author: string;
  updatedAt: string;
};

export default async function PostsPage() {
  const base = process.env.API_BASE ?? 'http://backend:8080';
  const res = await fetch(`${base}/api/posts`, { cache: 'no-store' });
  const posts: Post[] = await res.json();

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
