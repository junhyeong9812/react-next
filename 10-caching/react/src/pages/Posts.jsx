import useSWR from 'swr';

const BASE = import.meta.env.VITE_API_BASE;

// 브라우저/탭 단위 캐시. 서버 사이드 캐시 없음.
// 탭 포커스/재진입 시 자동 재검증 → 매번 백엔드 호출.
const fetcher = (url) => fetch(url).then((r) => r.json());

export default function Posts() {
  const { data, error, isLoading, mutate } = useSWR(`${BASE}/api/posts`, fetcher, {
    revalidateOnFocus: true,
    revalidateOnMount: true,
  });

  if (isLoading) return <div style={{ padding: 24 }}>loading...</div>;
  if (error) return <div style={{ padding: 24 }}>error</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Posts (React + SWR)</h1>
      <p style={{ color: '#888' }}>
        새로고침/탭 포커스마다 백엔드 호출이 누적된다. 전역 무효화는 수동 mutate 호출로만 가능.
      </p>
      <button onClick={() => mutate()} style={{ marginBottom: 12 }}>
        수동 재검증 (mutate)
      </button>
      <ul>
        {data?.map((p) => (
          <li key={p.id}>
            <strong>{p.title}</strong> — {p.author}
          </li>
        ))}
      </ul>
    </div>
  );
}
