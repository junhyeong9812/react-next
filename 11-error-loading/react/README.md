# 11-error-loading/react — 수동 경계

## 구현

```tsx
// ErrorBoundary.tsx (클래스)
class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return <div>에러: {this.state.error.message} <button onClick={() => this.setState({ error: null })}>재시도</button></div>;
    }
    return this.props.children;
  }
}

// App.tsx
<ErrorBoundary>
  <Suspense fallback={<Loading />}>
    <Routes>
      <Route path="/posts/:id" element={<PostDetail />} />
    </Routes>
  </Suspense>
</ErrorBoundary>
```

## 특징

- 경계를 **어디에 둘지** 개발자가 결정
- 라우트별 다른 경계를 원하면 각 라우트마다 감싸야 함
- async 에러는 Error Boundary가 기본 캐치 못 함 → 직접 throw하거나 전용 라이브러리 필요
