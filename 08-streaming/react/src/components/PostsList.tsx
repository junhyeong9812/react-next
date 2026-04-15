import { use } from 'react';
import type { Post } from '../types';

export default function PostsList({ postsPromise }: { postsPromise: Promise<Post[]> }) {
  const posts = use(postsPromise);
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
