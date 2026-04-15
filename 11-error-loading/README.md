# 11-error-loading — Error / Loading Boundary

## 증명하려는 것

- React: ErrorBoundary 클래스 컴포넌트 수동 작성, Suspense fallback 수동 배치
- Next: `error.tsx`, `loading.tsx` 파일만 두면 라우트 단위 자동 경계

## 서비스

| 서비스 | 포트 |
|---|---|
| backend | 8080 |
| react | 3111 |
| next | 3112 |

## 페이지

- `/posts/999` — 존재하지 않는 id (backend가 404 반환)
- `/posts` — 300ms 지연 → Loading 상태 관찰

## 실행

```bash
cd 11-error-loading
docker compose up --build
```

## 예상 결과

| 케이스 | react | next |
|---|---|---|
| `/posts/999` 진입 | ErrorBoundary catch → 에러 UI (수동 구현) | `error.tsx` 자동 렌더 |
| `/posts` 로딩 중 | Suspense fallback 수동 또는 `isLoading` 플래그로 처리 | `loading.tsx` 자동 렌더 |
| 에러 리셋 | 버튼 onClick으로 state 초기화 | `reset()` 함수가 props로 자동 주입 |

## 학습 포인트

- Next의 파일 컨벤션이 "라우트 세그먼트 = 경계"를 자연스럽게 만듦
- React도 가능하지만, 경계를 어디에 둘지 개발자가 매번 설계
- 중첩 라우트 경계에서 Next의 이점이 커짐 (각 segment마다 error/loading)
