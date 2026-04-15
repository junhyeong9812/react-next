# 10-caching — 캐싱 전략

## 증명하려는 것

- React: 브라우저 캐시/SWR 라이브러리 수준의 캐싱
- Next: 4종 캐시 (Request Memoization, Data Cache, Full Route Cache, Router Cache) + `revalidateTag`로 선택적 무효화

## 서비스

| 서비스 | 포트 |
|---|---|
| backend | 8080 |
| react | 3011 |
| next | 3012 |

## 페이지

- `/posts` 목록 (여러 번 새로고침)
- `/admin/revalidate` 버튼 (Next 전용) → `revalidateTag('posts')` 호출

## 실험

1. 양쪽에서 `/posts` 10번 새로고침
2. `docker compose logs backend | grep "/api/posts" | wc -l` → 백엔드 호출 횟수 비교
3. Next: `/admin/revalidate` 누른 뒤 다시 10번 새로고침 → 1회만 증가

## 예상 결과

| 동작 | react 백엔드 호출 | next 백엔드 호출 |
|---|---|---|
| 10번 새로고침 | 10회 (no-cache) | 1회 (Data Cache + Full Route Cache) |
| 추가 10번 | 20회 | 1회 (누적) |
| revalidateTag 후 10번 | N/A | 2회 (1회 무효화 + 1회 재생성, 이후 캐시) |

## 학습 포인트

- **Request Memoization**: 같은 렌더 사이클 내 같은 fetch는 1회만 실행
- **Data Cache**: `fetch` 결과를 서버 파일시스템 캐시에 저장, 재배포 간 유지
- **Full Route Cache**: 빌드된 HTML 캐시
- **Router Cache**: 클라 사이드 네비게이션 캐시
- `revalidateTag('posts')` 한 줄로 "posts 태그 붙은 모든 fetch" 무효화

## 관련 phase

- 03-ssg: Full Route Cache의 정적 버전
- 04-isr: Data Cache + 시간 기반 무효화
