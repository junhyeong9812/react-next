import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata = {
  title: '11-error-loading / Next',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <nav style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
          <Link href="/" style={{ marginRight: 12 }}>Home</Link>
          <Link href="/posts" style={{ marginRight: 12 }}>Posts</Link>
          <Link href="/posts/1" style={{ marginRight: 12 }}>Post 1</Link>
          <Link href="/posts/999">Post 999 (404)</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
