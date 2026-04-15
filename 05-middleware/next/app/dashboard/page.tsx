export default function DashboardPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard (Next - protected)</h1>
      <p>middleware.ts가 쿠키를 검사해 비로그인은 /login 으로 307 리다이렉트.</p>
    </div>
  );
}
