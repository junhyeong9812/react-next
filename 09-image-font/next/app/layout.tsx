import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata = { title: '09-image-font / Next' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <nav style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
          <Link href="/" style={{ marginRight: 12 }}>Home</Link>
          <Link href="/gallery">Gallery</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
