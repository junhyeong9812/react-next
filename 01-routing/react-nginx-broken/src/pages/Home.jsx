export default function Home() {
  return (
    <div>
      <h1>Home (react-nginx-broken)</h1>
      <p>Nginx 있지만 try_files 없음 → /about 직접 접속 시 Nginx 404.</p>
    </div>
  )
}
