import Link from 'next/link'

export const metadata = {
  title: 'next-app',
  description: '01-routing next app'
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <nav style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #ddd' }}>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/posts">Posts</Link>
          <Link href="/weather">Weather</Link>
        </nav>
        <main style={{ padding: 16 }}>{children}</main>
      </body>
    </html>
  )
}
