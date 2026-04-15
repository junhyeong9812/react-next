import type { Post } from '../types';

export default function PostDetail({ initialPost }: { initialPost: Post | null }) {
  if (!initialPost) return <p>Not found</p>;
  return (
    <article>
      <h1>{initialPost.title}</h1>
      <p>{initialPost.body}</p>
      <footer>
        <span>author: {initialPost.author}</span> ·{' '}
        <span>updatedAt: {initialPost.updatedAt}</span>
      </footer>
    </article>
  );
}
