# 03-ssg/react — Vite 프리렌더 스크립트

## 목적

빌드 타임에 `/posts`, `/posts/1`~`/posts/5` 각각을 HTML로 프리렌더.

## 구조

```
react/
├── src/
│   ├── App.tsx
│   ├── entry-server.tsx
│   └── pages/
├── scripts/prerender.mjs   # 핵심: 각 경로별 HTML 생성
├── vite.config.ts
└── Dockerfile
```

## 프리렌더 흐름

1. `vite build --ssr` → 서버 엔트리 번들 생성
2. `npm run build` → 클라 번들 생성 + `index.html` 템플릿
3. `node scripts/prerender.mjs`
   - 빌드 시점에 `fetch(http://backend:8080/api/posts)` → id 리스트 확보
   - 각 id에 대해 `renderToString(<App url="/posts/1" />)` → HTML 주입 → `dist/posts/1/index.html` 저장
4. 런타임: `serve dist`

## 예상 결과

```bash
docker exec react cat dist/posts/1/index.html | grep "첫 글"  # ✅
docker exec react cat dist/posts/2/index.html | grep "두번째 글"  # ✅
```

## 주의

- 빌드 컨테이너에서 `backend`에 접근할 수 있도록 compose에서 같은 네트워크
- 빌드 단계에서만 백엔드 호출, 런타임엔 정적 서빙만
