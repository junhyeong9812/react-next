# 12-env-vars/react — VITE_* 번들 박제

## 구현

```tsx
// pages/Env.tsx
export default function Env() {
  return (
    <div>
      <p>PUBLIC: {import.meta.env.VITE_PUBLIC_KEY}</p>
      {/* SECRET은 접근 방법 없음. 쓰려 해도 undefined */}
    </div>
  );
}
```

## 빌드 타임 주입

`Dockerfile`:
```
ARG VITE_PUBLIC_KEY
ENV VITE_PUBLIC_KEY=$VITE_PUBLIC_KEY
RUN npm run build
```

## 예상 결과

```bash
# 번들에 박혀있음
docker exec react grep -oE "this-is-public" dist/assets/*.js | head
# this-is-public
```

## 한계

- 서버가 없음 → "서버 전용 변수"라는 개념이 성립 불가
- 민감한 값은 아예 React 코드에 두면 안 되고, 백엔드 API로 위임해야 함
