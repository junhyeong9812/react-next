# 07-seo-metadata/react — react-helmet

## 구현

```tsx
import { Helmet } from 'react-helmet-async';

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE}/api/posts/${id}`)
      .then(r => r.json()).then(setPost);
  }, [id]);

  return (
    <>
      <Helmet>
        <title>{post?.title ?? '로딩 중'} — 블로그</title>
        <meta property="og:title" content={post?.title ?? ''} />
        <meta property="og:description" content={post?.body?.slice(0, 100) ?? ''} />
      </Helmet>
      <article>...</article>
    </>
  );
}
```

## 한계

- `<head>` 주입이 **JS 실행 + fetch 완료 후**
- 크롤러가 JS를 실행하지 않거나, 실행해도 기다려주지 않음
- 초기 HTML엔 `<title>기본 타이틀</title>`만 있음

## 예상 결과

```bash
curl -s http://localhost:3701/posts/1 | grep og:
# (매치 없음)
```
