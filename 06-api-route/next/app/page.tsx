export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Home (Next)</h1>
      <p>/posts 로 이동하면 같은 서버의 Route Handler를 경유해 호출합니다.</p>
      <p>DevTools 네트워크 탭에서 request URL이 <code>/api/posts</code> 뿐임을 확인하세요.</p>
    </div>
  );
}
