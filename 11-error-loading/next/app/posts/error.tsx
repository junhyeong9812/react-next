'use client';

// 'use client' 필수 · reset prop 자동 주입
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: 24, border: '1px solid #f33', margin: 16 }}>
      <h2>목록 에러 (app/posts/error.tsx 자동)</h2>
      <p>{error.message}</p>
      <button onClick={reset}>다시 시도</button>
    </div>
  );
}
