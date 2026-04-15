import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPost(null);
    setError(null);
    fetch(`${import.meta.env.VITE_API_BASE}/api/posts/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setPost)
      .catch((e) => setError(e.message));
  }, [id]);

  return (
    <main style={{ padding: 16 }}>
      {post && (
        <Helmet>
          <title>{`${post.title} — 블로그`}</title>
          <meta property="og:title" content={post.title} />
          <meta property="og:description" content={(post.body ?? '').slice(0, 100)} />
        </Helmet>
      )}
      {error && <p>에러: {error}</p>}
      {!post && !error && <p>로딩 중...</p>}
      {post && (
        <article>
          <h1>{post.title}</h1>
          <p style={{ color: '#666' }}>by {post.author} · {post.updatedAt}</p>
          <p>{post.body}</p>
        </article>
      )}
    </main>
  );
}
