import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ padding: '8px' }}>
      <h2>Home</h2>
      <p>
        Go to <Link href="/posts-slow">/posts-slow</Link> to see Next streaming with
        <code> loading.tsx</code>.
      </p>
    </div>
  );
}
