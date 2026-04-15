import { notFound } from 'next/navigation';

const API_BASE = process.env.API_BASE || 'http://backend:8080';

type Post = {
  id: number;
  title: string;
  body: string;
  author: string;
  updatedAt: string;
};

async function getPost(id: string): Promise<Post> {
  const res = await fetch(`${API_BASE}/api/posts/${id}`, { cache: 'no-store' });
  if (res.status === 404) {
    // 데모에서는 error.tsx를 트리거하기 위해 throw 사용
    // notFound() 호출 시 not-found.tsx로 연결됨 (여기선 선택하지 않음)
    throw new Error(`Post ${id} not found (404)`);
  }
  if (!res.ok) throw new Error(`GET /api/posts/${id} 실패: ${res.status}`);
  return res.json();
}

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);
  if (!post) notFound();
  return (
    <div style={{ padding: 24 }}>
      <h2>{post.title}</h2>
      <p>{post.body}</p>
      <small>by {post.author} · updated {post.updatedAt}</small>
    </div>
  );
}
