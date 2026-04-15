# Next.js 서버 레이어 장점 — 심화 정리

## 1. 인증 리다이렉트 깜빡임 문제

### 왜 React SPA에서 깜빡임이 생기는가?

핵심 원인: **`index.html`을 받아야만 JS가 실행되고, JS가 실행되어야 인증 판단이 가능한 구조**

```
[ React SPA — /dashboard 비로그인 접근 ]

브라우저                    Nginx                   클라이언트 JS
  │                          │                          │
  │  GET /dashboard           │                          │
  │─────────────────────────▶│                          │
  │                          │  파일 없음 → fallback     │
  │  index.html 반환          │                          │
  │◀─────────────────────────│                          │
  │                          │                          │
  │  HTML 파싱 + JS 다운로드   │                          │
  │  ┌─────────────────────────────────────────────┐    │
  │  │ 😶 빈 화면 또는 대시보드 레이아웃 잠깐 보임     │    │
  │  └─────────────────────────────────────────────┘    │
  │                                                     │
  │  JS 실행 완료 ─────────────────────────────────────▶│
  │                                                     │  토큰 체크
  │                                                     │  localStorage.getItem('token')
  │                                                     │  → null
  │  ◀──────── window.location = '/login' ──────────────│
  │                                                     │
  │  😵 깜빡! /login으로 이동                             │
```

**문제의 본질:**
- Nginx는 인증 상태를 모름 → 무조건 `index.html` 반환
- `index.html`이 로드되어야 JS가 실행됨
- JS가 실행되어야 "로그인 안 했다"는 판단 가능
- 판단 전까지 이미 화면이 그려지기 시작함 → **깜빡임**

### Next.js는 왜 깜빡임이 없는가?

```
[ Next.js — /dashboard 비로그인 접근 ]

브라우저                    미들웨어                  페이지
  │                          │                        │
  │  GET /dashboard           │                        │
  │─────────────────────────▶│                        │
  │                          │                        │
  │                          │  쿠키에서 토큰 확인      │
  │                          │  → 토큰 없음            │
  │                          │                        │
  │  302 Redirect → /login   │                        │
  │◀─────────────────────────│   (페이지 도달 안 함)    │
  │                          │                        │
  │  /login 페이지 요청/렌더링  │                        │
  │  ✅ 깜빡임 없음            │                        │
```

**핵심 차이:**
- 미들웨어는 **HTTP 요청 단계**에서 동작
- HTML을 보내기 **전에** 인증 판단 완료
- `/dashboard`의 어떤 콘텐츠도 브라우저에 도달하지 않음

### 예제 코드 비교

```tsx
// ❌ React SPA — 클라이언트에서 판단 (깜빡임 발생)
function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
    }
    setChecking(false);
  }, []);

  // checking 동안 빈 화면 or 로딩 스피너 보임
  if (checking) return <Loading />;  // ← 이게 "깜빡임"
  return children;
}
```

```typescript
// ✅ Next.js — 서버에서 판단 (깜빡임 없음)
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    // HTML 자체를 안 보냄 → 브라우저는 /dashboard를 한 번도 못 봄
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
```

---

## 2. 다국어(i18n) 처리 방식 차이

### 방식 A: 클라이언트 번역 (React SPA 일반적 방식)

URL은 하나, 같은 페이지에서 텍스트만 교체하는 방식

```
URL: /products  (언어 상관없이 동일)

┌─────────────────────────────────────────┐
│           브라우저 내부 처리               │
│                                         │
│  index.html 로드                         │
│       ↓                                 │
│  JS 실행                                │
│       ↓                                 │
│  쿠키/localStorage에서 언어 설정 읽기     │
│  (또는 navigator.language)               │
│       ↓                                 │
│  i18next가 해당 언어 번역 파일 적용       │
│       ↓                                 │
│  props로 텍스트 렌더링                    │
│                                         │
│  "상품 목록" (ko) or "Products" (en)     │
└─────────────────────────────────────────┘
```

```tsx
// React SPA — i18next로 클라이언트 번역
import { useTranslation } from 'react-i18next';

function ProductsPage() {
  const { t, i18n } = useTranslation();

  // 쿠키나 localStorage에서 언어 설정 로드
  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'ko';
    i18n.changeLanguage(savedLang);
  }, []);

  return (
    <main>
      <h1>{t('products.title')}</h1>  {/* "상품 목록" or "Products" */}
      <button onClick={() => i18n.changeLanguage('en')}>EN</button>
      <button onClick={() => i18n.changeLanguage('ko')}>KO</button>
    </main>
  );
}
```

**특징:**
- 깜빡임 거의 없음 (리다이렉트가 아니라 텍스트만 교체)
- URL이 하나 → 구현 간단
- SEO 관점에서 다국어 페이지로 인식 안 됨 ❌

### 방식 B: URL 기반 다국어 (Next.js 서버 레벨 분기)

언어별 URL이 다르고, 서버가 첫 진입 시 적절한 URL로 보내주는 방식

```
URL 구조:
  /ko/products  → 한국어 상품 페이지
  /en/products  → 영어 상품 페이지

┌──────────┐          ┌────────────────┐          ┌──────────────┐
│ 브라우저  │─────────▶│  미들웨어       │─────────▶│  페이지       │
│          │          │                │          │              │
│ GET /    │          │ Accept-Language │          │ /ko/products │
│          │          │ 헤더 확인       │          │ (한국어 SSR) │
│          │◀─────────│                │          │              │
│          │ 302 /ko  │ ko → /ko 리다이렉트        │              │
│          │          │ en → /en 리다이렉트        │              │
└──────────┘          └────────────────┘          └──────────────┘
```

```typescript
// middleware.ts — 서버 레벨 언어 분기
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPPORTED_LOCALES = ['ko', 'en', 'ja'];
const DEFAULT_LOCALE = 'ko';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 이미 언어 경로가 있으면 통과
  const hasLocale = SUPPORTED_LOCALES.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  if (hasLocale) return NextResponse.next();

  // 첫 진입 시 Accept-Language 헤더에서 언어 감지
  const acceptLang = request.headers.get('accept-language') || '';
  const detectedLocale = SUPPORTED_LOCALES.find(
    locale => acceptLang.includes(locale)
  ) || DEFAULT_LOCALE;

  // HTML 보내기 전에 맞는 언어 경로로 리다이렉트
  return NextResponse.redirect(
    new URL(`/${detectedLocale}${pathname}`, request.url)
  );
}
```

```
// 폴더 구조
app/
├── [locale]/
│   ├── layout.tsx
│   ├── page.tsx
│   └── products/
│       └── page.tsx      ← /ko/products, /en/products 모두 이 파일
├── dictionaries/
│   ├── ko.json           ← { "products": { "title": "상품 목록" } }
│   └── en.json           ← { "products": { "title": "Products" } }
```

```tsx
// app/[locale]/products/page.tsx — Server Component
import { getDictionary } from '@/dictionaries';

async function ProductsPage({ params }: { params: { locale: string } }) {
  // 서버에서 언어별 데이터 로드 (클라이언트에 번역 파일 안 보냄)
  const dict = await getDictionary(params.locale);

  return (
    <main>
      <h1>{dict.products.title}</h1>
    </main>
  );
}

export default ProductsPage;
```

### 두 방식의 차이 정리

```
┌──────────────────┬──────────────────────────┬──────────────────────────┐
│       항목        │  클라이언트 번역 (SPA)     │  URL 기반 (Next.js)      │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ URL 구조          │ /products (단일)          │ /ko/products, /en/...    │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ 번역 시점         │ JS 실행 후 클라이언트      │ 서버에서 렌더링 시         │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ 첫 진입 분기      │ JS 실행 후 판단           │ 미들웨어가 HTTP 단계에서   │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ SEO              │ 단일 URL → 다국어 인식 ❌  │ 언어별 URL → 크롤러 인식 ✅│
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ hreflang 태그     │ 의미 없음 (URL 동일)      │ 언어별 URL 연결 가능      │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ 번역 파일 위치     │ JS 번들에 포함 (용량 증가) │ 서버에만 존재 (번들 경량)  │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ 깜빡임            │ 거의 없음 (텍스트 교체)    │ 없음 (서버에서 완성)      │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ 적합한 경우        │ 내부 어드민, 앱           │ 공개 서비스, 글로벌 서비스  │
└──────────────────┴──────────────────────────┴──────────────────────────┘
```

### SEO에서 중요한 hreflang

```html
<!-- Next.js URL 기반 다국어일 때만 의미 있음 -->
<head>
  <link rel="alternate" hreflang="ko" href="https://example.com/ko/products" />
  <link rel="alternate" hreflang="en" href="https://example.com/en/products" />
  <link rel="alternate" hreflang="ja" href="https://example.com/ja/products" />
</head>

<!-- Google 크롤러가 각 언어별 페이지를 별도로 인덱싱 -->
<!-- React SPA는 URL이 하나이므로 이 태그가 의미 없음 -->
```

---

## 3. 서버 레벨 처리가 유의미한 경우 vs 아닌 경우

모든 상황에서 Next.js 서버 레벨 처리가 필요한 건 아님.
언제 의미가 있는지 구분하는 것이 중요.

### 서버 레벨이 유의미한 경우

```
┌───────────────────────────────────────────────────────────────────┐
│                    서버 레벨 처리가 필요한 경우                      │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. 인증 리다이렉트                                                │
│     → 비로그인 사용자가 보호된 페이지 접근 시                        │
│     → JS 로드 전에 판단해야 깜빡임 방지                             │
│                                                                   │
│  2. URL 기반 다국어 + SEO                                         │
│     → /ko/..., /en/... 구조가 필요할 때                            │
│     → 검색엔진이 언어별 페이지를 별도 인덱싱해야 할 때               │
│                                                                   │
│  3. API Key / 시크릿 은닉                                         │
│     → 외부 API 키가 클라이언트에 노출되면 안 될 때                   │
│                                                                   │
│  4. 다중 API 조합 (BFF)                                           │
│     → 여러 마이크로서비스 응답을 합쳐야 할 때                        │
│     → 내부 API 주소를 숨겨야 할 때                                  │
│                                                                   │
│  5. SEO가 중요한 공개 페이지                                       │
│     → 상품 목록, 블로그, 랜딩 페이지 등                             │
│     → 크롤러가 완성된 HTML을 받아야 할 때                           │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### 클라이언트 처리로 충분한 경우

```
┌───────────────────────────────────────────────────────────────────┐
│                   굳이 서버 레벨이 필요 없는 경우                    │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. 내부 어드민 페이지                                             │
│     → SEO 불필요, 로그인한 사용자만 사용                            │
│     → React SPA + 클라이언트 라우팅으로 충분                        │
│                                                                   │
│  2. 단순 다국어 텍스트 교체                                        │
│     → URL 분리 불필요, 같은 페이지에서 언어만 바꿈                   │
│     → i18next + 쿠키/localStorage로 충분                          │
│                                                                   │
│  3. 대시보드/SaaS 도구                                            │
│     → 로그인 후 사용하는 앱                                        │
│     → 검색엔진 노출 불필요                                         │
│                                                                   │
│  4. 단일 API 호출                                                 │
│     → 백엔드가 하나이고 CORS 설정으로 충분할 때                     │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### 판단 플로우차트

```
프로젝트 시작
    │
    ├── SEO가 중요한가?
    │   ├── YES → Next.js (SSR/SSG)
    │   └── NO ──┐
    │            │
    │            ├── API Key 은닉이 필요한가?
    │            │   ├── YES → Next.js (Route Handler)
    │            │   └── NO ──┐
    │            │            │
    │            │            ├── 인증 깜빡임이 신경 쓰이는가?
    │            │            │   ├── YES → Next.js (미들웨어)
    │            │            │   └── NO ──┐
    │            │            │            │
    │            │            │            └── React SPA로 충분
    │            │            │
    │            ├── 다국어 URL 분리가 필요한가?
    │            │   ├── YES → Next.js (미들웨어 + [locale] 라우팅)
    │            │   └── NO → i18next 클라이언트 처리로 충분
    │            │
    │            └── 여러 API를 합쳐야 하는가?
    │                ├── YES → Next.js (BFF 패턴)
    │                └── NO → React SPA로 충분
```

---

## 4. 전체 요약

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Next.js 서버 레이어의 본질:                                      │
│                                                                 │
│  "클라이언트와 백엔드 사이에 내가 컨트롤할 수 있는                  │
│   서버가 하나 있다"                                               │
│                                                                 │
│  이 서버가 할 수 있는 일:                                         │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  1. 게이트웨이  — 인증 처리, 토큰 관리                 │       │
│  │  2. 프록시      — API Key 은닉, 요청 중계              │       │
│  │  3. BFF        — 다중 API 조합, 응답 가공              │       │
│  │  4. 렌더러      — SSR, SEO 대응                       │       │
│  │  5. 미들웨어    — 리다이렉트, 언어 분기, A/B 테스트      │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                 │
│  하지만 모든 프로젝트에 필요한 건 아님.                             │
│  내부 어드민, SEO 불필요, 단순 SPA → React로 충분.                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
