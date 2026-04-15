# react-nginx-fixed — Nginx + try_files fallback

## 목적

`try_files`로 SPA 라우팅을 해결하는 실전 설정을 보여준다.

## Nginx 설정 (`nginx.conf`)

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 예상 결과

| 행위 | 결과 |
|---|---|
| `/about` 직접 접속/F5 | ✅ About 렌더 |
| `curl http://localhost:3003/` | 여전히 빈 `<div id="root">` (SSR이 아니라 fallback일 뿐) |
| `curl http://localhost:3003/about` | 같은 index.html 반환 → JS 실행 후 React Router가 `/about` 파싱 |
| API Key 노출 | **여전히 번들 박제됨** (fallback과 무관) |

## 학습 포인트

- fallback은 "없는 파일 요청 시 index.html 주라"는 단순 규칙
- SSR이 아니라 **모두 같은 index.html**을 돌려주고, 라우팅은 여전히 클라이언트 JS가 수행
- `curl`로 HTML을 받아보면 SEO 관점에서 여전히 빈 페이지임이 드러남 → 07-seo-metadata에서 더 파고듦
