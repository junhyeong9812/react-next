# 설계 문서: React vs Next.js 체화 프로젝트

## 요구사항

- React와 Next.js의 차이를 **실제 동작과 코드**로 비교 체험
- 주제별로 폴더를 나눠 같은 기능을 각 프레임워크로 구현
- Nginx 래핑 차이도 배포 관점에서 보여줌
- 백엔드는 **공통 Kotlin(Spring Boot) 서버** 하나로 고정 → 프레임워크 차이만 부각
- `docker compose up`으로 phase별 한 번에 기동
- 각 phase 폴더는 **완전 독립**(의존성/설정 중복 허용, 가독성 우선)

## 제약조건

- 예제용 프로젝트 → DRY보다 독립성/가독성 우선
- Docker 기반 실행 (로컬 Node 설치 의존 최소화)
- 백엔드는 엔드포인트 3개로 제한하여 단순 유지
- 커밋 메시지: `feat:title` 한 줄, Claude 서명 금지

## 선택 확정 사항

| 항목 | 결정 |
|---|---|
| 백엔드 프레임워크 | **Spring Boot (Kotlin)** |
| 엔드포인트 | `/api/posts`, `/api/posts/{id}`, `/api/weather?city=` (API Key 필요) |
| 인위적 지연 | `delay 300ms` 삽입 (SSR/CSR 체감용) |
| compose 범위 | phase별 독립 compose (루트 일괄 compose 없음) |
| 폴더 구조 | 주제별 넘버링 (01~12), 내부에 react/next 병렬 배치 |
| Phase 범위 | **12개 전부 구현** |

---

## 전체 폴더 구조

```
react-next/
├── backend/                       # 공통 Kotlin Spring Boot 서버
│   ├── src/main/kotlin/com/example/demo/
│   │   ├── DemoApplication.kt
│   │   ├── controller/PostController.kt
│   │   ├── controller/WeatherController.kt
│   │   └── config/CorsConfig.kt
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── data/
│   │       ├── posts.json         # id, title, body, author, updatedAt
│   │       └── weather.json       # city → temp, condition
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   └── Dockerfile
│
├── 01-routing/                    # 라우팅 + Nginx 래핑 + API Key 노출 비교
│   ├── react-bare/                # Vite build + serve, Nginx 없음
│   ├── react-nginx-broken/        # Nginx + try_files 없음 (404 재현)
│   ├── react-nginx-fixed/         # Nginx + try_files
│   ├── next-app/                  # next start
│   └── docker-compose.yml
│
├── 02-ssr/                        # Server Side Rendering
│   ├── react/                     # Express + renderToPipeableStream
│   └── next/                      # Server Component (async page)
│
├── 03-ssg/                        # Static Site Generation
│   ├── react/                     # Vite 프리렌더 스크립트
│   └── next/                      # generateStaticParams
│
├── 04-isr/                        # Incremental Static Regeneration
│   ├── react/                     # "왜 불가능한가" + 재빌드 스크립트로 흉내
│   └── next/                      # revalidate
│
├── 05-middleware/                 # 인증 리다이렉트 깜빡임
│   ├── react/                     # ProtectedRoute (클라 판단 → 깜빡임)
│   └── next/                      # middleware.ts (서버 판단 → 즉시)
│
├── 06-api-route/                  # API Route / BFF
│   ├── react/                     # 클라가 백엔드 직접 호출 (내부 주소 노출)
│   └── next/                      # Route Handler 경유 (BFF)
│
├── 07-seo-metadata/               # <head> 관리와 크롤러 시점 HTML
│   ├── react/                     # react-helmet (빈 HTML + 클라 주입)
│   └── next/                      # metadata export (완성 HTML)
│
├── 08-streaming/                  # Streaming SSR / Suspense
│   ├── react/                     # renderToPipeableStream 수동
│   └── next/                      # loading.tsx + <Suspense>
│
├── 09-image-font/                 # 이미지/폰트 최적화
│   ├── react/                     # <img>, <link> 수동 (CLS 발생)
│   └── next/                      # next/image, next/font
│
├── 10-caching/                    # 캐싱 전략
│   ├── react/                     # 브라우저 캐시/SWR 정도
│   └── next/                      # fetch cache + revalidateTag 시연
│
├── 11-error-loading/              # 에러/로딩 경계
│   ├── react/                     # ErrorBoundary + Suspense 수동
│   └── next/                      # error.tsx + loading.tsx 자동
│
├── 12-env-vars/                   # 환경변수 노출
│   ├── react/                     # VITE_* 번들 박제 (grep으로 보임)
│   └── next/                      # process.env 서버 전용
│
└── docs/
    ├── designs/
    │   └── project-design.md      # 이 문서
    └── results/                    # 실험 스크린샷/curl 결과/grep 증거
        ├── 01-routing/
        ├── 02-ssr/
        └── ...
```

각 phase의 `react/`·`next/`에는 자체 `Dockerfile`과 phase 루트에 `docker-compose.yml`이 들어간다. 백엔드는 각 compose에서 `../backend`를 build context로 공유한다.

---

## 백엔드 설계

### 엔드포인트 3개

| 메서드 경로 | 반환 | 특이사항 |
|---|---|---|
| `GET /api/posts` | `posts.json` 전체 배열 | `delay 300ms` |
| `GET /api/posts/{id}` | 단건 + `updatedAt` | 04-isr에서 값 변경 확인용 |
| `GET /api/weather?city=` | 날씨 JSON | `X-API-Key` 헤더 필수, 없으면 401 |

### 데이터 파일

- `posts.json`: `[{ id, title, body, author, updatedAt }]` 최소 5건
- `weather.json`: `{ "seoul": {...}, "tokyo": {...}, "newyork": {...} }`
- `updatedAt`은 서버 기동 시점 or 파일 최종 수정 시각으로 세팅 → ISR 시연 시 수동 갱신 가능

### 포트

- 컨테이너 내부: `8080`
- 호스트 매핑: `8080:8080` (React SPA가 브라우저에서 직접 호출해야 하므로 노출 필수)
- Docker 네트워크 내부 이름: `backend`

### API Key

- 환경변수 `API_KEY=demo-secret-key`로 Spring Boot 쪽에 주입
- `/api/weather` 호출 시 헤더 검증
- 01/06/12 phase에서 "React는 이 키가 번들에 박혀 노출", "Next는 서버 Route Handler에서만 사용"을 시연

---

## Phase별 실험 시나리오

### 01-routing

| 서비스 | 포트 | 검증 포인트 |
|---|---|---|
| backend | 8080 | `/api/weather` 키 검증 |
| react-bare | 3001 | `/about` 직접 접속 → 404 |
| react-nginx-broken | 3002 | Nginx 레벨에서도 404 재현 |
| react-nginx-fixed | 3003 | `try_files`로 해결 |
| next-app | 3004 | 새로고침 OK + SSR HTML |

**체크리스트:**
1. 각 포트에서 `/` 진입 후 Link 클릭 → OK
2. 각 포트에서 `/about` 직접 접속 / F5 → 1,2번 fail, 3,4번 success
3. `curl http://localhost:PORT/ | grep title` → 1~3번 빈 HTML, 4번 완성 HTML
4. DevTools 네트워크 탭에서 weather 요청 → React 번들에 API 키 노출 확인

### 02-ssr

- 같은 `/posts` 페이지를 React는 Express SSR, Next는 Server Component로 구현
- `curl http://localhost:PORT/posts` 응답 HTML 비교 — 양쪽 다 완성 HTML 나와야 함
- **학습 포인트**: "React로도 SSR은 된다, 다만 본인이 Express 서버를 쓰고 renderToPipeableStream을 다뤄야 한다"

### 03-ssg

- 빌드 타임에 `/posts/1`, `/posts/2` 등을 HTML로 확정 생성
- `dist/` 또는 `.next/` 내부 HTML 파일 직접 열어 비교
- **학습 포인트**: Next는 `generateStaticParams` 한 함수, React는 프리렌더 스크립트 수동 작성

### 04-isr

- Next: `revalidate: 10` 설정 → 10초 후 재진입 시 `updatedAt` 반영
- React: 동일 동작이 불가능하다는 점을 코드/문서로 명시 + 대안(재빌드 트리거) 제시
- **학습 포인트**: "Next의 고유 기능"

### 05-middleware

- `/dashboard` 비로그인 접근
- React: 페이지 JS 로드 → useEffect에서 토큰 체크 → 리다이렉트 (깜빡임 발생)
- Next: `middleware.ts`가 HTTP 단계에서 302
- **검증**: 느린 네트워크(DevTools throttling)에서 React의 깜빡임이 명확히 보임

### 06-api-route

- React: `fetch('http://backend:8080/api/posts')` 직접 호출 → 내부 주소 노출
- Next: `/api/posts` Route Handler 경유 → 클라 네트워크 탭엔 `/api/posts`만 보임
- **학습 포인트**: BFF 패턴, 내부 API 은닉

### 07-seo-metadata

- `/posts/1` 상세 페이지의 `<title>`, `<meta og:title>` 설정
- React: react-helmet → `curl`로 받은 HTML엔 없고, JS 실행 후에만 주입됨
- Next: `metadata` export → `curl` 응답 HTML에 이미 들어있음
- **검증**: `curl -s http://localhost:PORT/posts/1 | grep og:title`

### 08-streaming

- `/posts`를 느린 API(300ms + 빠른 첫 렌더 슬롯)
- Next: `loading.tsx` + `<Suspense>`로 껍데기 먼저, 본문 스트리밍
- React: renderToPipeableStream + `<Suspense>` 수동 구성
- **학습 포인트**: Next가 라우트 단위 경계를 자동 제공

### 09-image-font

- 큰 이미지 3장 + 커스텀 웹폰트
- React: `<img>` 그대로, `<link>` 수동 → Lighthouse CLS/LCP 낮음
- Next: `next/image` + `next/font` → 자동 최적화
- **검증**: Lighthouse 점수 스크린샷

### 10-caching

- `/posts` 목록 fetch에 캐시 전략 차이
- React: 브라우저 캐시 헤더 정도
- Next: `fetch(..., { next: { revalidate: N, tags: ['posts'] } })` + `revalidateTag` 시연
- **검증**: 재진입 시 서버 로그에 fetch 요청이 뜨는지/안 뜨는지

### 11-error-loading

- `/posts/999` (존재하지 않는 ID) 처리
- React: 수동 ErrorBoundary + Suspense fallback
- Next: `error.tsx`, `loading.tsx` 파일만 두면 자동 연결
- **학습 포인트**: 파일 컨벤션 기반 자동 경계

### 12-env-vars

- `PUBLIC_KEY`, `SECRET_KEY` 두 개 주입
- React(Vite): `VITE_PUBLIC_KEY`만 노출, `SECRET_KEY`는 사용 불가 (서버가 없음)
  - 빌드 후 `grep -r "PUBLIC_KEY" dist/` → 번들에 박혀있음 확인
- Next: `NEXT_PUBLIC_*`는 클라 번들에, 그 외는 서버에서만 사용
  - `grep -r "SECRET_KEY" .next/` → Server Component에선 쓰이지만 클라 번들엔 없음

---

## Docker 공통 규칙

- 각 phase 루트에 `docker-compose.yml`
- 서비스명: `backend`, `react-bare`, `react-nginx-fixed`, `next-app` 등
- 백엔드는 phase마다 별도 빌드(이미지 캐시로 빠름) — `build: context: ../backend`
- 포트 매핑은 3000번대로 통일, 각 phase 내에서 충돌 없도록 할당
- Node 이미지는 `node:22-alpine`, Nginx는 `nginx:alpine`, Spring Boot는 `eclipse-temurin:21-jre-alpine` 기반 멀티스테이지

---

## 실행 방법 (각 phase)

```bash
cd 01-routing
docker compose up --build
# 브라우저 탭 4개 열기: localhost:3001~3004
# 각 탭에서 /about 새로고침 → 결과 비교
docker compose down
```

---

## 구현 순서 (권장)

1. **backend/** 구축 (전 phase가 의존)
2. **01-routing** (가장 강렬한 체감 포인트)
3. **02-ssr → 03-ssg → 04-isr** (렌더링 축)
4. **05-middleware → 06-api-route** (서버 레이어 축)
5. **07-seo-metadata** (01, 02, 06 결과의 연장)
6. **08-streaming → 09-image-font → 10-caching** (Next 최적화 축)
7. **11-error-loading → 12-env-vars** (편의성/보안 마무리)

phase 하나 끝날 때마다 `docs/results/XX-*/`에 curl 응답, 스크린샷, 비교 메모 남김.

---

## 구현 시 주의사항

- **phase 간 코드 공유 금지**: 같은 컴포넌트라도 복붙으로 각 phase 안에 독립 존재
- **백엔드만 유일한 공통 자원**: `../backend`를 build context로 참조
- **문서화 강제**: phase 루트에 `README.md`로 "이 phase에서 볼 것 / 재현 스텝" 기록
- **커밋 단위**: phase 하나 완료 시 `feat:01-routing 구현` 형태 한 줄 커밋
- **실패 재현을 지워버리지 않는다**: `react-nginx-broken`처럼 "깨진 상태"도 하나의 산출물. fix 브랜치로 덮지 않음

---

## 다음 단계

이 설계 문서를 기반으로 **구현 모드 2.계획** 단계로 전환:
- `stage-transition.sh 2`
- phase 0(backend) 착수 계획을 `docs/plan.md`로 작성
- 이후 phase 1부터 순차 진행, 각 phase 시작마다 mini plan 추가
