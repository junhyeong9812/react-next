export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1>10-caching / React</h1>
      <p>
        /posts 로 이동 — SWR로 stale-while-revalidate 동작, 하지만 매 진입/탭 포커스마다
        백엔드를 다시 호출한다 (서버 사이드 캐시 없음).
      </p>
      <p>API Base: <code>{import.meta.env.VITE_API_BASE}</code></p>
    </div>
  );
}
