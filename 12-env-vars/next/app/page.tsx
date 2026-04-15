export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1>12-env-vars / Next</h1>
      <p>/env (Server Component) 에서는 NEXT_PUBLIC_KEY와 SECRET_KEY 모두 읽힙니다.</p>
      <p>/client-demo (Client Component) 에서는 NEXT_PUBLIC_KEY만 읽히고 SECRET_KEY는 undefined 입니다.</p>
    </div>
  );
}
