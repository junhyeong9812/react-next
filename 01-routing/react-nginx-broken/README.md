# react-nginx-broken — Nginx + try_files 없음

## 목적

"Nginx만 쓰면 되겠지"가 틀렸다는 걸 보여준다. Nginx에 SPA fallback이 없으면 `/about`은 여전히 404.

## 스택

- Vite + React 18 + React Router v6 (react-bare와 **동일한 소스**를 별도 복사)
- 멀티스테이지: node build → nginx 이미지로 복사

## Nginx 설정 (`nginx.conf`)

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        # try_files 의도적으로 없음
    }
}
```

## 환경변수

react-bare와 동일 (빌드 타임 `VITE_API_BASE`, `VITE_API_KEY`).

## 예상 결과

| 행위 | 결과 |
|---|---|
| `/` 접속 | Home 렌더 |
| Link로 `/about` 이동 | About 렌더 |
| `/about` 직접 접속/F5 | **404 (Nginx 기본 404 페이지)** |
| Nginx 로그 확인 | `"GET /about" 404` |

`docker compose logs react-nginx-broken` 로 404 로그를 직접 보는 것이 이 서비스의 핵심 체감 포인트.
