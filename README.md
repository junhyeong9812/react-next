# React vs Next.js 체화 프로젝트

React와 Next.js의 차이를 **같은 기능을 양쪽으로 구현**해서 실제 동작과 코드로 체험하는 학습 프로젝트. 주제별로 12 phase, 각 phase 안에 react/next가 병렬 배치되어 있고, 공통 Kotlin 백엔드 하나를 공유해서 "프레임워크 차이" 외 변수를 제거했다.

## 구조

```
react-next/
├── backend/                   공통 Kotlin Spring Boot 서버 (3개 엔드포인트)
├── 01-routing/                라우팅 + Nginx 래핑 + API Key 노출
├── 02-ssr/                    Server Side Rendering
├── 03-ssg/                    Static Site Generation
├── 04-isr/                    Incremental Static Regeneration
├── 05-middleware/             인증 리다이렉트 깜빡임
├── 06-api-route/              API Route / BFF 패턴
├── 07-seo-metadata/           SEO <head> 관리
├── 08-streaming/              Streaming SSR / Suspense
├── 09-image-font/             이미지/폰트 최적화
├── 10-caching/                캐싱 전략
├── 11-error-loading/          Error/Loading Boundary
├── 12-env-vars/               환경변수 노출
└── docs/
    ├── concepts/              개념 정리 (읽기 자료)
    │   ├── react-vs-nextjs.md
    │   ├── nextjs-advantages.md
    │   └── nextjs-advantages-detail.md
    ├── designs/               설계 문서
    │   └── project-design.md
    └── results/               실험 결과 (스크린샷/로그)
```

## 핵심 설계 규칙

- **phase별 완전 독립**: 같은 컴포넌트라도 phase끼리 공유하지 않고 복사. 가독성/독립성 우선.
- **공통 자원은 backend뿐**: 각 phase의 docker-compose가 `../backend`를 build context로 참조.
- **각 phase의 README에 "예상 결과" 섹션**: curl/grep/DevTools 관찰 수준으로 구체화. 구현 검증 기준이자 학습의 핵심.

## Phase 개요

| # | 주제 | 핵심 체감 포인트 | 포트 (react / next) |
|---|---|---|---|
| 01 | 라우팅 + Nginx | `/about` 새로고침 → 404 재현, API Key 번들 노출 | 3001~3003 / 3004 |
| 02 | SSR | `curl` HTML에 글 제목 포함 | 3101 / 3102 |
| 03 | SSG | 빌드 결과물에 정적 HTML 존재 | 3201 / 3202 |
| 04 | ISR | `revalidate: 10` 후 값 갱신 | 3301 / 3302 |
| 05 | Middleware | 인증 리다이렉트 깜빡임 | 3501 / 3502 |
| 06 | API Route | 내부 API 주소 노출 vs 은닉 | 3601 / 3602 |
| 07 | SEO Metadata | og:title 초기 HTML 포함 | 3701 / 3702 |
| 08 | Streaming | 껍데기 먼저, 본문 스트리밍 | 3801 / 3802 |
| 09 | Image/Font | Lighthouse CLS/LCP | 3901 / 3902 |
| 10 | Caching | 재진입 시 백엔드 호출 횟수 | 3011 / 3012 |
| 11 | Error/Loading | 자동 vs 수동 경계 | 3111 / 3112 |
| 12 | Env Vars | 번들 grep 결과 | 3121 / 3122 |

## 실행 방법

각 phase는 독립 compose. **백엔드는 compose 내부에 포함**되어 있어 phase 폴더로 들어가서 띄우기만 하면 됨.

```bash
cd 01-routing
docker compose up --build

# 브라우저에서 README의 "체크리스트" 섹션대로 실험
# 끝나면
docker compose down
```

다른 phase를 띄울 때는 이전 phase를 내려야 함 (backend가 8080 포트를 공유).

## 백엔드 엔드포인트

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/posts` | 글 목록, 300ms 지연 |
| GET | `/api/posts/{id}` | 글 상세 |
| PATCH | `/api/posts/{id}` | 글 수정 (ISR 시연용) |
| GET | `/api/posts/slow` | 2초 지연 (streaming 시연용) |
| GET | `/api/weather?city=` | 날씨 (`X-API-Key` 헤더 필수) |

## 학습 진행 순서 제안

1. `docs/concepts/react-vs-nextjs.md` — 개념 예습
2. 01 → 02 → 03 → 04 (렌더링 축)
3. 05 → 06 → 07 (서버 레이어 축)
4. 08 → 09 → 10 (Next 최적화 축)
5. 11 → 12 (편의성/보안 마무리)

각 phase마다:
- README 읽기 → `docker compose up --build` → 체크리스트 실험 → `docs/results/XX-*/`에 관찰 메모

## 개념 참고 문서

- `docs/concepts/react-vs-nextjs.md` — React vs Next.js 핵심 차이 요약
- `docs/concepts/nextjs-advantages.md` — Next.js 서버 레이어의 장점
- `docs/concepts/nextjs-advantages-detail.md` — 인증/다국어/SEO 심화
- `docs/designs/project-design.md` — 이 프로젝트의 설계 문서

## 커밋 컨벤션

- `feat:title` 한 줄 (body/footer 없음)
