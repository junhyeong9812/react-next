'use client';

import { useState } from 'react';

export default function AdminRevalidatePage() {
  const [result, setResult] = useState<string>('');

  const onClick = async () => {
    const res = await fetch('/api/revalidate');
    const json = await res.json();
    setResult(JSON.stringify(json));
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Admin / Revalidate</h1>
      <p>버튼 클릭 시 <code>revalidateTag(&apos;posts&apos;)</code> 가 호출된다.</p>
      <button onClick={onClick}>Revalidate Posts</button>
      {result && <pre style={{ marginTop: 12 }}>{result}</pre>}
    </div>
  );
}
