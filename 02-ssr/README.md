# 02-ssr — Server Side Rendering

## 증명하려는 것

React도 SSR을 할 수 있다. 다만 직접 Express 서버를 세우고 `renderToPipeableStream`을 다뤄야 한다. Next.js는 Server Component async 함수만으로 동일 결과.

**양쪽 모두 SSR 성공을 목표로 한다** (차이는 "구현 복잡도"지 "할 수 있냐 없냐"가 아님).

## 서비스

| 서비스 | 포트 | 스택 |
|---|---|---|
| backend | 8080 | `../backend` |
| react | 3101 | Express + React 18 + `renderToPipeableStream` |
| next | 3102 | Next.js App Router (Server Component) |

## 페이지

- `/posts` 글 목록 — `/api/posts` (300ms 지연) 서버에서 미리 fetch하여 HTML 완성
- `/posts/[id]` 글 상세

## 실행

```bash
cd 02-ssr
docker compose up --build
```

## 예상 결과

```bash
# 양쪽 다 초기 HTML에 글 제목 포함
curl -s http://localhost:3101/posts | grep "첫 글"   # ✅ 매치
curl -s http://localhost:3102/posts | grep "첫 글"   # ✅ 매치
```

| 항목 | react (Express SSR) | next |
|---|---|---|
| 구현 코드량 | Express 서버 + vite-ssr 설정 ~150줄 | `async function Page()` 한 파일 |
| 초기 HTML에 콘텐츠 | ✅ | ✅ |
| Hydration | 수동 `hydrateRoot` 호출 | 자동 |
| 개발 서버 핫 리로드 | 별도 설정 필요 | `next dev` 내장 |

## 학습 포인트

- **"React는 SSR을 못한다"가 아니라 "Next는 그 과정을 프레임워크 레벨로 흡수했다"**
- Express 코드를 실제로 짜보면 Next가 뭘 해주는지 체감됨
