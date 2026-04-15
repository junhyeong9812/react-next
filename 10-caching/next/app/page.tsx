export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1>10-caching / Next</h1>
      <p>
        /posts 는 Data Cache (tags: [&apos;posts&apos;]) 에 저장된다. 반복 진입 시 백엔드 호출 없음.
      </p>
      <p>
        /admin/revalidate 버튼으로 <code>revalidateTag(&apos;posts&apos;)</code> 호출 → 다음 요청 1회만 재생성.
      </p>
    </div>
  );
}
