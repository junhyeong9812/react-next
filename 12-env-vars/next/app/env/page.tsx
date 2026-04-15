export default function EnvPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Env (Server Component)</h1>
      <p>PUBLIC: {process.env.NEXT_PUBLIC_KEY}</p>
      <p>SECRET (서버에서만): {process.env.SECRET_KEY}</p>
    </div>
  );
}
