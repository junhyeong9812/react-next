import type { ReactNode } from 'react';
import Link from 'next/link';

export const metadata = {
  title: '08-streaming/next',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>
          <h1>08-streaming/next</h1>
          <nav>
            <Link href="/">Home</Link> | <Link href="/posts-slow">Posts (slow)</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
