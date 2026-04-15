# 06-api-route/react — 클라이언트 직접 호출

## 구현

```tsx
// Posts.tsx
useEffect(() => {
  fetch(import.meta.env.VITE_API_BASE + '/api/posts')
    .then(r => r.json())
    .then(setPosts);
}, []);
```

## 문제점

- `VITE_API_BASE`는 빌드 타임에 번들에 박힘 → 클라에 노출
- 네트워크 탭에서 백엔드 주소가 그대로 보임
- CORS 설정을 백엔드가 허용해줘야 함 (운영 복잡도 증가)
- 여러 API 조합이 필요하면 클라에서 N번 호출

## 예상 결과

```bash
docker exec react grep -oE "http://[a-z0-9.:]+/api" dist/assets/*.js | head
# http://localhost:8080/api
```
