# 01-routing — 라우팅 + Nginx 래핑 + API Key 노출

## 증명하려는 것

1. React SPA는 빌드 결과가 정적 파일이라 **서버 없이는 `/about` 같은 경로가 404**다.
2. Nginx가 있어도 `try_files` 없이는 같은 404를 낸다.
3. `try_files $uri $uri/ /index.html`로 해결된다.
4. Next.js는 Node 서버가 있으므로 새로고침/직접 접속이 그냥 된다.
5. React는 API Key를 클라이언트 번들에 박아야 하므로 브라우저 DevTools에 노출된다. Next.js는 Route Handler를 통해 서버에서만 키를 사용하므로 은닉된다.

## 서비스 구성

| 서비스 | 포트 | 구성 |
|---|---|---|
| backend | 8080 | `../backend` |
| react-bare | 3001 | Vite build → `serve` (Nginx 없음) |
| react-nginx-broken | 3002 | Nginx, `try_files` 없음 |
| react-nginx-fixed | 3003 | Nginx, `try_files` 있음 |
| next-app | 3004 | `next start` |

모든 React/Next 앱은 **같은 4페이지 구조**:
- `/` Home
- `/about` About
- `/posts` 글 목록 (`/api/posts` 호출)
- `/weather` 날씨 (`/api/weather?city=seoul` 호출, API Key 필요)

## 실행

```bash
cd 01-routing
docker compose up --build
```

## 체크리스트 (예상 결과)

### 라우팅

| 실험 | react-bare:3001 | react-nginx-broken:3002 | react-nginx-fixed:3003 | next-app:3004 |
|---|---|---|---|---|
| `/` 진입 후 Link로 `/about` | ✅ | ✅ | ✅ | ✅ |
| `/about` 직접 접속 | ❌ 404 | ❌ 404 | ✅ | ✅ |
| `/about` 새로고침(F5) | ❌ 404 | ❌ 404 | ✅ | ✅ |
| `curl http://localhost:PORT/posts` HTML에 글 제목 포함 | ❌ (빈 root) | ❌ (빈 root) | ❌ (빈 root) | ✅ |

### API Key 노출

```bash
# React 빌드 결과물에 키가 박혀있는지
docker exec react-bare grep -r "demo-secret-key" /app/dist
# 예상: 매치됨 (번들에 박힘)

# Next .next 서버 번들엔 있지만 클라 번들엔 없음
docker exec next-app grep -r "demo-secret-key" /app/.next/static
# 예상: 매치 없음
```

### DevTools 네트워크 탭

- React(`:3001`~`:3003`)의 `/weather` 진입 시
  - 요청: `http://localhost:8080/api/weather?city=seoul`
  - 헤더: `X-API-Key: demo-secret-key` ← 브라우저 요청에 그대로 노출
- Next(`:3004`)의 `/weather` 진입 시
  - 요청: `/api/weather?city=seoul` (자기 서버)
  - 헤더에 API Key 없음 (서버 Route Handler에서 주입됨)

## 검증 스크립트 (선택)

`check.sh`로 위 실험을 자동화 가능. 각 서비스 포트에 대해 `curl` → HTTP 상태 코드 매트릭스 출력.

## 폴더

```
01-routing/
├── README.md
├── docker-compose.yml
├── react-bare/
├── react-nginx-broken/
├── react-nginx-fixed/
└── next-app/
```

각 하위 폴더의 README 참조.
