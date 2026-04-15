import { loadPost, loadPosts } from '../../../lib/posts';

export async function generateStaticParams() {
  const posts = await loadPosts();
  return posts.map((p) => ({ id: String(p.id) }));
}

export const dynamicParams = false;

export default async function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await loadPost(params.id);
  if (!post) return <p>Not found</p>;
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
      <footer>
        <span>author: {post.author}</span> ·{' '}
        <span>updatedAt: {post.updatedAt}</span>
      </footer>
    </article>
  );
}
