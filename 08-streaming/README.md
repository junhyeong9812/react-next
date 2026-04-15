# 08-streaming — Streaming SSR / Suspense

## 증명하려는 것

느린 API(2초 지연)에서:
- Naive SSR: 전체 HTML 완성까지 2초간 빈 화면
- Streaming: 껍데기(레이아웃, 헤더) 먼저 전송, 본문은 준비되는 대로 흘려보냄

React로도 `renderToPipeableStream` + `<Suspense>`로 가능. Next는 `loading.tsx` 파일 컨벤션으로 라우트 단위 자동 제공.

## 서비스

| 서비스 | 포트 |
|---|---|
| backend | 8080 (이 phase는 2초 지연 엔드포인트 추가: `/api/slow-posts`) |
| react | 3801 |
| next | 3802 |

## 페이지

- `/posts-slow` — 레이아웃(헤더/사이드바)은 즉시, 본문 리스트는 2초 후

## 실행

```bash
cd 08-streaming
docker compose up --build
```

## 실험

1. 브라우저에서 `/posts-slow` 진입
2. **네트워크 탭의 HTML 응답** 타이밍 관찰
3. 껍데기 HTML이 즉시 오고, 본문이 나중에 덧붙는지 확인

## 예상 결과

```bash
# curl --no-buffer로 스트림 관찰
curl --no-buffer -s http://localhost:3801/posts-slow
# 첫 1초: <html>...<header>...</header>...<!--$?--><template...>
# 2초 후: <template>...실제 본문...</template>

curl --no-buffer -s http://localhost:3802/posts-slow
# 동일한 점진적 도착
```

- 양쪽 다 스트리밍 가능
- 차이: Next는 `loading.tsx` 파일만 두면 자동, React는 Suspense fallback을 직접 구성 + 서버에서 pipeable stream 관리

## 학습 포인트

- Streaming SSR은 TTFB 개선 + First Contentful Paint 앞당김
- Suspense 경계가 스트리밍의 단위
- Next의 편의성: 파일 컨벤션만으로 자동 경계
