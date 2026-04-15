import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata = { title: '07-seo-metadata / Next' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <nav style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
          <Link href="/" style={{ marginRight: 12 }}>Home</Link>
          <Link href="/posts/1" style={{ marginRight: 12 }}>Post 1</Link>
          <Link href="/posts/2">Post 2</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
