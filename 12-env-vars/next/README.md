# 12-env-vars/next — process.env 서버 전용

## 구현

```tsx
// app/env/page.tsx (Server Component)
export default function EnvPage() {
  const publicKey = process.env.NEXT_PUBLIC_KEY;
  const secretKey = process.env.SECRET_KEY;  // 서버에서만 읽힘
  return (
    <div>
      <p>PUBLIC: {publicKey}</p>
      <p>SECRET (서버에서 읽음): {secretKey}</p>
    </div>
  );
}
```

```tsx
// app/client-demo/page.tsx
'use client';
export default function ClientDemo() {
  return (
    <div>
      <p>PUBLIC: {process.env.NEXT_PUBLIC_KEY}</p>
      {/* SECRET_KEY는 클라 컴포넌트에서 읽으면 undefined */}
    </div>
  );
}
```

## 예상 결과

```bash
docker exec next grep "this-is-public" .next/static -r
# 매치됨 (NEXT_PUBLIC_*은 클라 번들에 박힘)

docker exec next grep "this-is-secret" .next/static -r
# 매치 없음

docker exec next grep "this-is-secret" .next/server -r
# 매치됨 (서버 번들에만)
```

## 학습 포인트

- `NEXT_PUBLIC_` prefix = "이건 클라에 노출됨" 명시적 표시
- prefix 없는 변수는 서버에서만 → 실수로 노출할 수 없는 구조
- 서버 번들과 클라 번들이 분리된다는 게 이걸 가능케 함
