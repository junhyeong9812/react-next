'use client';

import { useEffect, useState } from 'react';

type Post = {
  id: number;
  title: string;
  body: string;
  author: string;
  updatedAt: string;
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then((data: Post[]) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(String(e));
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Posts (Next, Route Handler 경유)</h1>
      <p>
        호출 대상: <code>/api/posts</code> (자기 서버 경로. 내부 backend 주소는 브라우저가 모름)
      </p>
      {loading && <p>로딩 중…</p>}
      {error && <p style={{ color: 'crimson' }}>에러: {error}</p>}
      <ul>
        {posts.map((p) => (
          <li key={p.id}>
            <strong>{p.title}</strong> — {p.author}
          </li>
        ))}
      </ul>
    </div>
  );
}
