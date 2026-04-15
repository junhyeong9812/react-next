# Next.js 서버 레이어의 장점

## 아키텍처 비교

### React SPA 구조

```
┌──────────┐       ┌─────────┐       ┌──────────────┐
│ 브라우저  │──────▶│  Nginx  │──────▶│  정적 파일    │
│          │◀──────│         │◀──────│  (HTML/JS)   │
└──────────┘       └─────────┘       └──────────────┘
     │
     │  API 호출 (토큰, API Key 노출 위험)
     ▼
┌──────────────┐
│  백엔드 API  │
└──────────────┘
```

- 브라우저가 직접 백엔드 API를 호출
- 토큰, API Key가 클라이언트 JS에 노출될 수 있음
- Nginx는 단순 정적 파일 서빙 역할만 수행

### Next.js 구조

```
┌──────────┐       ┌──────────────────────────────────┐       ┌──────────────┐
│ 브라우저  │──────▶│  Next.js (Node.js 서버)           │──────▶│  백엔드 API  │
│          │◀──────│                                  │◀──────│              │
└──────────┘       │  ┌────────────────────────────┐  │       └──────────────┘
                   │  │ 미들웨어 (인증, 리다이렉트)   │  │
                   │  ├────────────────────────────┤  │       ┌──────────────┐
                   │  │ SSR 렌더링                  │  │──────▶│  외부 API    │
                   │  ├────────────────────────────┤  │       │  (키 은닉)    │
                   │  │ API Route (BFF/프록시)       │  │       └──────────────┘
                   │  ├────────────────────────────┤  │
                   │  │ 토큰 관리 (httpOnly 쿠키)    │  │
                   │  └────────────────────────────┘  │
                   └──────────────────────────────────┘
```

- 브라우저는 Next.js 서버하고만 통신
- Next.js 서버가 게이트웨이/프록시 역할 수행
- 민감한 정보(토큰, API Key)가 서버에만 존재

---

## 1. 토큰 / 인증 처리 (서버 프록시)

### 요청 흐름

```
브라우저                   Next.js 서버                    백엔드 API
  │                            │                              │
  │  /api/users 요청            │                              │
  │  (httpOnly 쿠키 자동 포함)   │                              │
  │───────────────────────────▶│                              │
  │                            │  쿠키에서 토큰 추출            │
  │                            │  토큰 검증 / 만료 시 갱신      │
  │                            │                              │
  │                            │  Authorization: Bearer token  │
  │                            │─────────────────────────────▶│
  │                            │                              │
  │                            │◀─────────────────────────────│
  │  JSON 응답                  │                              │
  │◀───────────────────────────│                              │
```

### 예제 코드

```typescript
// app/api/users/route.ts (Route Handler)
import { cookies } from 'next/headers';

export async function GET() {
  // 1. httpOnly 쿠키에서 토큰 추출 (브라우저 JS로는 접근 불가)
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. 서버에서 백엔드 API 호출 (토큰이 서버에서만 사용됨)
  const res = await fetch('https://api.backend.com/users', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  // 3. 클라이언트에는 데이터만 반환 (토큰 노출 없음)
  return Response.json(data);
}
```

### React SPA에서는?

```typescript
// React SPA - 토큰이 클라이언트에 노출됨
const token = localStorage.getItem('token'); // ⚠️ XSS 공격에 취약

fetch('https://api.backend.com/users', {
  headers: {
    Authorization: `Bearer ${token}`, // ⚠️ 브라우저 네트워크 탭에 노출
  },
});
```

---

## 2. API Key 은닉

### 요청 흐름

```
브라우저                   Next.js 서버                    외부 API
  │                            │                              │
  │  /api/weather?city=seoul    │                              │
  │  (API Key 없이 요청)        │                              │
  │───────────────────────────▶│                              │
  │                            │  서버 환경변수에서 키 로드      │
  │                            │  WEATHER_API_KEY=xxxx         │
  │                            │                              │
  │                            │  ?key=xxxx&city=seoul         │
  │                            │─────────────────────────────▶│
  │                            │◀─────────────────────────────│
  │  JSON (키 없는 응답)        │                              │
  │◀───────────────────────────│                              │
```

### 예제 코드

```typescript
// app/api/weather/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  // 서버 환경변수 → 클라이언트에 절대 노출되지 않음
  const API_KEY = process.env.WEATHER_API_KEY;

  const res = await fetch(
    `https://api.weather.com/v1/current?key=${API_KEY}&city=${city}`
  );

  const data = await res.json();
  return Response.json(data);
}
```

```tsx
// 클라이언트 컴포넌트에서 호출
// API Key를 모른 채로 Next.js 서버에만 요청
const res = await fetch('/api/weather?city=seoul');
const data = await res.json();
```

### React SPA에서는?

```typescript
// React SPA - 빌드 시 JS에 키가 박힘
const API_KEY = process.env.REACT_APP_WEATHER_KEY;
// ⚠️ 빌드된 JS 파일에서 검색하면 키가 그대로 보임

fetch(`https://api.weather.com/v1/current?key=${API_KEY}&city=seoul`);
// ⚠️ 브라우저 네트워크 탭에서 키 확인 가능
```

---

## 3. BFF (Backend For Frontend)

### 요청 흐름

```
브라우저                   Next.js 서버                      백엔드들
  │                            │                              
  │  /api/dashboard             │       ┌─ GET /users ──────▶ User API
  │  (단일 요청)                │       │                      
  │───────────────────────────▶│───────┼─ GET /orders ─────▶ Order API
  │                            │       │                      
  │                            │       └─ GET /stats ──────▶ Analytics API
  │                            │                              
  │                            │  3개 응답을 하나로 합침         
  │  { user, orders, stats }   │                              
  │◀───────────────────────────│                              
```

### 예제 코드

```typescript
// app/api/dashboard/route.ts
export async function GET() {
  // 서버에서 여러 API를 병렬 호출
  const [userRes, orderRes, statsRes] = await Promise.all([
    fetch('https://user-api.internal/me', { headers: authHeaders() }),
    fetch('https://order-api.internal/recent', { headers: authHeaders() }),
    fetch('https://analytics-api.internal/stats', { headers: authHeaders() }),
  ]);

  const [user, orders, stats] = await Promise.all([
    userRes.json(),
    orderRes.json(),
    statsRes.json(),
  ]);

  // 클라이언트에는 조합된 데이터 한 번에 반환
  return Response.json({
    user,
    recentOrders: orders.slice(0, 5),
    todayStats: {
      revenue: stats.revenue,
      visitors: stats.visitors,
    },
  });
}
```

### React SPA에서는?

```typescript
// React SPA - 클라이언트에서 3번 요청
// ⚠️ 내부 API 주소가 클라이언트에 노출
// ⚠️ 네트워크 요청 3회 → 느림 (특히 모바일)
const user = await fetch('https://user-api.com/me');
const orders = await fetch('https://order-api.com/recent');
const stats = await fetch('https://analytics-api.com/stats');
```

---

## 4. 미들웨어 (요청 전처리)

### 요청 흐름

```
브라우저                      미들웨어                     페이지
  │                              │                          │
  │  /dashboard 요청              │                          │
  │─────────────────────────────▶│                          │
  │                              │  쿠키에서 토큰 확인        │
  │                              │                          │
  │                              │  [토큰 없음]              │
  │  302 → /login                │                          │
  │◀─────────────────────────────│                          │
  │                              │                          │
  │  [토큰 있음]                  │                          │
  │                              │  → 페이지 렌더링 진행 ───▶│
  │  HTML 응답                   │                          │
  │◀─────────────────────────────────────────────────────────│
```

### 예제 코드

```typescript
// middleware.ts (프로젝트 루트)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // 인증이 필요한 경로
  const protectedPaths = ['/dashboard', '/profile', '/settings'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  // 토큰 없으면 로그인 페이지로 리다이렉트
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 언어 감지 → 자동 리다이렉트
  if (pathname === '/') {
    const lang = request.headers.get('accept-language')?.split(',')[0];
    if (lang?.startsWith('ko')) {
      return NextResponse.redirect(new URL('/ko', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### React SPA에서는?

```tsx
// React SPA - 클라이언트에서 처리
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
    // ⚠️ JS 로드 후 실행되므로 빈 화면이 먼저 보임 (깜빡임)
    // ⚠️ 이미 페이지 리소스를 다 받은 뒤 리다이렉트
  }

  return children;
}
```

---

## 5. SSR + SEO

### 렌더링 비교

```
[ React SPA - 첫 로드 ]

서버 응답:
  <html>
    <body>
      <div id="root"></div>      ← 빈 HTML
      <script src="bundle.js">   ← JS 다운로드 후 렌더링
    </body>
  </html>

타임라인:
  HTML 수신 ──▶ JS 다운로드 ──▶ JS 실행 ──▶ API 호출 ──▶ 화면 표시
  ├── 빈 화면 (흰색) ──────────────────────────────────┤
  검색 크롤러: "이 페이지 내용 없음" ❌


[ Next.js SSR - 첫 로드 ]

서버 응답:
  <html>
    <body>
      <div id="root">
        <h1>상품 목록</h1>       ← 완성된 HTML
        <div>상품 A - 10,000원</div>
        <div>상품 B - 20,000원</div>
      </div>
      <script src="bundle.js">   ← Hydration용
    </body>
  </html>

타임라인:
  HTML 수신 ──▶ 화면 표시 ──▶ JS 다운로드 ──▶ Hydration (인터랙션 활성화)
  ├── 콘텐츠 바로 보임 ─┤
  검색 크롤러: "상품 A, 상품 B 발견!" ✅
```

### 예제 코드

```tsx
// app/products/page.tsx (Server Component)
// 이 코드는 서버에서 실행됨 → 완성된 HTML을 클라이언트에 반환

async function ProductsPage() {
  // 서버에서 데이터를 미리 가져옴
  const res = await fetch('https://api.backend.com/products', {
    next: { revalidate: 60 }, // 60초마다 재검증 (ISR)
  });
  const products = await res.json();

  return (
    <main>
      <h1>상품 목록</h1>
      {products.map((product) => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <p>{product.price.toLocaleString()}원</p>
        </div>
      ))}
    </main>
  );
}

export default ProductsPage;
```

---

## 요약 비교표

```
┌─────────────────────┬───────────────────────┬───────────────────────┐
│        항목          │     React SPA         │      Next.js          │
├─────────────────────┼───────────────────────┼───────────────────────┤
│ 서버                 │ 없음 (Nginx 필요)      │ Node.js 내장           │
├─────────────────────┼───────────────────────┼───────────────────────┤
│ 토큰 관리            │ localStorage (노출)    │ httpOnly 쿠키 (은닉)   │
├─────────────────────┼───────────────────────┼───────────────────────┤
│ API Key             │ JS 번들에 노출         │ 서버 환경변수 (은닉)    │
├─────────────────────┼───────────────────────┼───────────────────────┤
│ 다중 API 호출        │ 클라이언트 N번 요청    │ 서버에서 합쳐서 1번     │
├─────────────────────┼───────────────────────┼───────────────────────┤
│ 인증 리다이렉트       │ JS 실행 후 (깜빡임)   │ 미들웨어 (즉시)         │
├─────────────────────┼───────────────────────┼───────────────────────┤
│ SEO                 │ 빈 HTML (불리)         │ 완성된 HTML (유리)      │
├─────────────────────┼───────────────────────┼───────────────────────┤
│ 첫 화면 로딩         │ JS 실행까지 빈 화면    │ HTML 도착 즉시 표시     │
└─────────────────────┴───────────────────────┴───────────────────────┘
```
