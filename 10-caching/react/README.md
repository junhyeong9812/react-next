# 10-caching/react — 브라우저 캐시 / SWR

## 구현

### 기본 (no cache)
```tsx
useEffect(() => {
  fetch(BASE + '/api/posts').then(r => r.json()).then(setPosts);
}, []);
```
→ 매 진입마다 백엔드 호출

### SWR 사용
```tsx
import useSWR from 'swr';
const { data } = useSWR('/api/posts', fetcher);
```
→ 탭 포커스/재진입 시 stale-while-revalidate

## 한계

- 브라우저/탭 단위 캐시. 서버 사이드 캐시 없음
- 전역 무효화 어려움 (수동으로 SWR `mutate` 호출)
- 배포 간 캐시 지속 불가

## 예상 결과

`docker compose logs backend`에 새로고침 횟수만큼 `GET /api/posts` 로그 쌓임.
