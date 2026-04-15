# 08-streaming/react — renderToPipeableStream 수동

## 구현

```ts
// server/index.ts
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

```tsx
// App.tsx
<Layout>
  <Suspense fallback={<SkeletonList />}>
    <PostsList />  {/* 여기가 2초 걸림 */}
  </Suspense>
</Layout>
```

## 주의

- 서버에서 데이터 fetch는 Suspense-compatible한 방식으로 — `use()` hook 또는 리소스 패턴
- bootstrap scripts가 hydration 담당
