import React from 'react';
import { useParams } from 'react-router-dom';
import { fetchResource, loadPost } from '../api.js';

export default function PostDetail() {
  const { id } = useParams();
  // 404 시 loadPost가 Error throw → ErrorBoundary catch
  const post = fetchResource(`post:${id}`, () => loadPost(id));
  return (
    <div style={{ padding: 24 }}>
      <h2>{post.title}</h2>
      <p>{post.body}</p>
      <small>by {post.author} · updated {post.updatedAt}</small>
    </div>
  );
}
