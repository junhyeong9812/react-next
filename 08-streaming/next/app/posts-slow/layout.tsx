import type { ReactNode } from 'react';

export default function PostsSlowLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex' }}>
      <aside
        style={{
          width: '200px',
          borderRight: '1px solid #ccc',
          padding: '8px',
        }}
      >
        <p>Sidebar (rendered immediately)</p>
        <ul>
          <li>Menu A</li>
          <li>Menu B</li>
          <li>Menu C</li>
        </ul>
      </aside>
      <section style={{ flex: 1, padding: '8px' }}>
        <h2>Posts (slow)</h2>
        <p>Shell streams immediately. Body waits for the 2s API.</p>
        {children}
      </section>
    </div>
  );
}
