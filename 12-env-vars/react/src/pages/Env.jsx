export default function Env() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Env (React / Vite)</h1>
      <p>PUBLIC: {import.meta.env.VITE_PUBLIC_KEY}</p>
      <p style={{ color: '#888' }}>
        SECRET은 접근 방법 없음. import.meta.env.SECRET_KEY ={' '}
        {String(import.meta.env.SECRET_KEY)}
      </p>
    </div>
  );
}
