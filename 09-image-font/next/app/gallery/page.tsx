import Image from 'next/image';
import { Noto_Sans_KR } from 'next/font/google';

const noto = Noto_Sans_KR({ subsets: ['latin'], display: 'swap' });

export default function Gallery() {
  return (
    <div className={noto.className} style={{ padding: 24 }}>
      <h1>갤러리</h1>
      <p>next/font가 빌드 타임에 폰트를 self-host, next/image가 width/height로 CLS를 방지합니다.</p>
      <Image src="/photo1.jpg" alt="사진 1" width={1200} height={800} />
      <Image src="/photo2.jpg" alt="사진 2" width={1200} height={800} />
      <Image src="/photo3.jpg" alt="사진 3" width={1200} height={800} />
    </div>
  );
}
