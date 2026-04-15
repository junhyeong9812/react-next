import React from 'react';
import { Link } from 'react-router-dom';
import { fetchResource, loadPosts } from '../api.js';

export default function Posts() {
  // Suspense 연동: pending이면 promise throw → 상위 Suspense fallback(Loading)
  const posts = fetchResource('posts', loadPosts);
  return (
    <div style={{ padding: 24 }}>
      <h2>Posts</h2>
      <ul>
        {posts.map((p) => (
          <li key={p.id}>
            <Link to={`/posts/${p.id}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
