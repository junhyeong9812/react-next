export default function Gallery() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>갤러리</h1>
      <p style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
        커스텀 폰트는 index.html의 &lt;link&gt;로 수동 로드됩니다.
      </p>
      <img src="/photo1.jpg" alt="사진 1" />
      <img src="/photo2.jpg" alt="사진 2" />
      <img src="/photo3.jpg" alt="사진 3" />
    </div>
  );
}
