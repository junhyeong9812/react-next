import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <header style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>
        <h1>08-streaming/react</h1>
        <nav>
          <a href="/">Home</a> | <a href="/posts-slow">Posts (slow)</a>
        </nav>
      </header>
      <div style={{ display: 'flex' }}>
        <aside style={{ width: '200px', borderRight: '1px solid #ccc', padding: '8px' }}>
          <p>Sidebar (rendered immediately)</p>
          <ul>
            <li>Menu A</li>
            <li>Menu B</li>
            <li>Menu C</li>
          </ul>
        </aside>
        <main style={{ flex: 1, padding: '8px' }}>{children}</main>
      </div>
    </div>
  );
}
