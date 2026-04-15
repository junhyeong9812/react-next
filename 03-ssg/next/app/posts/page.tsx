import Link from 'next/link';
import { loadPosts } from '../../lib/posts';

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
