import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Post } from '../types';

export default function PostDetail({ initialPost }: { initialPost: Post | null }) {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(initialPost);

  useEffect(() => {
    if (post && String(post.id) === id) return;
    fetch(`/api/posts/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setPost)
      .catch(() => setPost(null));
  }, [id, post]);

  if (!post) return <p>Not found</p>;
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
