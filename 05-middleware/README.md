# 05-middleware — 인증 리다이렉트 깜빡임

## 증명하려는 것

`/dashboard` 비로그인 접근 시:
- React: JS 로드 → useEffect → 토큰 없음 판단 → `/login` 이동. 이 사이에 **빈 화면 또는 대시보드 레이아웃 깜빡임** 발생.
- Next: `middleware.ts`가 HTTP 단계에서 302 → 대시보드 HTML은 브라우저에 도달조차 안 함. 깜빡임 없음.

## 서비스

| 서비스 | 포트 |
|---|---|
| backend | 8080 |
| react | 3501 |
| next | 3502 |

## 페이지

- `/login` — "로그인" 버튼 누르면 쿠키/localStorage에 토큰 세팅
- `/dashboard` — 보호된 페이지
- `/` — Home (자유 접근)

## 실행

```bash
cd 05-middleware
docker compose up --build
```

## 실험 절차

1. DevTools 네트워크 탭 열기 → **Slow 3G** throttling
2. 로그아웃 상태에서 `/dashboard` 직접 접속
3. React(3501): 대시보드 레이아웃이 잠깐 보였다가 `/login`으로 점프 → **깜빡임**
4. Next(3502): 대시보드 URL이 즉시 `/login`으로 바뀜 → **깜빡임 없음**

## 예상 결과

```bash
# HTTP 레벨에서도 차이 확연
curl -I http://localhost:3501/dashboard
# 200 OK (빈 대시보드 HTML 반환 - JS가 판단)

curl -I http://localhost:3502/dashboard
# 307 Temporary Redirect, Location: /login
```

## 학습 포인트

- 미들웨어는 **HTTP 요청 단계**에서 동작
- SPA의 보호 라우트는 "JS가 실행되어야 판단 가능"이라는 근본 한계
- 서버에서 즉시 튕기는 것이 사용자 경험과 보안 모두에서 유리
