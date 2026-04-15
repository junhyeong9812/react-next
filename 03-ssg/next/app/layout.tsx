import type { ReactNode } from 'react';
import Link from 'next/link';

export const metadata = {
  title: '03-ssg/next',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header>
          <Link href="/">Home</Link> | <Link href="/posts">Posts</Link>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
