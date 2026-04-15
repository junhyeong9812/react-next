# 09-image-font/react — `<img>`, `<link>` 수동

## 구현

```tsx
function Gallery() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR" rel="stylesheet" />
      <h1 style={{ fontFamily: 'Noto Sans KR' }}>갤러리</h1>
      <img src="/photo1.jpg" alt="..." />  {/* width/height 없음 */}
      <img src="/photo2.jpg" alt="..." />
      <img src="/photo3.jpg" alt="..." />
    </>
  );
}
```

## 예상 문제

- 이미지가 로드되며 제목/다른 요소가 밀려남 (CLS)
- 폰트 fetch 완료 전까지 기본 폰트로 표시 (FOUT) 또는 invisible text (FOIT)
- 원본 JPG 그대로 전송

## 이미지 파일

`public/photo1.jpg`, `photo2.jpg`, `photo3.jpg` — 최소 1MB 이상 대용량 권장 (Lighthouse 차이 극대화)
