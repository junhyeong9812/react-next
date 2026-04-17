# React Streaming SSR 정리

> `renderToPipeableStream`을 활용한 HTML 스트리밍의 개념, 동작 원리, Suspense와 스켈레톤의 역할을 정리한 문서.

---

## 1. Streaming SSR이란?

### 기존 방식 (renderToString)의 한계
```
요청 → [모든 데이터 fetch 완료까지 대기] → 완성된 HTML 전체 반환
         └─ 이 동안 사용자는 흰 화면만 봄
```
가장 느린 컴포넌트 하나가 전체 응답을 막는다. 예를 들어 댓글 API가 3초 걸리면, 0.1초면 렌더링 가능한 헤더까지도 3초 동안 못 본다.

### Streaming SSR (renderToPipeableStream)
```
요청 → 즉시 shell HTML 반환 (헤더, 레이아웃, 스켈레톤)
       └─ 사용자는 수십ms 만에 뭔가를 봄
     → 느린 부분은 렌더링되는 대로 조각조각 스트리밍
       └─ 브라우저가 스켈레톤을 실제 콘텐츠로 교체
```

**핵심 철학**: *"완벽한 페이지를 늦게 주는 것보다, 불완전해도 빨리 뭔가 보여주고 점진적으로 완성하는 것이 낫다."*

---

## 2. 기본 구조

### 서버 코드

```tsx
import { renderToPipeableStream } from 'react-dom/server';

app.get('/posts-slow', (req, res) => {
  const { pipe } = renderToPipeableStream(
    <App url={req.url} />,
    {
      bootstrapScripts: ['/client.js'],
      onShellReady() {
        res.setHeader('Content-Type', 'text/html');
        pipe(res);
      },
    }
  );
});
```

### 앱 코드

```tsx
<Layout>
  <Suspense fallback={<SkeletonList />}>
    <PostsList />  {/* 2초 걸리는 컴포넌트 */}
  </Suspense>
</Layout>
```

---

## 3. Suspense와 스켈레톤은 왜 "필수"인가

Streaming SSR이 성립하려면 React에게 **"아직 준비 안 된 부분에 뭘 보여줄지"**를 알려줘야 한다. 그 자리를 `Suspense`의 `fallback`이 채운다.

### Suspense 없는 경우
```tsx
<Layout>
  <PostsList />  {/* Suspense 없이 2초 걸리는 컴포넌트 */}
</Layout>
```
→ React가 어디에 경계가 있는지 모르니, PostsList 완료까지 shell도 못 보낸다. **스트리밍의 이점이 사라져 `renderToString`과 동일**해진다.

### Suspense 있는 경우
```tsx
<Layout>
  <Suspense fallback={<SkeletonList />}>
    <PostsList />
  </Suspense>
</Layout>
```
→ **Suspense boundary = 스트리밍 단위**. "여기까지는 먼저 보내고, 이 안쪽은 나중에 채워 넣겠다"는 표시가 된다.

---

## 4. 동작 순서 상세

```
t=0ms    서버 렌더링 시작
          └─ <Layout>은 즉시 렌더 가능 → HTML 생성
          └─ <PostsList>는 fetch 중 → "아직 못함" 신호 (Suspense 걸림)

t=50ms   서버가 shell HTML을 브라우저로 flush:
          <Layout>
            <div id="B:0"><SkeletonList /></div>  ← fallback이 들어감
          </Layout>
          └─ 사용자 화면: 레이아웃 + 스켈레톤이 이미 보임

t=2000ms PostsList fetch 완료, 서버에서 렌더링 끝
          └─ 서버가 추가 청크를 스트리밍:
             <template id="S:0">...실제 PostsList HTML...</template>
             <script>$RC("B:0", "S:0")</script>  ← 스켈레톤을 교체하는 스크립트
          └─ 사용자 화면: 스켈레톤이 실제 데이터로 교체됨
```

---

## 5. fallback에 뭘 넣을 수 있나

```tsx
<Suspense fallback={<SkeletonList />}>       // 스켈레톤 박스 (권장)
<Suspense fallback={<Spinner />}>            // 스피너
<Suspense fallback={<p>로딩 중...</p>}>       // 텍스트
<Suspense fallback={<div style={{ height: 400 }} />}>  // 공간만 차지
<Suspense fallback={null}>                   // 아무것도 안 보임 (UX 나쁨)
```

### 스켈레톤이 가장 권장되는 이유

| 이유 | 설명 |
|------|------|
| **CLS 방지** | 빈 공간에서 갑자기 콘텐츠가 나타나면 레이아웃이 흔들림. 스켈레톤이 실제 크기만큼 공간을 미리 차지하면 흔들림 없음 |
| **인지 로딩 시간 감소** | 뭔가 구조가 보이면 "로딩 중이구나" 납득하고 덜 답답해함 |
| **콘텐츠 예측 가능성** | 실제 UI가 뭐가 올지 미리 암시 |

---

## 6. 여러 Suspense로 쪼개면 더 강력해진다

스트리밍의 진짜 매력은 여러 Suspense 경계를 쓸 때 드러난다.

```tsx
<Layout>
  <Suspense fallback={<HeaderSkeleton />}>
    <Header />  {/* 0.5초 */}
  </Suspense>
  
  <Suspense fallback={<PostsSkeleton />}>
    <PostsList />  {/* 2초 */}
  </Suspense>
  
  <Suspense fallback={<CommentsSkeleton />}>
    <Comments />  {/* 3초 */}
  </Suspense>
</Layout>
```

타임라인:

```
t=0ms      shell + 3개 스켈레톤 모두 스트리밍 → 사용자는 레이아웃 봄
t=500ms    Header 완료 → 헤더만 교체 (나머지는 아직 스켈레톤)
t=2000ms   PostsList 완료 → 글 목록 교체 (댓글은 아직 스켈레톤)
t=3000ms   Comments 완료 → 마지막 교체
```

**가장 느린 3초짜리 댓글이 전체 응답을 막지 않는다.** 부분 부분이 준비되는 대로 단계적으로 채워진다. 이것이 스트리밍 SSR의 핵심 가치다.

---

## 7. onShellReady vs onAllReady

서버 쪽에서 "언제 스트리밍을 시작할지" 결정하는 두 가지 콜백.

```tsx
renderToPipeableStream(<App />, {
  bootstrapScripts: ['/client.js'],
  
  onShellReady() {
    // Suspense 밖의 것들이 렌더되면 호출 (스켈레톤은 이미 들어감)
    res.setHeader('Content-Type', 'text/html');
    pipe(res);  // 즉시 스트리밍 시작, Suspense 내부는 이후에 흘려보냄
  },
  
  onAllReady() {
    // 모든 Suspense 내부까지 완료되면 호출 (스트리밍 의미 없음)
    // 크롤러/봇에게 완성본을 한 번에 주고 싶을 때 사용
  },
});
```

### 실무 활용 패턴
- **일반 사용자**: `onShellReady` → 스트리밍 이득 획득
- **크롤러 감지 시**: `onAllReady` → SEO용 완성본 제공

---

## 8. 서버 데이터 fetch는 Suspense-compatible해야 한다

일반 `await fetch`를 컴포넌트 안에서 쓰면 Suspense가 작동하지 않는다. React가 "얘가 기다리고 있음"을 감지할 방법이 없기 때문.

```tsx
// ❌ Suspense가 감지 못함 (useEffect는 서버에서 실행 안 됨)
function PostsList() {
  const [posts, setPosts] = useState([]);
  useEffect(() => { fetch('/api/posts').then(setPosts); }, []);
  return <ul>...</ul>;
}

// ✅ React 19의 use hook
function PostsList() {
  const posts = use(fetchPosts());
  return <ul>{posts.map(...)}</ul>;
}

// ✅ 리소스 패턴 (React 18)
const resource = createResource(fetchPosts());
function PostsList() {
  const posts = resource.read();  // 데이터 없으면 Promise를 throw
  return <ul>...</ul>;
}
```

### 동작 원리
**Promise가 throw되면** React가 이걸 잡아채서 가장 가까운 Suspense boundary의 fallback(스켈레톤)을 보여준다. Promise가 resolve되면 다시 렌더링해서 실제 콘텐츠를 보여준다.

> Next.js App Router는 이 래핑을 프레임워크가 자동으로 해준다. 그냥 `await fetch` 쓰면 됨. 수동 구현에서는 `use()` hook이나 리소스 패턴을 직접 써야 한다.

---

## 9. Bootstrap Scripts와 Hydration

`bootstrapScripts: ['/client.js']`가 hydration을 담당한다.

```
서버: HTML 스트리밍 (스켈레톤 → 실제 콘텐츠 교체)
       ↓
브라우저: HTML을 받아서 화면에 그림 (정적, 이벤트 없음)
       ↓
bootstrap script 로드 → hydrateRoot 실행
       ↓
React가 기존 DOM에 이벤트 핸들러를 "붙임"
       ↓
이제 인터랙티브하게 작동
```

### Selective Hydration
Suspense로 쪼개진 각 영역이 **준비되는 순서대로 개별적으로 hydration**된다.
- 댓글이 아직 스트리밍 중이어도, 이미 도착한 헤더와 글 목록은 먼저 hydration되어 클릭 가능
- 사용자가 클릭한 영역이 우선순위를 얻어서 먼저 hydration되기도 함

---

## 10. 전체 퍼즐 맞추기

Streaming SSR이 제대로 작동하려면 **4가지 조각**이 모두 필요하다:

| 조각 | 역할 | 없으면? |
|------|------|---------|
| `renderToPipeableStream` | 스트리밍 가능한 렌더러 | 기존 `renderToString`처럼 전체 대기 |
| `Suspense` 경계 | 스트리밍 단위 지정 | 스트리밍 불가, 한 번에 다 보냄 |
| `fallback` (스켈레톤) | 준비 전 보여줄 UI | boundary만 있고 내용 없음 |
| Suspense-compatible fetch (`use`, 리소스 패턴) | Promise throw로 Suspense 트리거 | 기다림 감지 불가, fallback 안 나옴 |

하나라도 빠지면 스트리밍이 성립하지 않는다.

---

## 11. Next.js App Router와의 관계

Next.js App Router는 위 4가지 조각을 모두 프레임워크 레벨에서 자동 처리한다.

```tsx
// Next.js App Router
export default async function Page() {
  const posts = await fetch(...).then(r => r.json());
  return <PostsList posts={posts} />;
}

// loading.tsx를 같은 폴더에 두면 자동으로 Suspense fallback으로 적용
// app/posts/loading.tsx
export default function Loading() {
  return <SkeletonList />;
}
```

내부적으로 Next.js가:
1. `renderToPipeableStream` 사용
2. 페이지 컴포넌트를 자동으로 Suspense로 감쌈
3. `loading.tsx`를 fallback으로 주입
4. `fetch`를 Suspense-compatible하게 래핑

해주기 때문에 개발자는 `loading.tsx` 파일 하나만 만들면 스트리밍이 작동한다. 수동 구현 시에는 이 모든 걸 직접 조립해야 한다.

---

## 12. 핵심 요약

1. **Streaming SSR은 "불완전해도 빨리 보여주고 점진적으로 완성"하는 전략**이다.
2. **스켈레톤(Suspense fallback)은 필수**다. 이게 없으면 스트리밍할 "경계"가 없어서 한 번에 다 보내는 구식 방식이 된다.
3. **Suspense boundary = 스트리밍 단위**. 여러 개로 쪼갤수록 더 세밀한 점진적 렌더링이 가능하다.
4. **가장 느린 컴포넌트가 전체를 막지 않는다**. 각 boundary는 독립적으로 준비되고 교체된다.
5. **스켈레톤은 UX 역할도 중요**하다. CLS 방지, 인지 로딩 시간 감소, 콘텐츠 예측 가능성 제공.
6. **서버 데이터 fetch는 Suspense-compatible해야** 한다 (`use` hook 또는 리소스 패턴).
7. **Bootstrap scripts로 hydration 연결** — Selective Hydration 덕분에 준비된 영역부터 인터랙티브해진다.
8. **Next.js App Router는 이 모든 것을 자동화**한다. 수동 구현은 학습/특수 목적에 적합.