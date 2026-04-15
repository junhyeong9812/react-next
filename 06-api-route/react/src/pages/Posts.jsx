import { useEffect, useState } from 'react';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_BASE + '/api/posts')
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Posts (React, 클라 직접 호출)</h1>
      <p>
        호출 대상: <code>{import.meta.env.VITE_API_BASE}/api/posts</code>
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
