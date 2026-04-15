# 11-error-loading/next — error.tsx / loading.tsx

## 구현

```
app/posts/
├── loading.tsx     # 자동 Suspense fallback
├── error.tsx       # 자동 ErrorBoundary
├── page.tsx
└── [id]/
    ├── loading.tsx
    ├── error.tsx
    └── page.tsx
```

```tsx
// app/posts/[id]/error.tsx
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>에러 발생</h2>
      <p>{error.message}</p>
      <button onClick={reset}>다시 시도</button>
    </div>
  );
}
```

```tsx
// app/posts/[id]/loading.tsx
export default function Loading() {
  return <div>Loading post...</div>;
}
```

## 자동 동작

- 파일만 있으면 라우트 세그먼트에 자동 주입
- `reset` 함수도 자동 제공
- 중첩 라우트에서 세그먼트별 다른 경계 구성 가능

## 예상 결과

- `/posts/999` 진입 → `error.tsx` 렌더
- `/posts` 로딩 중 → `loading.tsx` 렌더
