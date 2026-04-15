export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1>12-env-vars / React (Vite)</h1>
      <p>/env 로 이동하여 VITE_* 빌드 박제를 확인하세요.</p>
      <p>SECRET_KEY는 Vite SPA에서는 주입 방법 자체가 없습니다 (서버가 없음).</p>
    </div>
  );
}
