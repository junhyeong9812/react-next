'use client';

export default function ClientDemo() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Client Demo (Client Component)</h1>
      <p>PUBLIC: {process.env.NEXT_PUBLIC_KEY}</p>
      <p style={{ color: '#888' }}>
        SECRET (클라에서 읽으면 undefined): {String(process.env.SECRET_KEY)}
      </p>
    </div>
  );
}
