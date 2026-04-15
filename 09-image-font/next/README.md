# 09-image-font/next — next/image, next/font

## 구현

```tsx
import Image from 'next/image';
import { Noto_Sans_KR } from 'next/font/google';

const noto = Noto_Sans_KR({ subsets: ['latin'], display: 'swap' });

export default function Gallery() {
  return (
    <div className={noto.className}>
      <h1>갤러리</h1>
      <Image src="/photo1.jpg" alt="..." width={1200} height={800} />
      <Image src="/photo2.jpg" alt="..." width={1200} height={800} />
      <Image src="/photo3.jpg" alt="..." width={1200} height={800} />
    </div>
  );
}
```

## 자동 동작

- `next/image`
  - `srcset` 자동 생성 (여러 해상도)
  - 포맷 변환 (`.webp`/`.avif`)
  - `loading="lazy"` 기본
  - 레이아웃 고정 (CLS 방지)
- `next/font`
  - 빌드 타임에 구글 폰트 다운로드 → self-host
  - `font-display: swap` 기본
  - preload `<link>` 자동 주입

## 예상 Lighthouse 점수

- CLS: 0.00 수준
- LCP: 이미지 최적화로 1~2초 개선
- Performance 점수: React 대비 20~40점 상승
