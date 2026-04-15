import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Post = {
  id: number;
  title: string;
  body: string;
  author: string;
  updatedAt: string;
};

async function getPost(id: string): Promise<Post | null> {
  const res = await fetch(`${process.env.API_BASE}/api/posts/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const post = await getPost(params.id);
  if (!post) return { title: '글을 찾을 수 없습니다 — 블로그' };
  return {
    title: `${post.title} — 블로그`,
    openGraph: {
      title: post.title,
      description: post.body.slice(0, 100),
    },
  };
}

export default async function PostPage(
  { params }: { params: { id: string } }
) {
  const post = await getPost(params.id);
  if (!post) notFound();
  return (
    <main style={{ padding: 16 }}>
      <article>
        <h1>{post.title}</h1>
        <p style={{ color: '#666' }}>by {post.author} · {post.updatedAt}</p>
        <p>{post.body}</p>
      </article>
    </main>
  );
}
