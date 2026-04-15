// 파일만 두면 app/posts 세그먼트의 Suspense fallback으로 자동 연결
export default function Loading() {
  return <div style={{ padding: 24 }}>Loading posts... (app/posts/loading.tsx 자동)</div>;
}
