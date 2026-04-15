import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata = { title: '06-api-route / Next' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <nav style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
          <Link href="/" style={{ marginRight: 12 }}>Home</Link>
          <Link href="/posts">Posts</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
