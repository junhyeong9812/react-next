# React vs Next.js 핵심 차이 정리

## 1. 빌드 결과물의 차이

### React (CRA / Vite)
- `npm run build` → **정적 파일**(HTML, JS, CSS)만 생성
- 이 파일을 브라우저에 전달하려면 **별도의 웹서버(Nginx 등)가 필요**
- 빌드 결과물 자체에는 서버가 없음

### Next.js
- `next build` → 빌드 후 `next start`로 **자체 Node.js 서버**가 실행됨
- 별도의 Nginx 없이도 라우팅, SSR, API 처리가 가능
- 프로덕션에서 Nginx를 쓰더라도 리버스 프록시 용도일 뿐, 라우팅은 Node.js가 담당

---

## 2. 라우팅 방식의 차이

### React SPA 라우팅
1. `index.html` 로드 → JS 번들 실행 → React Router가 URL을 파싱해서 컴포넌트 렌더링
2. **앱 내 Link 클릭** → JS가 History API로 URL만 바꾸고 컴포넌트를 갈아끼움 (서버 요청 없음) ✅
3. **브라우저에 URL 직접 입력 / 새로고침** → 서버에 해당 경로 요청 → 파일이 없으므로 **404 에러** ❌

### Next.js 라우팅
1. **브라우저에 URL 직접 입력 / 새로고침** → Node.js 서버가 해당 페이지를 렌더링해서 HTML 반환 ✅
2. **앱 내 Link 클릭** → 클라이언트 JS가 필요한 데이터만 fetch 후 컴포넌트 렌더링 (SPA처럼 동작) ✅

---

## 3. React + Nginx에서 라우팅이 안 되는 이유

`/about`으로 직접 접속하면 Nginx는 서버에서 `/about` 파일을 찾는다.
하지만 React 빌드 결과물에는 `index.html` 하나뿐이고 `/about.html`은 존재하지 않는다.
→ **404 반환**

### 해결: Nginx fallback 설정

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

"요청한 파일이 없으면 무조건 `index.html`을 반환하라"는 설정.
→ `index.html`이 로드되면 JS가 실행되고, React Router가 URL을 보고 맞는 페이지를 렌더링.

---

## 4. CSR vs SSR

### React SPA → 순수 CSR
- 첫 로드 시 **빈 HTML** → JS 다운로드 → JS 실행 후 화면 렌더링
- 모든 렌더링이 브라우저(클라이언트)에서 이루어짐

### Next.js → SSR + CSR 혼합
- **첫 요청**: Node.js 서버가 HTML을 완성해서 내려줌 (SSR)
- **이후 네비게이션**: 클라이언트 JS가 처리 (CSR)
- 이 과정을 **Hydration**이라고 함
- SEO도 되고, 페이지 전환도 빠른 이유

---

## 5. 핵심 한 줄 요약

> **첫 `index.html`만 브라우저에 도착하면, 이후 라우팅은 JS(React Router)가 브라우저 안에서 처리한다.**
> React는 그 첫 `index.html`을 전달할 서버(Nginx)가 별도로 필요하고,
> Next.js는 자체 Node.js 서버가 이를 포함한 모든 요청을 처리한다.

---

## 6. 배포 구조 비교

```
[ React SPA ]
브라우저 → Nginx(정적 파일 서빙 + fallback) → dist/index.html → JS → React Router

[ Next.js ]
브라우저 → Node.js 서버(next start) → SSR 렌더링 or 정적 페이지 반환 → Hydration → 클라이언트 라우팅
```
