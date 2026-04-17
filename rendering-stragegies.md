# Next.js 렌더링 전략 정리

> SSG, SSR, ISR, CSR의 개념과 차이, 그리고 실무에서 어떤 상황에 무엇을 선택해야 하는지 정리한 문서.

---

## 1. 네 가지 렌더링 방식 한눈에 보기

| 방식 | HTML 생성 시점 | 캐싱 | 초기 로딩 | SEO | 데이터 신선도 | 서버 부하 |
|------|---------------|------|----------|-----|--------------|----------|
| **SSG** (Static Site Generation) | 빌드 타임 1회 | 영구 | 🟢 가장 빠름 | 🟢 최고 | 🔴 빌드 시점 고정 | 🟢 제로 |
| **ISR** (Incremental Static Regeneration) | 빌드 + 주기적 재생성 | 있음 (stale-while-revalidate) | 🟢 빠름 | 🟢 최고 | 🟡 revalidate 주기만큼 지연 | 🟢 매우 낮음 |
| **SSR** (Server-Side Rendering) | 매 요청마다 | 없음(기본) | 🟡 보통 | 🟢 최고 | 🟢 항상 최신 | 🔴 매 요청마다 렌더링 |
| **CSR** (Client-Side Rendering) | 브라우저에서 | 없음 | 🔴 느림(스피너) | 🔴 나쁨 | 🟢 항상 최신 | 🟢 낮음 |

핵심 요점: **모두 "서버에서 HTML을 만든다"는 건 같다(CSR 제외). 차이는 "언제, 얼마나 자주 만드느냐"다.**

---

## 2. SSG (Static Site Generation)

### 개념
빌드 타임에 모든 HTML을 미리 만들어두고, 요청이 오면 완성된 HTML을 그대로 내려주는 방식. 서버는 렌더링 작업 없이 정적 파일만 서빙하면 되므로 TTFB(첫 바이트까지 걸리는 시간)가 매우 빠르고 CDN 캐싱에 최적이다.

### 동적 데이터는 어떻게 처리되나?
"동적 데이터"라도 **빌드 타임에 확정될 수 있는 데이터라면 미리 조립해서 HTML에 박아넣는다**. 예를 들어 블로그 글, 제품 카탈로그, 문서 같은 건 빌드할 때 API나 CMS에서 데이터를 가져와 HTML에 박제한다.

### Next.js App Router의 SSG

```tsx
// app/posts/[id]/page.tsx
export async function generateStaticParams() {
  const res = await fetch(`${process.env.API_BASE}/api/posts`);
  const posts = await res.json();
  return posts.map((p) => ({ id: String(p.id) }));
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const res = await fetch(`${process.env.API_BASE}/api/posts/${params.id}`);
  const post = await res.json();
  return <article><h1>{post.title}</h1><p>{post.body}</p></article>;
}
```

위 코드는 두 단계로 나눠서 SSG를 수행한다:

1. `generateStaticParams`: 빌드 타임에 "어떤 id들로 페이지를 미리 만들까?"를 Next.js에 알려준다.
2. `PostPage`: 각 id에 대해 빌드 타임에 한 번씩 실행되며, 상세 데이터를 fetch해서 완성된 HTML로 박제한다.

빌드가 끝나면 `/posts/1.html`, `/posts/2.html` 등이 본문까지 채워진 상태로 존재한다.

### 한계: 콘텐츠가 많을 때
게시판처럼 글이 10만 개 있는 사이트에 순수 SSG를 적용하면:
- 빌드 타임이 매우 길어짐
- 배포 아티팩트 크기 증가
- 글 하나 수정 시 전체 재빌드 필요

→ 이 경우 **ISR** 사용을 권장한다.

### Next.js의 "기본은 정적" 철학
Next.js App Router는 모든 페이지를 일단 SSG로 만들려고 시도한다. `fetch`가 있어도 자동으로 캐싱되어 SSG가 된다. 다음 신호가 감지되면 자동으로 동적(SSR)으로 전환된다:

- `cookies()`, `headers()`, `draftMode()` 호출
- `searchParams` 사용
- `fetch(url, { cache: 'no-store' })`
- `export const dynamic = 'force-dynamic'`

빌드 로그에서 확인 가능:
```
○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML
ƒ  (Dynamic)  server-rendered on demand
```

---

## 3. ISR (Incremental Static Regeneration)

### 개념
**"SSG를 주기적으로 다시 하는 것"**에 가까운 방식. SSG의 빠른 응답 속도를 유지하면서, 데이터 갱신도 가능하게 해준다.

### stale-while-revalidate 패턴
ISR은 HTTP 캐싱 표준(RFC 5861)의 `stale-while-revalidate` 패턴을 페이지 렌더링 레이어에 적용한 것이다.

```
t=0s:   빌드 완료, /posts/1 HTML 캐싱됨 (title: "첫글")
t=30s:  요청 → 캐시된 HTML 반환 (여전히 "첫글")
t=70s:  백엔드에서 title이 "수정된글"로 변경됨
t=75s:  요청 → 일단 캐시된 "첫글" HTML 반환 (사용자는 옛날 버전)
             → 백그라운드에서 재렌더링 시작
             → fetch로 "수정된글" 받아서 새 HTML 생성 → 캐시 교체
t=80s:  다음 요청 → "수정된글" HTML 반환
```

핵심: **SSR을 매번 하는 게 아니라, 주기적으로만 다시 렌더링해서 캐시를 바꾼다.** 100만 건 요청이 들어와도 실제 렌더링은 revalidate 주기에 한 번만 일어난다.

### 전략 1: 시간 기반 재검증
```tsx
export const revalidate = 60; // 60초마다 재검증
```

### 전략 2: On-demand 재검증 (즉시 갱신)
백엔드에서 데이터가 변경될 때 Next.js에 webhook으로 알려주는 방식.

```tsx
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const { postId } = await request.json();
  revalidatePath(`/posts/${postId}`); // 이 경로의 캐시를 즉시 무효화
  return Response.json({ revalidated: true });
}
```

### 게시판에 적합한 ISR 패턴

```tsx
export const revalidate = 60;          // 60초마다 재검증
export const dynamicParams = true;     // 빌드 때 없던 id도 동적 생성

export async function generateStaticParams() {
  // 인기 글 100개만 빌드 타임에 미리 생성
  const popular = await fetch(`${API}/api/posts/popular?limit=100`).then(r => r.json());
  return popular.map(p => ({ id: String(p.id) }));
}

export default async function PostPage({ params }) {
  const post = await fetch(`${API}/api/posts/${params.id}`).then(r => r.json());
  return <Article post={post} />;
}
```

이후 백엔드에서 글 수정 시 `revalidatePath('/posts/' + id)` webhook으로 즉시 갱신.

### ISR은 HTTP 캐싱의 확장이다

| | 생성 능력 | 공유 범위 | 무효화 권한 |
|---|---|---|---|
| 브라우저 캐시 | ❌ | 개인 | 서버 지시 수동 |
| CDN 캐시 | ❌ | 공용 | Purge API로 능동 가능 |
| **ISR** | ✅ | 공용 | 스스로 능동 |

ISR은 **"CDN 캐시에 생성 능력을 더한 것"**에 가깝다. 캐시 미스 시 CDN은 origin에 물어봐야 하지만, ISR은 직접 React를 실행해서 HTML을 만들어버린다. 즉 "CDN의 역할 + SSR의 역할을 한 레이어에 합친 것"이다.

---

## 4. SSR (Server-Side Rendering)

### 개념
매 요청마다 서버에서 HTML을 새로 렌더링하는 방식. 사용자별로 다르거나 실시간성이 중요한 페이지에 적합하다.

### 적합한 경우
- 로그인한 사용자 정보 ("환영합니다, OOO님")
- 실시간 재고/가격
- 사용자별 대시보드, 마이페이지
- 검색 결과 페이지 (아래 섹션 참고)

### 단점
- 매 요청마다 서버 렌더링 → 트래픽이 많으면 서버 부하
- TTFB가 SSG/ISR보다 느림

---

## 5. CSR (Client-Side Rendering)

### 개념
서버는 빈 껍데기 HTML만 주고, 브라우저에서 JS를 실행해서 화면을 그리는 방식.

### 적합한 경우
- SEO가 중요하지 않은 내부 대시보드
- 사용자 상호작용이 매우 많은 페이지 (실시간 편집기, 차트 툴 등)
- 검색 페이지의 결과 영역 (껍데기는 SSG로, 결과는 CSR로)

### 단점
- 첫 화면이 스피너 후에 나타남 (FCP 느림)
- SEO 약함 (크롤러가 JS 실행 전에 빈 HTML만 봄)

---

## 6. 캐싱의 한계: 검색 페이지 같은 무한 파라미터

### 문제
캐시는 **URL을 키로 삼아** 저장된다. URL이 다르면 완전히 다른 페이지로 취급되어 각각 캐싱된다.

```
캐시 저장소:
  "/posts/1"           → HTML_A
  "/posts/2"           → HTML_B
  "/search?q=react"    → HTML_C
  "/search?q=vue"      → HTML_D
```

검색 페이지는 **검색어가 무한히 다양**하다:
```
/search?q=react
/search?q=리액트 hooks
/search?q=ㅇㄻㄴㅇㄻㄴㅇ  (오타)
/search?q=asdfasdf
...
```

- SSG? 사용자가 뭘 검색할지 모르니 **불가능**
- ISR? 캐시 히트율이 거의 없어서 **효과 없음**. 저장소만 불어남

### 일반화: SSG/ISR이 잘 맞는 경우 vs 안 맞는 경우

| 특성 | 적합한 전략 |
|------|------------|
| 경로/쿼리 조합이 **유한**함 (게시글, 카테고리, 상품 상세) | ✅ SSG/ISR |
| 경로/쿼리 조합이 **무한**함 (검색, 자유 필터링) | ❌ SSG/ISR 의미 없음 → SSR or CSR |
| 사용자마다 내용이 다름 (마이페이지, 대시보드) | ❌ 캐싱 불가 → SSR or CSR |

### 검색 페이지의 실무 패턴

**패턴 1: SSR** — SEO 필요하고 서버 부하 감당 가능한 경우
```tsx
export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q ?? '';
  const results = await fetch(`${API}/api/search?q=${encodeURIComponent(q)}`).then(r => r.json());
  return <SearchResults query={q} results={results} />;
}
```
Next.js는 `searchParams`를 읽는 순간 자동으로 SSR로 전환한다.

**패턴 2: CSR** — SEO 불필요, 서버 부하 최소화
```tsx
'use client';
export default function SearchPage() {
  const params = useSearchParams();
  const q = params.get('q') ?? '';
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    if (!q) return;
    fetch(`/api/search?q=${encodeURIComponent(q)}`).then(r => r.json()).then(setResults);
  }, [q]);
  
  return <SearchResults query={q} results={results} />;
}
```

**패턴 3: 하이브리드** — 실무에서 가장 흔함 (구글, 네이버, 아마존 방식)
- 첫 페이지 로드는 SSR (SEO + 초기 로딩)
- 이후 페이지네이션/필터 변경은 CSR (부드러운 UX)

**패턴 4: 백엔드 레이어 캐싱** — 검색 트래픽은 인기 검색어에 몰리므로 Redis 등으로 API 응답을 캐싱
```tsx
async function searchPosts(q: string) {
  const cached = await redis.get(`search:${q}`);
  if (cached) return JSON.parse(cached);
  
  const results = await db.searchPosts(q);
  await redis.setex(`search:${q}`, 60, JSON.stringify(results)); // 60초
  return results;
}
```
페이지는 SSR로 매번 렌더링하되, API 레벨에서 캐시 히트가 나서 DB 부하가 줄어든다.

---

## 7. React (Vite) 단독 SSG: 왜 수동 스크립트가 필요한가

Next.js와 달리 React 자체는 UI 라이브러리일 뿐이라 라우팅/빌드/렌더링 파이프라인을 모른다. 그래서 Vite + React로 SSG를 하려면 **직접 프리렌더 스크립트를 작성**해야 한다.

### 프리렌더 파이프라인의 3가지 핵심 조각

1. **`entry-server.tsx`** — React를 HTML 문자열로 뽑는 진입점
   ```tsx
   import { renderToString } from 'react-dom/server';
   import App from './App';
   
   export function render(url: string) {
     return renderToString(<App url={url} />);
   }
   ```

2. **`scripts/prerender.mjs`** — 경로 목록 결정 + HTML 파일 저장
   ```js
   import fs from 'node:fs';
   import path from 'node:path';
   
   const template = fs.readFileSync('dist/index.html', 'utf-8');
   const { render } = await import('./dist-server/entry-server.js');
   
   // 빌드 타임에 API 호출 (Next.js의 generateStaticParams에 해당)
   const posts = await fetch('http://backend:8080/api/posts').then(r => r.json());
   const routes = ['/posts', ...posts.map(p => `/posts/${p.id}`)];
   
   for (const url of routes) {
     const appHtml = render(url);
     const html = template.replace('<!--ssr-outlet-->', appHtml);
     const filePath = `dist${url}/index.html`;
     fs.mkdirSync(path.dirname(filePath), { recursive: true });
     fs.writeFileSync(filePath, html);
   }
   ```

3. **`index.html` 템플릿** — 렌더링된 HTML을 주입할 자리 제공
   ```html
   <div id="root"><!--ssr-outlet--></div>
   ```

### Next.js와의 대응 관계

| 역할 | Next.js App Router | Vite + React |
|------|-------------------|--------------|
| 어떤 경로를 SSG할지 | 파일 시스템 기반 자동 감지 | `prerender.mjs`에서 직접 나열 |
| 동적 파라미터 수집 | `generateStaticParams()` | `fetch`로 직접 가져와 배열 생성 |
| 각 경로 렌더링 | 프레임워크가 자동 실행 | 반복문으로 `render(url)` 호출 |
| HTML 파일 저장 | 자동 | `fs.writeFileSync` 직접 호출 |
| ISR / 재검증 | 내장 | **없음** (재빌드만 가능) |
| Hydration 연결 | 자동 | `entry-client.tsx` 직접 작성 |

### 실무 주의사항
- **빌드 컨테이너가 backend에 접근 가능해야** (compose 네트워크 설정)
- **런타임엔 백엔드 불필요** — HTML이 이미 박제됨, `serve dist`로 정적 서빙만
- **ISR 없음** — 새 글 추가 시 전체 재빌드·재배포 필요. 변경이 드문 사이트(문서/블로그/마케팅 페이지)에 적합
- **대안 프레임워크**: Astro, Vike(vite-plugin-ssr), TanStack Start 등을 쓰면 Vite 생태계에서 Next.js 수준의 자동화를 얻을 수 있음

---

## 8. 의사결정 플로우차트

```
페이지 설계 시작
  │
  ├─ SEO가 중요한가?
  │   └─ No → CSR 검토
  │   └─ Yes ↓
  │
  ├─ 사용자마다 내용이 다른가?
  │   └─ Yes → SSR (또는 SSR + CSR 하이브리드)
  │   └─ No ↓
  │
  ├─ 경로/쿼리 조합이 유한한가?
  │   └─ No (검색 등) → SSR
  │   └─ Yes ↓
  │
  ├─ 데이터가 얼마나 자주 바뀌나?
  │   ├─ 거의 안 바뀜 (문서, 랜딩) → SSG
  │   ├─ 가끔 바뀜 (블로그, 상품 상세) → ISR (시간 기반)
  │   └─ 자주 바뀜 (게시판) → ISR (on-demand revalidate)
```

---

## 9. 핵심 요약

1. **SSG/ISR/SSR 모두 서버에서 HTML을 만든다. 차이는 "언제"다.**
    - SSG: 빌드 타임 1회
    - ISR: 빌드 + 주기적 재생성
    - SSR: 매 요청마다

2. **Next.js App Router는 "기본이 정적"이다.** 동적 신호(`cookies()`, `searchParams`, `cache: 'no-store'` 등)가 감지되면 자동으로 SSR로 전환된다.

3. **ISR은 HTTP 캐싱의 stale-while-revalidate 패턴을 렌더링 레이어에 적용한 것이다.** 브라우저/CDN이 리소스에 하던 걸, 서버가 스스로 생성한 페이지에 하는 것이라고 이해하면 된다.

4. **캐시 키는 URL이다.** 경로/쿼리 조합이 무한한 페이지(검색 등)는 SSG/ISR이 의미 없다. SSR + API 레벨 캐싱이 정답.

5. **React(Vite) 단독 SSG는 Next.js가 자동화해주던 작업을 수동으로 스크립트화하는 것**이다. 개념은 동일하나 ISR이 없다는 한계가 있다.