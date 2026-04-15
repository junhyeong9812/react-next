import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../types';

export default function Posts({ initialPosts }: { initialPosts: Post[] | null }) {
  const [posts, setPosts] = useState<Post[] | null>(initialPosts);

  useEffect(() => {
    if (posts) return;
    fetch('/api/posts')
      .then((r) => r.json())
      .then(setPosts)
      .catch(() => setPosts([]));
  }, [posts]);

  if (!posts) return <p>Loading...</p>;
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
