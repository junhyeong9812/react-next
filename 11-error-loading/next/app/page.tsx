export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1>11-error-loading / Next</h1>
      <p>error.tsx / loading.tsx 파일 컨벤션 자동 경계 데모.</p>
      <ul>
        <li>/posts — 300ms 지연, app/posts/loading.tsx 자동 렌더</li>
        <li>/posts/1 — 정상 단건</li>
        <li>/posts/999 — backend 404 → throw → app/posts/[id]/error.tsx 자동 렌더</li>
      </ul>
    </div>
  );
}
