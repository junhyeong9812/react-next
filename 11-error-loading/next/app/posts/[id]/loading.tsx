// app/posts/[id] 세그먼트 자동 Suspense fallback
export default function Loading() {
  return <div style={{ padding: 24 }}>Loading post... (app/posts/[id]/loading.tsx 자동)</div>;
}
