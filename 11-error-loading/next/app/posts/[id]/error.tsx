'use client';

// 세그먼트별 경계: posts/[id]의 에러만 여기서 처리
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: 24, border: '1px solid #f33', margin: 16 }}>
      <h2>상세 에러 (app/posts/[id]/error.tsx 자동)</h2>
      <p>{error.message}</p>
      <button onClick={reset}>다시 시도</button>
    </div>
  );
}
