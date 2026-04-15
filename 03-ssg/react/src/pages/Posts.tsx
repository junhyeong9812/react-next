import { Link } from 'react-router-dom';
import type { Post } from '../types';

export default function Posts({ initialPosts }: { initialPosts: Post[] | null }) {
  const posts = initialPosts ?? [];
  return (
    <>
      <h1>Posts</h1>
      <ul>
        {posts.map((p) => (
          <li key={p.id}>
            <Link to={`/posts/${p.id}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
