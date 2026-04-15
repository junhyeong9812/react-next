# 07-seo-metadata — `<head>` 관리와 크롤러 시점 HTML

## 증명하려는 것

검색엔진/SNS 공유 크롤러는 `curl`처럼 **초기 HTML**만 본다.
- React SPA: `<title>`, `<meta og:*>`가 JS 실행 후 주입됨 → 크롤러 눈엔 빈 값
- Next.js: `metadata` export로 서버 렌더링 시점에 `<head>` 완성

## 서비스

| 서비스 | 포트 |
|---|---|
| backend | 8080 |
| react | 3701 (react-helmet 사용) |
| next | 3702 (metadata export) |

## 페이지

- `/posts/1`, `/posts/2` — 각 글마다 다른 `<title>`과 `og:title`, `og:description` 세팅

## 실행

```bash
cd 07-seo-metadata
docker compose up --build
```

## 예상 결과

```bash
# React — 초기 HTML엔 없음
curl -s http://localhost:3701/posts/1 | grep -E "<title>|og:title"
# <title>기본 타이틀</title>
# og:title 메타 없음

# Next — 초기 HTML에 이미 포함
curl -s http://localhost:3702/posts/1 | grep -E "<title>|og:title"
# <title>첫 글 — 블로그</title>
# <meta property="og:title" content="첫 글" />
# <meta property="og:description" content="..." />
```

## 학습 포인트

- Google, Kakao, Slack, Twitter 크롤러는 JS를 실행하지 않거나 제한적으로 실행
- SNS 공유 시 OG 태그가 SSR로 박혀야 썸네일/제목이 제대로 보임
- `<head>`는 SSR의 가장 가시적 효과 중 하나

## 관련 phase

- 02-ssr: 본문 HTML 포함 여부
- 08-streaming: `<head>`는 먼저 플러시, body는 스트리밍
