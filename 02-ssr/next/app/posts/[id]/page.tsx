type Post = {
  id: number;
  title: string;
  body: string;
  author: string;
  updatedAt: string;
};

export default async function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const base = process.env.API_BASE ?? 'http://backend:8080';
  const res = await fetch(`${base}/api/posts/${params.id}`, {
    cache: 'no-store',
  });
  if (!res.ok) return <p>Not found</p>;
  const post: Post = await res.json();

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
      <footer>
        <span>author: {post.author}</span> · <span>updatedAt: {post.updatedAt}</span>
      </footer>
    </article>
  );
}
