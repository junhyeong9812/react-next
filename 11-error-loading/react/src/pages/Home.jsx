import React from 'react';

export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1>11-error-loading / React</h1>
      <p>ErrorBoundary + Suspense 수동 배치 데모.</p>
      <ul>
        <li>/posts — 300ms 지연 후 목록 (Suspense fallback 관찰)</li>
        <li>/posts/1 — 정상 단건</li>
        <li>/posts/999 — backend 404 → throw → ErrorBoundary catch</li>
      </ul>
    </div>
  );
}
