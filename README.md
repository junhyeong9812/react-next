# React vs Next.js 체화 프로젝트

같은 기능을 React와 Next.js로 각각 구현해서, **실제 동작과 코드**로 차이를 비교하고 체화하는 프로젝트.

## 구조

- `backend/` — 공통 Kotlin Spring Boot 서버 (전 phase 공유)
- `01-routing/` ~ `12-env-vars/` — 주제별 phase
- `docs/designs/project-design.md` — 전체 설계
- `docs/results/` — 실험 결과 스냅샷

## 실행 방법

```bash
# 백엔드 없이는 각 phase가 동작 안 함 → 각 phase compose에 backend 포함됨
cd 01-routing
docker compose up --build
```

각 phase 폴더의 `README.md`에 **해당 phase가 증명하려는 것 / 실행 스텝 / 예상 결과**가 정리되어 있음.

## Phase 목록

| # | 주제 | 핵심 체감 포인트 |
|---|---|---|
| 01 | 라우팅 + Nginx 래핑 | `/about` 새로고침 404 재현, API Key 노출 |
| 02 | SSR | `curl`로 받은 HTML에 콘텐츠 유무 |
| 03 | SSG | 빌드 결과물 HTML 파일 존재 여부 |
| 04 | ISR | `revalidate` 후 값 갱신 |
| 05 | 미들웨어/인증 | 리다이렉트 깜빡임 |
| 06 | API Route / BFF | 내부 API 주소 노출 |
| 07 | SEO Metadata | `<title>`, `<og:*>` 초기 HTML 포함 |
| 08 | Streaming SSR | 껍데기 먼저, 본문 스트리밍 |
| 09 | Image/Font 최적화 | Lighthouse CLS/LCP |
| 10 | 캐싱 전략 | 재진입 시 백엔드 호출 횟수 |
| 11 | Error/Loading Boundary | 자동 vs 수동 경계 |
| 12 | 환경변수 노출 | 번들 grep 결과 |

## 작업 방식

1. 스켈레톤 + 명세 문서 (이 리포지토리의 현재 상태)
2. phase 단위로 에이전트에 구현 위임
3. 예상 결과와 실제 결과 대조 검증
