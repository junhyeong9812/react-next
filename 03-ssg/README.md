# 03-ssg — Static Site Generation

## 증명하려는 것

빌드 타임에 모든 페이지를 HTML로 확정 생성하는 전략. React는 프리렌더 스크립트 수동 작성, Next는 `generateStaticParams` 한 함수.

## 서비스

| 서비스 | 포트 | 스택 |
|---|---|---|
| backend | 8080 | `../backend` (빌드 타임에만 호출) |
| react | 3201 | Vite + 프리렌더 스크립트 → 정적 서버 |
| next | 3202 | Next.js `output: 'export'` 또는 기본 SSG |

## 페이지

- `/posts` 목록
- `/posts/[id]` 상세 (id 1~5)

## 실행

```bash
cd 03-ssg
docker compose up --build
```

## 예상 결과

### 빌드 결과물에 HTML 파일이 실제로 존재

```bash
docker exec react ls dist/posts
# 1/index.html   2/index.html   3/index.html ...

docker exec next ls .next/server/app/posts
# 1.html   2.html   ... (또는 out/posts/1.html)
```

### 런타임 백엔드 호출 없음

```bash
# 페이지 여러 번 진입해도 backend 로그에 요청이 안 쌓임
docker compose logs backend | grep "/api/posts"
# 빌드 시점 요청만 있고, 런타임엔 없음
```

## 학습 포인트

- SSG는 **빌드 타임 fetch**, SSR은 **요청 타임 fetch**
- React로 SSG를 구현하려면 빌드 스크립트에서 각 경로별 HTML을 직접 렌더해서 파일로 저장해야 함
- Next는 `generateStaticParams`로 id 리스트만 반환하면 프레임워크가 전부 처리
